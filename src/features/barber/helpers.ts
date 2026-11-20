// Lógica pura da área do barbeiro: períodos, série semanal, agrupamento da agenda, variação % e bloqueios.
import { z } from 'zod';

import type { Appointment, MeBarberProfile } from '@/types/api';
import { addDays, DEFAULT_TIMEZONE, localToUtcIso, toLocalDate, weekdayOf, WEEKDAYS_SHORT } from '@/utils/date';

/** Visitas a partir das quais o cliente ganha o selo "Frequente" (o Figma marca, o backend não define). */
export const FREQUENT_VISITS = 4;

export const isFrequentClient = (visits: number | null | undefined): boolean => Number(visits || 0) >= FREQUENT_VISITS;

/** Rótulo do perfil de barbeiro para o seletor (filial). */
export const profileLabel = (profile: MeBarberProfile): string =>
  profile.branch?.name ? profile.branch.name : profile.display_name || `Perfil #${profile.id}`;

/** Segunda-feira da semana da data local (YYYY-MM-DD). */
export const startOfWeek = (date: string): string => {
  const weekday = weekdayOf(date);
  return addDays(date, weekday === 0 ? -6 : 1 - weekday);
};

/** Datas locais de segunda a domingo da semana da data. */
export const weekDates = (date: string): string[] => {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
};

export const startOfMonth = (date: string): string => `${date.slice(0, 7)}-01`;

/** "novembro de 2026" a partir de YYYY-MM-DD. */
export const monthLabel = (date: string): string => {
  const [y, m] = date.split('-').map(Number);
  const label = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(y, m - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Intervalo UTC [início, fim] de um dia local, para filtros from/to da API. */
export const dayRangeUtc = (date: string, timeZone = DEFAULT_TIMEZONE): { from: string; to: string } => ({
  from: localToUtcIso(date, '00:00', timeZone),
  to: new Date(new Date(localToUtcIso(addDays(date, 1), '00:00', timeZone)).getTime() - 1).toISOString(),
});

export interface SeriesPoint {
  date: string;
  label: string;
  amount: number;
  /** Altura relativa 0..1 em relação ao maior valor da série. */
  ratio: number;
}

/** Série de receita por dia (revenue_by_day) restrita às datas pedidas, com proporção para o gráfico de barras. */
export const dailySeries = (revenueByDay: { date: string; amount: string }[] | undefined, dates: string[]): SeriesPoint[] => {
  const byDate = new Map((revenueByDay ?? []).map((item) => [item.date, Number(item.amount) || 0]));
  const amounts = dates.map((date) => byDate.get(date) ?? 0);
  const max = Math.max(0, ...amounts);
  return dates.map((date, index) => ({
    date,
    label: WEEKDAYS_SHORT[weekdayOf(date)],
    amount: amounts[index],
    ratio: max > 0 ? amounts[index] / max : 0,
  }));
};

/** Soma da série. */
export const sumSeries = (points: { amount: number }[]): number => points.reduce((sum, point) => sum + point.amount, 0);

export interface ChangeInfo {
  label: string;
  tone: 'up' | 'down' | 'flat';
}

/** "+12% vs. ontem" — null quando não há base de comparação (change_pct null/ausente). */
export const formatChange = (pct: number | null | undefined, suffix: string): ChangeInfo | null => {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return null;
  const rounded = Math.round(pct * 10) / 10;
  const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Math.abs(rounded));
  if (rounded === 0) return { label: `0% ${suffix}`, tone: 'flat' };
  return { label: `${rounded > 0 ? '+' : '−'}${number}% ${suffix}`, tone: rounded > 0 ? 'up' : 'down' };
};

/** Diferença absoluta entre contagens: "+2 em relação a ontem". */
export const formatDelta = (current: number, previous: number | null | undefined, suffix: string): ChangeInfo | null => {
  if (previous === null || previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return { label: `Igual ${suffix.replace(/^em relação a /, 'a ')}`, tone: 'flat' };
  return { label: `${diff > 0 ? '+' : '−'}${Math.abs(diff)} ${suffix}`, tone: diff > 0 ? 'up' : 'down' };
};

export type DayPeriod = 'morning' | 'afternoon' | 'evening';
export const DAY_PERIOD_LABEL: Record<DayPeriod, string> = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };

const hourIn = (iso: string, timeZone: string): number =>
  Number(new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', hour12: false }).format(new Date(iso))) % 24;

export const dayPeriodOf = (iso: string, timeZone = DEFAULT_TIMEZONE): DayPeriod => {
  const hour = hourIn(iso, timeZone);
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

/** Agrupa agendamentos (ordenados por horário) em Manhã/Tarde/Noite, omitindo grupos vazios. */
export const groupByDayPeriod = (appointments: Appointment[], timeZone = DEFAULT_TIMEZONE): { period: DayPeriod; items: Appointment[] }[] => {
  const sorted = [...appointments].sort((a, b) => a.start_at.localeCompare(b.start_at));
  const order: DayPeriod[] = ['morning', 'afternoon', 'evening'];
  return order
    .map((period) => ({ period, items: sorted.filter((item) => dayPeriodOf(item.start_at, item.Branch?.timezone || timeZone) === period) }))
    .filter((group) => group.items.length > 0);
};

/** Nome do cliente do agendamento (conta, cliente de balcão ou fallback). */
export const appointmentClientName = (appointment: Appointment): string =>
  appointment.customer?.name || appointment.client?.name || 'Cliente';

export const appointmentClientPhone = (appointment: Appointment): string | null =>
  appointment.customer?.phone || appointment.client?.phone || null;

/** Próximos agendamentos confirmados que ainda não terminaram. */
export const upcomingConfirmed = (appointments: Appointment[], now = new Date()): Appointment[] =>
  appointments
    .filter((item) => item.status === 'confirmado' && new Date(item.end_at).getTime() > now.getTime())
    .sort((a, b) => a.start_at.localeCompare(b.start_at));

// ---------------------------------------------------------------------------------------------------
// Bloqueios (time-off)

const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
const ymd = /^\d{4}-\d{2}-\d{2}$/;

export const timeOffSchema = z
  .object({
    start_date: z.string().regex(ymd, 'Informe a data de início'),
    end_date: z.string().regex(ymd, 'Informe a data de fim'),
    all_day: z.boolean(),
    start_time: z.string(),
    end_time: z.string(),
    reason: z.string().trim().max(255, 'Máximo de 255 caracteres').optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.all_day) {
      if (!hhmm.test(value.start_time)) ctx.addIssue({ code: 'custom', path: ['start_time'], message: 'Horário inválido' });
      if (!hhmm.test(value.end_time)) ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'Horário inválido' });
    }
    if (ymd.test(value.start_date) && ymd.test(value.end_date)) {
      if (value.end_date < value.start_date) {
        ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'A data de fim deve ser igual ou posterior ao início' });
      } else if (!value.all_day && value.end_date === value.start_date && hhmm.test(value.start_time) && hhmm.test(value.end_time) && value.end_time <= value.start_time) {
        ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'O fim deve ser depois do início' });
      }
    }
  });

export type TimeOffForm = z.infer<typeof timeOffSchema>;

/** Converte o formulário (datas/horas locais da filial) no corpo da API (ISO UTC). Dia inteiro = 00:00 → 00:00 do dia seguinte. */
export const timeOffToPayload = (form: TimeOffForm, timeZone = DEFAULT_TIMEZONE): { start_at: string; end_at: string; reason: string | null } => ({
  start_at: localToUtcIso(form.start_date, form.all_day ? '00:00' : form.start_time, timeZone),
  end_at: form.all_day ? localToUtcIso(addDays(form.end_date, 1), '00:00', timeZone) : localToUtcIso(form.end_date, form.end_time, timeZone),
  reason: form.reason ? form.reason : null,
});

/** Descrição curta de um bloqueio no fuso da filial: "seg., 01/12 · 12:00–13:00" ou "01/12 a 05/12 · dia inteiro". */
export const describeTimeOff = (startAt: string, endAt: string, timeZone = DEFAULT_TIMEZONE): { dates: string; hours: string } => {
  const startDate = toLocalDate(startAt, timeZone);
  const endInstant = new Date(endAt);
  const time = (iso: Date | string) => new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
  const startTime = time(startAt);
  const endTime = time(endInstant);
  const allDay = startTime === '00:00' && endTime === '00:00';
  // Dia inteiro termina às 00:00 do dia seguinte: mostra o último dia bloqueado.
  const lastDate = allDay ? toLocalDate(new Date(endInstant.getTime() - 1), timeZone) : toLocalDate(endInstant, timeZone);
  const short = (date: string) => {
    const [, m, d] = date.split('-');
    return `${WEEKDAYS_SHORT[weekdayOf(date)]}, ${d}/${m}`;
  };
  const dates = startDate === lastDate ? short(startDate) : `${short(startDate)} a ${short(lastDate)}`;
  return { dates, hours: allDay ? 'Dia inteiro' : `${startTime}–${endTime}` };
};
