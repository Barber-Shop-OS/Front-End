// Cálculos puros das telas do dono: períodos, somas da série diária, variação %, escala do gráfico e
// nomes exibidos de agendamentos/pagamentos.
import type { Appointment, Barber } from '@/types/api';
import { addDays, localToUtcIso, weekdayOf, WEEKDAYS_SHORT } from '@/utils/date';

export type PeriodPreset = 'today' | 'week' | 'month';

export const PERIOD_LABEL: Record<PeriodPreset, string> = { today: 'Hoje', week: 'Semana', month: 'Mês' };
export const PERIOD_DAYS: Record<PeriodPreset, number> = { today: 1, week: 7, month: 30 };

export interface DateRange {
  from: string;
  to: string;
}

/** Período terminando em `today` (inclusive): hoje, últimos 7 dias ou últimos 30 dias. */
export const periodRange = (preset: PeriodPreset, today: string): DateRange => ({
  from: addDays(today, -(PERIOD_DAYS[preset] - 1)),
  to: today,
});

/** Período imediatamente anterior, com o mesmo número de dias. */
export const previousRange = (range: DateRange): DateRange => {
  const days = daysInRange(range);
  return { from: addDays(range.from, -days), to: addDays(range.from, -1) };
};

export const daysInRange = ({ from, to }: DateRange): number => {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86400000) + 1;
};

/** Soma (em reais) da série diária dentro do intervalo. */
export const sumRevenue = (byDay: { date: string; amount: string }[] | undefined, range: DateRange): number =>
  Math.round((byDay ?? []).filter((item) => item.date >= range.from && item.date <= range.to).reduce((sum, item) => sum + Number(item.amount || 0) * 100, 0)) / 100;

/** Variação percentual inteira; null quando não há base de comparação. */
export const pctChange = (current: number, previous: number): number | null => {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const formatPct = (value: number): string => `${value > 0 ? '+' : ''}${value}%`;

export interface ChartBar {
  date: string;
  label: string;
  amount: number;
}

/** Últimos `n` dias até `end` (inclusive), preenchendo com zero os dias sem receita. */
export const dailyBars = (byDay: { date: string; amount: string }[] | undefined, end: string, n = 7): ChartBar[] => {
  const map = new Map((byDay ?? []).map((item) => [item.date, Number(item.amount || 0)]));
  return Array.from({ length: n }, (_, index) => {
    const date = addDays(end, index - (n - 1));
    return { date, label: WEEKDAYS_SHORT[weekdayOf(date)], amount: map.get(date) ?? 0 };
  });
};

/** Teto "redondo" do eixo Y e as marcas (5 intervalos). */
export const chartScale = (max: number): { top: number; ticks: number[] } => {
  if (max <= 0) return { top: 500, ticks: [500, 400, 300, 200, 100, 0] };
  const rawStep = max / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? 10 * magnitude;
  const top = step * 5;
  return { top, ticks: Array.from({ length: 6 }, (_, index) => top - index * step) };
};

/** "5k", "1,5k", "800". */
export const formatCompact = (value: number): string => {
  if (value >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')}k`;
  }
  return String(Math.round(value));
};

/** Datas locais → instantes UTC [início do `from`, início do dia seguinte ao `to`) no fuso. */
export const rangeToUtc = (range: DateRange, timeZone: string): { from: string; to: string } => ({
  from: localToUtcIso(range.from, '00:00', timeZone),
  to: localToUtcIso(addDays(range.to, 1), '00:00', timeZone),
});

/** Segunda-feira da semana da data local. */
export const weekStartOf = (date: string): string => addDays(date, -((weekdayOf(date) + 6) % 7));

type LooseBarber = { display_name?: string | null; user?: { name?: string } | null; User?: { name?: string } | null };

/** Nome do cliente do agendamento (cliente da barbearia ou conta). */
export const appointmentClientName = (appointment: Pick<Appointment, 'customer' | 'client'>): string =>
  appointment.customer?.name || appointment.client?.name || 'Cliente';

/** Nome do barbeiro: lista da filial primeiro, depois o que vier embutido no agendamento. */
export const appointmentBarberName = (appointment: Appointment, barbers?: Pick<Barber, 'id' | 'display_name'>[]): string => {
  const fromList = barbers?.find((barber) => barber.id === appointment.barber_id)?.display_name;
  if (fromList) return fromList;
  const embedded = (appointment.barber ?? (appointment as unknown as { Barber?: LooseBarber }).Barber) as LooseBarber | null | undefined;
  return embedded?.display_name || embedded?.user?.name || embedded?.User?.name || 'Barbeiro';
};

interface ServiceSource {
  revenue_by_service?: { service_id: number; name: string; count?: number; appointments?: number; revenue: string }[];
  top_services?: { service_id: number; name: string; count: number; revenue: string }[];
}

/** Receita por serviço: usa `revenue_by_service` (BE-53) quando existir; senão os top serviços (BE-24). */
export const serviceRows = (summary: ServiceSource | undefined) =>
  (summary?.revenue_by_service ?? summary?.top_services ?? [])
    .map((item: { service_id: number; name: string; count?: number; appointments?: number; revenue: string }) => ({
      id: item.service_id,
      name: item.name,
      count: item.count ?? item.appointments ?? 0,
      revenue: Number(item.revenue || 0),
    }))
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count);

export const METHOD_LABEL = { PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão' } as const;
export const PAYMENT_STATUS_LABEL = { PAID: 'Pago', PENDING: 'Pendente', FAILED: 'Falhou' } as const;
