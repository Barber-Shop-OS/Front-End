// Regras de exibição da área do cliente (funções puras, testadas em helpers.test.ts).
import { DEFAULT_TIMEZONE, addDays, toLocalDate } from '@/utils/date';

import type { CustomerAppointment, FrequentBarbershop } from './types';

/** Rota do detalhe do agendamento na área do cliente. */
export const appointmentPath = (id: number): string => `/cliente/agendamentos/${id}`;

/** Nome do barbeiro: display_name (lista) ou nome do usuário (detalhe). */
export const barberName = (appointment: Pick<CustomerAppointment, 'Barber' | 'barber'>): string | null =>
  appointment.Barber?.display_name || appointment.Barber?.User?.name || appointment.barber?.display_name || appointment.barber?.User?.name || null;

/** Serviço como foi agendado (snapshot) — o serviço pode ter sido renomeado/excluído depois. */
export const serviceName = (appointment: Pick<CustomerAppointment, 'service_name_snapshot' | 'Service'>): string =>
  appointment.service_name_snapshot || appointment.Service?.name || 'Serviço';

export const timezoneOf = (appointment: Pick<CustomerAppointment, 'Branch'>): string => appointment.Branch?.timezone || DEFAULT_TIMEZONE;

/** "Hoje" / "Amanhã" quando aplicável (no fuso da filial). */
export const relativeDayLabel = (startAt: string, timeZone = DEFAULT_TIMEZONE, now: Date = new Date()): string | null => {
  const day = toLocalDate(startAt, timeZone);
  const today = toLocalDate(now, timeZone);
  if (day === today) return 'Hoje';
  if (day === addDays(today, 1)) return 'Amanhã';
  return null;
};

/** "12 de outubro" */
export const formatDayMonth = (value: string, timeZone = DEFAULT_TIMEZONE): string =>
  new Intl.DateTimeFormat('pt-BR', { timeZone, day: 'numeric', month: 'long' }).format(new Date(value));

/** "Terça, 24 de outubro" */
export const formatWeekdayDayMonth = (value: string, timeZone = DEFAULT_TIMEZONE): string => {
  const text = new Intl.DateTimeFormat('pt-BR', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value));
  const [weekday, ...rest] = text.split(',');
  const short = weekday.replace('-feira', '');
  return `${short.charAt(0).toUpperCase()}${short.slice(1)},${rest.join(',')}`;
};

export const canCancel = (appointment: Pick<CustomerAppointment, 'allowed_actions'>): boolean => appointment.allowed_actions?.includes('cancel') ?? false;
export const canReschedule = (appointment: Pick<CustomerAppointment, 'allowed_actions'>): boolean =>
  appointment.allowed_actions?.includes('reschedule') ?? false;

/**
 * Agendamento confirmado e futuro cujo prazo de cancelamento/reagendamento online já passou
 * (a API deixa de listar as ações) → mostrar aviso para falar com a barbearia.
 */
export const isCancellationWindowClosed = (
  appointment: Pick<CustomerAppointment, 'status' | 'start_at' | 'can_cancel_until' | 'allowed_actions'>,
  now: Date = new Date()
): boolean =>
  appointment.status === 'confirmado' &&
  new Date(appointment.start_at).getTime() > now.getTime() &&
  !canCancel(appointment) &&
  !!appointment.can_cancel_until &&
  new Date(appointment.can_cancel_until).getTime() <= now.getTime();

/**
 * Barbearias frequentes a partir do histórico: agrupa por barbearia, conta visitas concluídas,
 * guarda a última visita e a próxima reserva. Ordena por visitas e recência.
 */
export const deriveFrequentBarbershops = (
  past: CustomerAppointment[],
  upcoming: CustomerAppointment[],
  limit = 3
): FrequentBarbershop[] => {
  const map = new Map<number, FrequentBarbershop>();
  const ensure = (appointment: CustomerAppointment): FrequentBarbershop | null => {
    const shopId = appointment.Branch?.barbershop_id;
    if (!shopId) return null;
    let entry = map.get(shopId);
    if (!entry) {
      entry = { barbershopId: shopId, branchId: appointment.branch_id, branchName: appointment.Branch?.name ?? '', visits: 0, lastVisit: null, nextVisit: null };
      map.set(shopId, entry);
    }
    return entry;
  };

  for (const appointment of past) {
    if (appointment.status !== 'concluido') continue;
    const entry = ensure(appointment);
    if (!entry) continue;
    entry.visits += 1;
    if (!entry.lastVisit || appointment.start_at > entry.lastVisit) {
      entry.lastVisit = appointment.start_at;
      entry.branchId = appointment.branch_id;
      entry.branchName = appointment.Branch?.name ?? entry.branchName;
    }
  }
  for (const appointment of upcoming) {
    if (appointment.status !== 'confirmado') continue;
    const entry = ensure(appointment);
    if (!entry) continue;
    if (!entry.nextVisit || appointment.start_at < entry.nextVisit) entry.nextVisit = appointment.start_at;
  }

  return [...map.values()]
    .sort((a, b) => b.visits - a.visits || (b.lastVisit ?? b.nextVisit ?? '').localeCompare(a.lastVisit ?? a.nextVisit ?? ''))
    .slice(0, limit);
};

/** Link para o fluxo de agendamento com filial, serviço e barbeiro pré-selecionados. */
export const rebookPath = (slug: string, appointment: Pick<CustomerAppointment, 'branch_id' | 'service_id' | 'barber_id'>): string => {
  const params = new URLSearchParams({ filial: String(appointment.branch_id), servico: String(appointment.service_id), barbeiro: String(appointment.barber_id) });
  return `/b/${encodeURIComponent(slug)}/agendar?${params.toString()}`;
};

/** "Última visita: há 12 dias" / "Próxima reserva amanhã" / "Visitada 8 vezes". */
export const frequentSubtitle = (entry: FrequentBarbershop, relative: (iso: string) => string): string => {
  if (entry.nextVisit) return `Próxima reserva ${relative(entry.nextVisit)}`;
  if (entry.visits > 1) return `Visitada ${entry.visits} vezes`;
  if (entry.lastVisit) return `Última visita: ${relative(entry.lastVisit)}`;
  return entry.branchName;
};
