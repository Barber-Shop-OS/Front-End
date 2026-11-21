import { describe, expect, it } from 'vitest';

import { daysUntil, fromWeek, isValidTaxId, limitLabel, maskCep, maskTaxId, mergeBarbers, parsePrice, priceToInput, toWeek, validateWeek } from './utils';

describe('owner-admin utils', () => {
  it('mascara CEP e CPF/CNPJ', () => {
    expect(maskCep('01310100')).toBe('01310-100');
    expect(maskTaxId('11144477735')).toBe('111.444.777-35');
    expect(maskTaxId('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('valida CPF e CNPJ pelos dígitos verificadores', () => {
    expect(isValidTaxId('111.444.777-35')).toBe(true);
    expect(isValidTaxId('111.444.777-36')).toBe(false);
    expect(isValidTaxId('11.222.333/0001-81')).toBe(true);
    expect(isValidTaxId('11111111111')).toBe(false);
  });

  it('converte preço do formato brasileiro', () => {
    expect(parsePrice('55,90')).toBe(55.9);
    expect(parsePrice('1.234,50')).toBe(1234.5);
    expect(parsePrice('R$ 40')).toBe(40);
    expect(Number.isNaN(parsePrice('abc'))).toBe(true);
    expect(priceToInput('55.00')).toBe('55,00');
  });

  it('ida e volta da semana preserva intervalos e ordena segunda→domingo', () => {
    const week = toWeek([
      { weekday: 1, start: '09:00:00', end: '12:00:00' },
      { weekday: 1, start: '13:00', end: '18:00' },
      { weekday: 0, start: '10:00', end: '14:00' },
    ]);
    expect(week[0].weekday).toBe(1);
    expect(week[0].ranges).toEqual([
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '18:00' },
    ]);
    expect(week[6].weekday).toBe(0);
    expect(week[1].enabled).toBe(false);
    expect(fromWeek(week)).toHaveLength(3);
  });

  it('acusa intervalos invertidos ou sobrepostos', () => {
    const name = (d: number) => `Dia ${d}`;
    expect(validateWeek(toWeek([{ weekday: 2, start: '10:00', end: '09:00' }]), name)).toMatch(/início precisa ser antes/);
    expect(
      validateWeek(
        toWeek([
          { weekday: 2, start: '09:00', end: '12:00' },
          { weekday: 2, start: '11:00', end: '13:00' },
        ]),
        name
      )
    ).toMatch(/sobrepostos/);
    expect(validateWeek(toWeek([{ weekday: 2, start: '09:00', end: '12:00' }]), name)).toBeNull();
  });

  it('rótulos de limite e dias restantes', () => {
    expect(limitLabel(null, 'filial', 'filiais', true)).toBe('Filiais ilimitadas');
    expect(limitLabel(1, 'filial', 'filiais', true)).toBe('Até 1 filial');
    expect(daysUntil('2026-11-25T00:00:00Z', new Date('2026-11-21T12:00:00Z'))).toBe(4);
    expect(daysUntil(null)).toBe(0);
  });

  it('funde barbeiros ativos (DTO público) com inativos da filial', () => {
    const merged = mergeBarbers(
      [
        { id: 1, user_id: 10, branch_id: 5, display_name: 'Zé', bio: null, photo_url: null, active: true },
        { id: 2, user_id: 11, branch_id: 5, display_name: 'Ana', bio: null, photo_url: null, active: false },
      ],
      [{ id: 1, display_name: 'Zé Navalha', bio: null, photo_url: null, branch_id: 5, services: [{ id: 3, name: 'Corte' }] }]
    );
    expect(merged.map((b) => [b.id, b.active, b.user_id])).toEqual([
      [1, true, 10],
      [2, false, 11],
    ]);
    expect(merged[0].display_name).toBe('Zé Navalha');
    expect(merged[0].services).toHaveLength(1);
  });
});
