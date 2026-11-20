import { describe, expect, it } from 'vitest';

import type { Me, MeBarbershop } from '@/types/api';

import { areasOf, homePathFor } from './hooks';

const shop = (membership: MeBarbershop['membership']): MeBarbershop => ({ id: 1, name: 'B', slug: 'b', status: 'active', logo_url: null, membership, branch_ids: membership === 'owner' ? null : [10] });

const me = (overrides: Partial<Me>): Me => ({
  id: 1,
  name: 'Fulano',
  email: 'f@x.com',
  phone: null,
  role: 'cliente',
  email_verified_at: null,
  roles: [],
  barbershops: [],
  barber_profiles: [],
  billing_banner: null,
  billing_banners: [],
  ...overrides,
});

describe('areasOf / homePathFor', () => {
  it('sem sessão não tem áreas e vai para /cliente', () => {
    expect(areasOf(null)).toEqual([]);
    expect(homePathFor(null)).toBe('/cliente');
  });

  it('cliente comum só acessa a área do cliente', () => {
    const user = me({});
    expect(areasOf(user)).toEqual(['customer']);
    expect(homePathFor(user)).toBe('/cliente');
  });

  it('dono e gerente vão para o painel da barbearia', () => {
    expect(homePathFor(me({ role: 'owner', barbershops: [shop('owner')] }))).toBe('/dashboard');
    expect(areasOf(me({ barbershops: [shop('manager')] }))).toContain('owner');
  });

  it('recepcionista acessa só o atendimento (não o painel do dono)', () => {
    const user = me({ barbershops: [shop('receptionist')] });
    expect(areasOf(user)).toEqual(['frontdesk', 'customer']);
    expect(homePathFor(user)).toBe('/atendimento');
  });

  it('barbeiro vai para a própria agenda; admin tem prioridade', () => {
    expect(homePathFor(me({ role: 'barbeiro', barber_profiles: [] }))).toBe('/barbeiro');
    expect(homePathFor(me({ role: 'admin', barbershops: [shop('owner')] }))).toBe('/admin');
  });
});
