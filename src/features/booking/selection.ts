// Regras puras do wizard de agendamento (Figma 1:1881 → 1:1736 → 1:1253 → 1:2060): etapas, seleção salva
// para o login no fim do fluxo, agrupamento de horários, calendário do mês e a regra SEC-21.
import type { Me, PublicBarbershop, Slot } from '@/types/api';
import { addDays, formatTime, weekdayOf } from '@/utils/date';

export type BookingStep = 'filial' | 'servico' | 'barbeiro' | 'horario' | 'pagamento';
export const STEP_ORDER: BookingStep[] = ['filial', 'servico', 'barbeiro', 'horario', 'pagamento'];

/** Escolhas do visitante. `barber` = id, 'qualquer' (sem preferência) ou null (não escolhido). */
export interface BookingSelection {
  branchId: number | null;
  serviceId: number | null;
  barber: number | 'qualquer' | null;
  date: string | null;
  startAt: string | null;
}

export const EMPTY_SELECTION: BookingSelection = { branchId: null, serviceId: null, barber: null, date: null, startAt: null };

const positiveInt = (value: string | null): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/** Lê a seleção da URL (`?branch=` é o contrato público; `filial` é aceito por compatibilidade). */
export const selectionFromParams = (params: URLSearchParams): BookingSelection => {
  const barberRaw = params.get('barbeiro');
  return {
    branchId: positiveInt(params.get('branch') ?? params.get('filial')),
    serviceId: positiveInt(params.get('servico')),
    barber: barberRaw === 'qualquer' ? 'qualquer' : positiveInt(barberRaw),
    date: /^\d{4}-\d{2}-\d{2}$/.test(params.get('data') ?? '') ? params.get('data') : null,
    startAt: params.get('horario') && !Number.isNaN(Date.parse(params.get('horario') as string)) ? params.get('horario') : null,
  };
};

/** Escreve a seleção na URL (mantém outros parâmetros, ex.: `etapa`). */
export const selectionToParams = (selection: BookingSelection, base?: URLSearchParams): URLSearchParams => {
  const next = new URLSearchParams(base);
  next.delete('filial');
  const put = (key: string, value: string | number | null) => (value === null || value === '' ? next.delete(key) : next.set(key, String(value)));
  put('branch', selection.branchId);
  put('servico', selection.serviceId);
  put('barbeiro', selection.barber);
  put('data', selection.date);
  put('horario', selection.startAt);
  return next;
};

/** Primeira etapa incompleta (a etapa pedida na URL nunca passa dela). */
export const firstIncompleteStep = (selection: BookingSelection): BookingStep => {
  if (!selection.branchId) return 'filial';
  if (!selection.serviceId) return 'servico';
  if (selection.barber === null) return 'barbeiro';
  if (!selection.startAt) return 'horario';
  return 'pagamento';
};

export const resolveStep = (requested: string | null, selection: BookingSelection): BookingStep => {
  const limit = firstIncompleteStep(selection);
  const wanted = STEP_ORDER.includes(requested as BookingStep) ? (requested as BookingStep) : limit;
  return STEP_ORDER.indexOf(wanted) <= STEP_ORDER.indexOf(limit) ? wanted : limit;
};

/**
 * Remove escolhas que deixaram de ser válidas para a barbearia carregada (filial inativa, serviço removido,
 * barbeiro que não atende a filial/serviço). Retorna a mesma referência se nada mudou.
 */
export const sanitizeSelection = (selection: BookingSelection, shop: PublicBarbershop): BookingSelection => {
  let next = selection;
  const onlyBranch = shop.branches.length === 1 ? shop.branches[0].id : null;
  if (!next.branchId && onlyBranch) next = { ...next, branchId: onlyBranch };
  if (next.branchId && !shop.branches.some((branch) => branch.id === next.branchId)) next = { ...EMPTY_SELECTION, branchId: onlyBranch };
  if (next.serviceId && !shop.services.some((service) => service.id === next.serviceId)) next = { ...next, serviceId: null, barber: null, startAt: null };
  if (typeof next.barber === 'number') {
    const barberId = next.barber;
    const ok = barbersFor(shop, next.branchId, next.serviceId).some((barber) => barber.id === barberId);
    if (!ok) next = { ...next, barber: null, startAt: null };
  }
  return next;
};

/** Barbeiros da filial que fazem o serviço (sem lista de serviços = atende todos). */
export const barbersFor = (shop: PublicBarbershop, branchId: number | null, serviceId: number | null) =>
  shop.barbers.filter(
    (barber) => barber.branch_id === branchId && (!serviceId || !barber.services?.length || barber.services.some((item) => item.id === serviceId))
  );

// ---------- Seleção salva para o login no fim do fluxo ----------

const STORAGE_KEY = 'barberos:booking-draft';
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

export interface BookingDraft {
  slug: string;
  selection: BookingSelection;
  notes: string;
  savedAt: number;
}

export const saveBookingDraft = (slug: string, selection: BookingSelection, notes: string, storage: Storage | undefined = safeSession()) => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ slug, selection, notes, savedAt: Date.now() } satisfies BookingDraft));
  } catch {
    // Armazenamento indisponível (aba anônima/cota): a URL de retorno ainda carrega a seleção.
  }
};

export const loadBookingDraft = (slug: string, storage: Storage | undefined = safeSession(), now = Date.now()): BookingDraft | null => {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as BookingDraft;
    if (draft.slug !== slug || now - draft.savedAt > DRAFT_TTL_MS || typeof draft.selection !== 'object') return null;
    return { ...draft, selection: { ...EMPTY_SELECTION, ...draft.selection }, notes: typeof draft.notes === 'string' ? draft.notes : '' };
  } catch {
    return null;
  }
};

export const clearBookingDraft = (storage: Storage | undefined = safeSession()) => {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
};

function safeSession(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

// ---------- Horários ----------

export type DayPeriod = 'manha' | 'tarde' | 'noite';
export const PERIOD_LABEL: Record<DayPeriod, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

/** Agrupa os horários livres em Manhã (< 12h), Tarde (12h–17h59) e Noite (≥ 18h) no fuso da filial. */
export const groupSlotsByPeriod = (slots: Slot[], timezone: string): { period: DayPeriod; slots: Slot[] }[] => {
  const groups: Record<DayPeriod, Slot[]> = { manha: [], tarde: [], noite: [] };
  for (const slot of slots) {
    const hour = Number(formatTime(slot.start_at, timezone).slice(0, 2));
    groups[hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite'].push(slot);
  }
  return (Object.keys(groups) as DayPeriod[]).filter((period) => groups[period].length).map((period) => ({ period, slots: groups[period] }));
};

export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  disabled: boolean;
  today: boolean;
}

/**
 * Grade do mês (semanas começando no domingo). Dias antes de hoje, depois de `maxDate` ou em dias da semana em
 * que a filial não abre (quando há horário de funcionamento cadastrado) ficam desabilitados.
 */
export const buildCalendarMonth = (month: string, today: string, maxDate: string, openWeekdays: number[] | null): CalendarDay[] => {
  const first = `${month}-01`;
  const start = addDays(first, -weekdayOf(first));
  const days: CalendarDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(start, index);
    const inMonth = date.startsWith(month);
    days.push({
      date,
      day: Number(date.slice(8)),
      inMonth,
      today: date === today,
      disabled: date < today || date > maxDate || (openWeekdays !== null && !openWeekdays.includes(weekdayOf(date))),
    });
  }
  // Remove semanas finais inteiras do mês seguinte.
  while (days.length > 28 && days.slice(-7).every((day) => !day.inMonth)) days.splice(-7);
  return days;
};

export const shiftMonth = (month: string, delta: number): string => {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
};

// ---------- SEC-21: e-mail verificado ou telefone ----------

/** O cliente pode agendar se tiver e-mail verificado OU telefone cadastrado (decisão de produto 20/11). */
export const canBookWithContact = (user: Pick<Me, 'email_verified_at' | 'phone'> | null): boolean =>
  !!user && (!!user.email_verified_at || !!user.phone?.trim());

const CONTACT_CODES = new Set(['CONTACT_REQUIRED', 'EMAIL_NOT_VERIFIED', 'PHONE_REQUIRED', 'VERIFICATION_REQUIRED', 'EMAIL_OR_PHONE_REQUIRED', 'UNVERIFIED_CONTACT']);

/** A API recusou o agendamento por falta de contato verificado (código dedicado ou 403 que fala disso). */
export const isContactRequiredError = (error: unknown): boolean => {
  const { code, status, message } = (error ?? {}) as { code?: string; status?: number; message?: string };
  if (code && CONTACT_CODES.has(code)) return true;
  return (status === 403 || status === 422) && typeof message === 'string' && /(verifi|telefone|celular)/i.test(message);
};

/** Conflito de horário: o slot foi tomado ou deixou de existir. */
export const isSlotConflictError = (error: unknown): boolean => {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (code === 'SLOT_TAKEN' || code === 'SLOT_UNAVAILABLE') return true;
  return status === 409 && code !== 'TOO_MANY_ACTIVE_APPOINTMENTS' && code !== 'IDEMPOTENCY_KEY_REUSED';
};

/** Normaliza o celular digitado: só dígitos, 10–11 com DDD (aceita +55). */
export const normalizePhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  return digits.length === 10 || digits.length === 11 ? digits : null;
};
