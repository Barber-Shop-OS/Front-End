// SEC-21: dono/gerente bloqueia e desbloqueia cliente para agendamento online.
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import ClientDetailPage from '@/pages/owner/ClientDetailPage';
import { API, baseMe, renderWithApp, server } from '@/test/render';
import type { ClientDetail } from '@/types/api';

const owner = baseMe({ barbershops: [{ id: 7, name: 'Navalha', slug: 'navalha', status: 'active', logo_url: null, membership: 'owner', branch_ids: null }] });

const client = (overrides: Partial<ClientDetail> = {}): ClientDetail => ({
  id: 42,
  barbershop_id: 7,
  user_id: 3,
  has_account: true,
  name: 'Bruno Cliente',
  phone: '11988887777',
  email: 'bruno@barberos.dev',
  notes: null,
  visits: 4,
  no_shows: 3,
  last_visit: '2026-11-10T13:00:00Z',
  total_spent: '160.00',
  blocked: false,
  blocked_at: null,
  blocked_reason: null,
  history: [],
  ...overrides,
});

const setup = (initial: ClientDetail) => {
  let current = initial;
  const patches: unknown[] = [];
  server.use(
    http.get(`${API}/branch`, () => HttpResponse.json({ items: [], total: 0, page: 1, limit: 100 })),
    http.get(`${API}/barbershop/7/clients/42`, () => HttpResponse.json(current)),
    http.patch(`${API}/barbershop/7/clients/42`, async ({ request }) => {
      const body = (await request.json()) as { blocked: boolean; blocked_reason: string | null };
      patches.push(body);
      current = { ...current, blocked: body.blocked, blocked_at: body.blocked ? '2026-11-21T12:00:00Z' : null, blocked_reason: body.blocked_reason };
      return HttpResponse.json(current);
    })
  );
  renderWithApp(<ClientDetailPage />, { me: owner, route: '/dashboard/clientes/42', path: '/dashboard/clientes/:clientId' });
  return patches;
};

describe('ClientDetailPage — bloqueio (SEC-21)', () => {
  it('bloqueia com motivo e mostra o aviso', async () => {
    const patches = setup(client());
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Bloquear' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/motivo/i), 'Faltou 3 vezes');
    await user.click(within(dialog).getByRole('button', { name: 'Bloquear' }));
    expect(await screen.findByText(/não consegue agendar online nesta barbearia/i)).toHaveTextContent('Motivo: Faltou 3 vezes');
    expect(patches).toEqual([{ blocked: true, blocked_reason: 'Faltou 3 vezes' }]);
    expect(screen.getByRole('button', { name: 'Desbloquear' })).toBeInTheDocument();
  });

  it('desbloqueia cliente bloqueado', async () => {
    const patches = setup(client({ blocked: true, blocked_at: '2026-11-20T12:00:00Z', blocked_reason: 'Faltas' }));
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Desbloquear' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Desbloquear' }));
    expect(await screen.findByRole('button', { name: 'Bloquear' })).toBeInTheDocument();
    expect(patches).toEqual([{ blocked: false, blocked_reason: null }]);
  });
});
