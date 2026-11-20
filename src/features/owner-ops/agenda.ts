// Agrupamentos da agenda da filial (visão dia por barbeiro e visão semana por dia).
import type { Appointment, AppointmentStatus, Barber } from '@/types/api';
import { addDays, toLocalDate } from '@/utils/date';

import { appointmentBarberName, weekStartOf } from './metrics';

export type AgendaView = 'day' | 'week';

/** Dias exibidos: o próprio dia ou a semana (seg–dom) que o contém. */
export const agendaDays = (date: string, view: AgendaView): string[] =>
  view === 'day' ? [date] : Array.from({ length: 7 }, (_, index) => addDays(weekStartOf(date), index));

const byStart = (a: Appointment, b: Appointment) => a.start_at.localeCompare(b.start_at) || a.id - b.id;

export interface BarberColumn {
  barberId: number;
  name: string;
  photoUrl: string | null;
  items: Appointment[];
}

/** Uma coluna por barbeiro ativo da filial + colunas para barbeiros que só aparecem nos agendamentos. */
export const groupByBarber = (appointments: Appointment[], barbers: Pick<Barber, 'id' | 'display_name' | 'photo_url'>[]): BarberColumn[] => {
  const columns = new Map<number, BarberColumn>(
    barbers.map((barber) => [barber.id, { barberId: barber.id, name: barber.display_name || 'Barbeiro', photoUrl: barber.photo_url, items: [] }])
  );
  for (const appointment of appointments) {
    if (!columns.has(appointment.barber_id)) {
      columns.set(appointment.barber_id, { barberId: appointment.barber_id, name: appointmentBarberName(appointment, barbers), photoUrl: null, items: [] });
    }
    columns.get(appointment.barber_id)?.items.push(appointment);
  }
  return [...columns.values()].map((column) => ({ ...column, items: [...column.items].sort(byStart) }));
};

/** Agendamentos por dia local (no fuso da filial). */
export const groupByDay = (appointments: Appointment[], days: string[], timeZone: string): Record<string, Appointment[]> => {
  const result: Record<string, Appointment[]> = Object.fromEntries(days.map((day) => [day, []]));
  for (const appointment of appointments) {
    const day = toLocalDate(appointment.start_at, timeZone);
    if (result[day]) result[day].push(appointment);
  }
  for (const day of days) result[day].sort(byStart);
  return result;
};

/** Contagem por status para o resumo do topo. */
export const countByStatus = (appointments: Appointment[]): Record<AppointmentStatus, number> => {
  const counts: Record<AppointmentStatus, number> = { confirmado: 0, concluido: 0, cancelado: 0, nao_compareceu: 0 };
  for (const appointment of appointments) counts[appointment.status] += 1;
  return counts;
};
