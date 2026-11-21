// SEC-16: mensagens personalizadas continuam em pt-BR após a migração para zod 4.
import { describe, expect, it } from 'vitest';

import { serviceSchema } from '@/features/owner-admin/schemas';
import { onboardingSchema } from '@/features/owner-ops/schemas';

import { signupSchema } from './schemas';

const messageFor = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, field: string) =>
  result.error?.issues.find((issue) => issue.path[0] === field)?.message;

describe('schemas (zod 4)', () => {
  it('termos não aceitos', () => {
    const result = signupSchema.safeParse({ name: 'Ana', email: 'ana@x.com', password: '12345678', terms: false });
    expect(messageFor(result, 'terms')).toBe('Aceite os termos para continuar');
    expect(signupSchema.safeParse({ name: 'Ana', email: 'ana@x.com', password: '12345678', terms: true }).success).toBe(true);
  });

  it('duração do serviço: texto, faixa e múltiplos de 5', () => {
    const base = { name: 'Corte', description: 'Corte clássico', price: '45,00', active: true };
    expect(messageFor(serviceSchema.safeParse({ ...base, duration: 'abc' }), 'duration')).toBe('Informe a duração');
    expect(messageFor(serviceSchema.safeParse({ ...base, duration: '32' }), 'duration')).toBe('Use múltiplos de 5 minutos');
    expect(serviceSchema.parse({ ...base, duration: '30' }).duration).toBe(30);
  });

  it('UF obrigatória no onboarding', () => {
    const result = onboardingSchema.safeParse({ state: '' });
    expect(messageFor(result, 'state')).toBe('Selecione o estado');
  });
});
