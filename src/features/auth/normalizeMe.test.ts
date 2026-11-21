import { describe, expect, it } from 'vitest';

import type { Me } from '@/types/api';

import { normalizeMe } from './authSlice';
import { areasOf, homePathFor } from './hooks';

const base: Me = {
  id: 1,
  name: 'Rita',
  email: 'r@x.com',
  phone: null,
  role: 'cliente',
  email_verified_at: null,
  roles: ['cliente', 'receptionist'],
  barbershops: [],
  barber_profiles: [],
  billing_banner: null,
  billing_banners: [],
};

const desk = (branch_id: number) => ({
  membership_id: 2,
  role: 'receptionist' as const,
  barbershop_id: 17,
  branch_id,
  barbershop: { id: 17, name: 'Navalha', slug: 'navalha', status: 'active', logo_url: null },
  branch: { id: branch_id, name: 'Centro', timezone: 'America/Sao_Paulo' },
});

describe('normalizeMe (front_desk → barbershops)', () => {
  it('recepcionista vira barbearia com membership receptionist e vai para /atendimento', () => {
    const me = normalizeMe({ ...base, front_desk: [desk(17), desk(18)] });
    expect(me.barbershops).toEqual([expect.objectContaining({ id: 17, membership: 'receptionist', branch_ids: [17, 18] })]);
    expect(areasOf(me)).toContain('frontdesk');
    expect(homePathFor(me)).toBe('/atendimento');
  });

  it('sem front_desk não altera o perfil', () => {
    const me = { ...base, roles: ['cliente'] };
    expect(normalizeMe(me)).toBe(me);
  });
});
