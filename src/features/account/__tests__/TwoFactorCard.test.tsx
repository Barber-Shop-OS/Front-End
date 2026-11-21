// SEC-27: ativar e desativar a verificação em duas etapas na conta.
import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { TwoFactorCard } from '@/features/account/TwoFactorCard';
import { API, baseMe, renderWithApp, server } from '@/test/render';

vi.mock('qrcode', () => ({ toDataURL: () => Promise.resolve('data:image/png;base64,AAAA') }));

const status = (overrides = {}) => ({ enabled: false, enabled_at: null, required: false, recovery_codes_left: 0, ...overrides });

describe('TwoFactorCard', () => {
  it('ativa com QR code + código e mostra os códigos de recuperação uma vez', async () => {
    let enabled = false;
    server.use(
      http.get(`${API}/me/2fa`, () => HttpResponse.json(status(enabled ? { enabled: true, enabled_at: '2026-11-21T10:00:00Z', recovery_codes_left: 10 } : {}))),
      http.post(`${API}/me/2fa/setup`, () => HttpResponse.json({ secret: 'JBSWY3DPEHPK3PXP', otpauth_url: 'otpauth://totp/BarberOS:ana?secret=JBSWY3DPEHPK3PXP' })),
      http.post(`${API}/me/2fa/enable`, async ({ request }) => {
        const body = (await request.json()) as { code: string };
        if (body.code !== '123456') return HttpResponse.json({ message: 'x', code: 'TWO_FACTOR_INVALID' }, { status: 400 });
        enabled = true;
        return HttpResponse.json({ enabled: true, recovery_codes: ['AAAAA-11111', 'BBBBB-22222'] });
      }),
      http.get(`${API}/me`, () => HttpResponse.json(baseMe({ two_factor_enabled: enabled })))
    );
    const user = userEvent.setup();
    renderWithApp(<TwoFactorCard />, { me: baseMe() });

    await user.click(await screen.findByRole('button', { name: 'Ativar' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByAltText(/qr code/i)).toBeInTheDocument();
    expect(within(dialog).getByText('JBSW Y3DP EHPK 3PXP')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Código do app'), '000000');
    await user.click(within(dialog).getByRole('button', { name: 'Ativar' }));
    expect(await within(dialog).findByText(/código inválido ou expirado/i)).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Código do app'), '123456');
    await user.click(within(dialog).getByRole('button', { name: 'Ativar' }));
    const codes = await within(dialog).findByRole('list', { name: /códigos de recuperação/i });
    expect(within(codes).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['AAAAA-11111', 'BBBBB-22222']);

    await user.click(within(dialog).getByRole('button', { name: 'Já guardei' }));
    expect(await screen.findByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText(/restam 10 código/i)).toBeInTheDocument();
  });

  it('admin não vê a opção de desativar', async () => {
    server.use(http.get(`${API}/me/2fa`, () => HttpResponse.json(status({ enabled: true, required: true, recovery_codes_left: 9 }))));
    renderWithApp(<TwoFactorCard />, { me: baseMe({ role: 'admin' }) });
    expect(await screen.findByText(/obrigatória para administradores/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desativar' })).not.toBeInTheDocument();
  });

  it('desativa com senha e código', async () => {
    let body: unknown;
    server.use(
      http.get(`${API}/me/2fa`, () => HttpResponse.json(status(body ? {} : { enabled: true, recovery_codes_left: 2 }))),
      http.post(`${API}/me/2fa/disable`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ enabled: false });
      }),
      http.get(`${API}/me`, () => HttpResponse.json(baseMe()))
    );
    const user = userEvent.setup();
    renderWithApp(<TwoFactorCard />, { me: baseMe({ two_factor_enabled: true }) });
    expect(await screen.findByText(/poucos códigos de recuperação/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desativar' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Senha'), 'segredo123');
    await user.type(within(dialog).getByLabelText('Código do app'), '654321');
    await user.click(within(dialog).getByRole('button', { name: 'Desativar' }));
    expect(await screen.findByText('Desativada')).toBeInTheDocument();
    expect(body).toEqual({ password: 'segredo123', code: '654321' });
  });
});
