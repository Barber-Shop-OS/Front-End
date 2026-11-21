// FE-42: banner de cookies, GA4 só após consentimento e registro da escolha na API (BE-58).
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { API, renderWithApp, server } from '@/test/render';

import { __resetAnalyticsForTests, sanitizePath } from '../analytics';
import { __resetConsentForTests, openCookiePreferences, STORAGE_KEY } from '../consentStore';
import { CookieConsentBanner } from '../CookieConsentBanner';

vi.mock('@/config/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/config/env')>()),
  GA_MEASUREMENT_ID: 'G-TEST123',
  COOKIE_POLICY_VERSION: '2026-11',
}));

type Recorded = { consent_id: string; policy_version: string; analytics: boolean; action: string };

const recordConsents = () => {
  const bodies: Recorded[] = [];
  server.use(
    http.post(`${API}/consents/cookies`, async ({ request }) => {
      bodies.push((await request.json()) as Recorded);
      return HttpResponse.json({ id: bodies.length }, { status: 201 });
    })
  );
  return bodies;
};

const gaScript = () => document.querySelector('script[data-analytics="ga4"]');
const dataLayerCalls = () => (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));

beforeEach(() => {
  window.localStorage.clear();
  document.cookie = '_ga=; Max-Age=0; path=/';
  document.cookie = '_ga_TEST123=; Max-Age=0; path=/';
  __resetConsentForTests();
  __resetAnalyticsForTests();
});

describe('sanitizePath', () => {
  it.each([
    ['/convite/9f8a7b6c5d4e3f2a1b0c', '/convite/:token'],
    ['/dashboard/clientes/123', '/dashboard/clientes/:id'],
    ['/cliente/agendamentos/5b1f3c2e-8a4d-4f6b-9c1e-2d3a4b5c6d7e', '/cliente/agendamentos/:id'],
    ['/verify-email?token=abc', '/verify-email'],
    ['/b/navalha-de-ouro/agendar', '/b/navalha-de-ouro/agendar'],
  ])('%s → %s', (input, expected) => {
    expect(sanitizePath(input)).toBe(expected);
  });
});

describe('banner de cookies', () => {
  it('nada do Google carrega antes da escolha; Aceitar carrega o GA4, registra e envia o page view sem token', async () => {
    const bodies = recordConsents();
    const user = userEvent.setup();
    renderWithApp(<CookieConsentBanner />, { route: '/convite/9f8a7b6c5d4e3f2a1b0c' });

    const banner = screen.getByRole('region', { name: 'Sua privacidade' });
    expect(gaScript()).toBeNull();
    expect(window.dataLayer).toBeUndefined();

    await user.click(within(banner).getByRole('button', { name: 'Aceitar' }));

    expect(screen.queryByRole('region', { name: 'Sua privacidade' })).not.toBeInTheDocument();
    expect(gaScript()?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    const calls = dataLayerCalls();
    expect(calls).toContainEqual(['consent', 'default', expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied' })]);
    expect(calls).toContainEqual(['config', 'G-TEST123', expect.objectContaining({ send_page_view: false, allow_google_signals: false })]);
    expect(calls).toContainEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(calls).toContainEqual(['event', 'page_view', expect.objectContaining({ page_path: '/convite/:token' })]);
    expect(JSON.stringify(calls)).not.toContain('9f8a7b6c5d4e3f2a1b0c');

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toMatchObject({ policy_version: '2026-11', analytics: true, action: 'accept_all' });
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ analytics: true, synced: true }));
  });

  it('Recusar não carrega o GA4, apaga cookies _ga e registra a recusa', async () => {
    const bodies = recordConsents();
    document.cookie = '_ga=GA1.1.123.456; path=/';
    const user = userEvent.setup();
    renderWithApp(<CookieConsentBanner />);

    await user.click(screen.getByRole('button', { name: 'Recusar' }));

    expect(gaScript()).toBeNull();
    expect(document.cookie).not.toContain('_ga=');
    expect(window['ga-disable-G-TEST123']).toBe(true);
    await waitFor(() => expect(bodies).toEqual([expect.objectContaining({ analytics: false, action: 'reject_all' })]));
  });

  it('Personalizar começa com estatísticas desligado e "Salvar escolhas" mantém recusado', async () => {
    const bodies = recordConsents();
    const user = userEvent.setup();
    renderWithApp(<CookieConsentBanner />);

    await user.click(screen.getByRole('button', { name: 'Personalizar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Preferências de cookies' });
    expect(within(dialog).getByRole('switch', { name: 'Estatísticas (Google Analytics)' })).toHaveAttribute('aria-checked', 'false');
    expect(within(dialog).getByRole('switch', { name: 'Essenciais' })).toBeDisabled();

    await user.click(within(dialog).getByRole('button', { name: 'Salvar escolhas' }));
    expect(gaScript()).toBeNull();
    await waitFor(() => expect(bodies).toEqual([expect.objectContaining({ analytics: false, action: 'custom' })]));
  });

  it('revogar pelo painel desliga o GA4 e registra "withdraw" com o mesmo consent_id', async () => {
    const bodies = recordConsents();
    const user = userEvent.setup();
    renderWithApp(<CookieConsentBanner />);
    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    act(() => openCookiePreferences());
    const dialog = await screen.findByRole('dialog', { name: 'Preferências de cookies' });
    const toggle = within(dialog).getByRole('switch', { name: 'Estatísticas (Google Analytics)' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await user.click(toggle);
    await user.click(within(dialog).getByRole('button', { name: 'Salvar escolhas' }));

    expect(dataLayerCalls()).toContainEqual(['consent', 'update', { analytics_storage: 'denied' }]);
    expect(window['ga-disable-G-TEST123']).toBe(true);
    await waitFor(() => expect(bodies.map((b) => b.action)).toEqual(['accept_all', 'withdraw']));
    expect(bodies[1].consent_id).toBe(bodies[0].consent_id);
  });

  it('pede de novo quando a versão da política muda', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: '5b1f3c2e-8a4d-4f6b-9c1e-2d3a4b5c6d7e', version: '2025-01', analytics: true, decidedAt: new Date().toISOString(), action: 'accept_all', synced: true })
    );
    renderWithApp(<CookieConsentBanner />);
    expect(screen.getByRole('region', { name: 'Sua privacidade' })).toBeInTheDocument();
    expect(gaScript()).toBeNull();
  });

  it('escolha salva e válida: sem banner, GA4 aplicado e registro pendente reenviado', async () => {
    const bodies = recordConsents();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: '5b1f3c2e-8a4d-4f6b-9c1e-2d3a4b5c6d7e', version: '2026-11', analytics: true, decidedAt: new Date().toISOString(), action: 'accept_all', synced: false })
    );
    renderWithApp(<CookieConsentBanner />);
    expect(screen.queryByRole('region', { name: 'Sua privacidade' })).not.toBeInTheDocument();
    expect(gaScript()).not.toBeNull();
    await waitFor(() => expect(bodies).toEqual([expect.objectContaining({ consent_id: '5b1f3c2e-8a4d-4f6b-9c1e-2d3a4b5c6d7e' })]));
  });
});
