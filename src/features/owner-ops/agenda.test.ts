import { describe, expect, it } from 'vitest';

import type { Appointment } from '@/types/api';

import { agendaDays, countByStatus, groupByBarber, groupByDay } from './agenda';
import { parseMoney, toClientInput } from './schemas';

const appt = (id: number, barber_id: number, start_at: string, status: Appointment['status'] = 'confirmado') =>
  ({ id, barber_id, start_at, end_at: start_at, status, service_name_snapshot: 'Corte', price_snapshot: '50.00' }) as Appointment;

describe('agenda', () => {
  it('dias da visão semana começam na segunda', () => {
    expect(agendaDays('2026-11-21', 'day')).toEqual(['2026-11-21']);
    const week = agendaDays('2026-11-21', 'week');
    expect(week[0]).toBe('2026-11-16');
    expect(week).toHaveLength(7);
  });

  it('agrupa por barbeiro (inclui quem só aparece nos agendamentos) e ordena por horário', () => {
    const cols = groupByBarber(
      [appt(2, 1, '2026-11-21T15:00:00Z'), appt(1, 1, '2026-11-21T13:00:00Z'), appt(3, 99, '2026-11-21T14:00:00Z')],
      [{ id: 1, display_name: 'Zé', photo_url: null }]
    );
    expect(cols.map((c) => c.barberId)).toEqual([1, 99]);
    expect(cols[0].items.map((a) => a.id)).toEqual([1, 2]);
  });

  it('agrupa por dia local no fuso da filial', () => {
    const byDay = groupByDay([appt(1, 1, '2026-11-22T01:00:00Z')], ['2026-11-21', '2026-11-22'], 'America/Sao_Paulo');
    expect(byDay['2026-11-21']).toHaveLength(1); // 22h do dia 21 em SP
    expect(byDay['2026-11-22']).toHaveLength(0);
  });

  it('conta por status', () => {
    expect(countByStatus([appt(1, 1, 'x'), appt(2, 1, 'x', 'concluido'), appt(3, 1, 'x', 'cancelado')])).toEqual({ confirmado: 1, concluido: 1, cancelado: 1, nao_compareceu: 0 });
  });
});

describe('schemas de operação', () => {
  it('valor em reais', () => {
    expect(parseMoney('55,90')).toBe(55.9);
    expect(parseMoney('R$ 1.200,00')).toBe(1200);
  });
  it('cliente rápido: vazios viram null', () => {
    expect(toClientInput({ name: ' Ana ', phone: '11999990000', email: '', notes: '' })).toEqual({ name: 'Ana', phone: '11999990000', email: null, notes: null });
  });
});
