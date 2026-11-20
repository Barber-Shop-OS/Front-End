// Helpers puros da gestão do dono: máscaras/validação (CEP, CPF/CNPJ, preço), semana de horários,
// rótulos de planos/assinatura/convites.
import type { BadgeTone } from '@/components/ui';
import type { SubscriptionStatus } from '@/types/api';

import type { InvitationStatus, ManagedBarber, MemberRole } from './types';

export const onlyDigits = (value: string | null | undefined): string => String(value ?? '').replace(/\D/g, '');

/** "01310100" → "01310-100" (enquanto digita). */
export const maskCep = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

/** Máscara de CPF (11) ou CNPJ (14) conforme a quantidade de dígitos. */
export const maskTaxId = (value: string): string => {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export const isValidCpf = (value: string): boolean => {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i += 1) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(d[9]) && digit(10) === Number(d[10]);
};

export const isValidCnpj = (value: string): boolean => {
  const d = onlyDigits(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, weight, i) => acc + Number(d[i]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return digit(12) === Number(d[12]) && digit(13) === Number(d[13]);
};

export const isValidTaxId = (value: string): boolean => {
  const length = onlyDigits(value).length;
  return length === 11 ? isValidCpf(value) : length === 14 ? isValidCnpj(value) : false;
};

/** "55,90" | "1.234,50" | "55.9" → 55.9 (NaN se inválido). */
export const parsePrice = (value: string): number => {
  const raw = String(value).trim().replace(/^R\$\s*/, '');
  if (!raw) return Number.NaN;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : Number.NaN;
};

/** "55.00" → "55,00" para o campo de preço. */
export const priceToInput = (value: string | number | null | undefined): string =>
  value === null || value === undefined || value === '' ? '' : Number(value).toFixed(2).replace('.', ',');

// ---------------------------------------------------------------------------------------------
// Semana de horários (funcionamento da filial e jornada do barbeiro)
// ---------------------------------------------------------------------------------------------

export interface TimeRange {
  start: string;
  end: string;
}

export interface DaySchedule {
  weekday: number;
  enabled: boolean;
  ranges: TimeRange[];
}

/** Ordem de exibição: segunda → domingo. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const hhmm = (value: string) => String(value ?? '').slice(0, 5);

/** Lista da API (um item por intervalo) → 7 dias com intervalos. */
export const toWeek = (items: { weekday: number; start: string; end: string }[], fallback: TimeRange = { start: '09:00', end: '19:00' }): DaySchedule[] =>
  WEEK_ORDER.map((weekday) => {
    const ranges = items
      .filter((item) => item.weekday === weekday)
      .map((item) => ({ start: hhmm(item.start), end: hhmm(item.end) }))
      .sort((a, b) => a.start.localeCompare(b.start));
    return { weekday, enabled: ranges.length > 0, ranges: ranges.length ? ranges : [{ ...fallback }] };
  });

/** 7 dias → lista plana só dos dias abertos. */
export const fromWeek = (week: DaySchedule[]): { weekday: number; start: string; end: string }[] =>
  week
    .filter((day) => day.enabled)
    .flatMap((day) => day.ranges.map((range) => ({ weekday: day.weekday, start: range.start, end: range.end })))
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));

/** Erro de validação da semana (início < fim, sem sobreposição) ou null. */
export const validateWeek = (week: DaySchedule[], dayName: (weekday: number) => string): string | null => {
  for (const day of week) {
    if (!day.enabled) continue;
    const sorted = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 0; i < sorted.length; i += 1) {
      const { start, end } = sorted[i];
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return `${dayName(day.weekday)}: informe início e fim.`;
      if (start >= end) return `${dayName(day.weekday)}: o início precisa ser antes do fim.`;
      if (i > 0 && start < sorted[i - 1].end) return `${dayName(day.weekday)}: há intervalos sobrepostos.`;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------------------------
// Rótulos
// ---------------------------------------------------------------------------------------------

export const FEATURE_LABELS: Record<string, string> = {
  agenda: 'Agenda online e de balcão',
  public_page: 'Página pública da barbearia',
  online_booking: 'Agendamento online pelos clientes',
  email_reminders: 'Lembretes por e-mail',
  in_person_payments: 'Registro de pagamentos no balcão',
  financial_reports: 'Relatórios financeiros',
  clients_crm: 'Base de clientes com histórico',
  csv_export: 'Exportação em CSV',
  network_dashboard: 'Painel consolidado da rede',
  branch_managers: 'Gerentes por filial',
  priority_support: 'Suporte prioritário',
};

export const featureLabel = (code: string): string => FEATURE_LABELS[code] ?? code.replace(/_/g, ' ');

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  trialing: { label: 'Período de teste', tone: 'blue' },
  pending: { label: 'Aguardando pagamento', tone: 'yellow' },
  active: { label: 'Ativa', tone: 'green' },
  past_due: { label: 'Pagamento em atraso', tone: 'red' },
  canceled: { label: 'Cancelada', tone: 'gray' },
  expired: { label: 'Expirada', tone: 'red' },
};

export const INVITATION_STATUS: Record<InvitationStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pendente', tone: 'orange' },
  accepted: { label: 'Aceito', tone: 'green' },
  revoked: { label: 'Cancelado', tone: 'gray' },
  expired: { label: 'Expirado', tone: 'red' },
};

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  manager: 'Gerente',
  receptionist: 'Atendimento',
};

/** "ilimitado" quando o limite é null. */
export const limitLabel = (value: number | null | undefined, singular: string, plural: string, feminine = false): string =>
  value === null || value === undefined
    ? `${plural.charAt(0).toUpperCase()}${plural.slice(1)} ilimitad${feminine ? 'as' : 'os'}`
    : `Até ${value} ${value === 1 ? singular : plural}`;

/** Dias inteiros até a data (mínimo 0). */
export const daysUntil = (iso: string | null | undefined, now: Date = new Date()): number => {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86400000));
};

export const barberName = (barber: Pick<ManagedBarber, 'id' | 'display_name'>): string => barber.display_name || `Barbeiro #${barber.id}`;

/** Funde barbeiros ativos (DTO público, com nome e serviços) com as linhas cruas da filial (inclui inativos). */
export const mergeBarbers = (
  raw: { id: number; user_id: number; branch_id: number; display_name: string | null; bio: string | null; photo_url: string | null; active: boolean }[],
  publicList: { id: number; display_name: string | null; bio: string | null; photo_url: string | null; branch_id: number; active?: boolean; services?: { id: number; name: string }[] }[]
): ManagedBarber[] => {
  const byId = new Map<number, ManagedBarber>();
  for (const row of raw) {
    byId.set(row.id, {
      id: row.id,
      user_id: row.user_id,
      branch_id: row.branch_id,
      display_name: row.display_name,
      bio: row.bio,
      photo_url: row.photo_url,
      active: row.active !== false,
      services: [],
    });
  }
  for (const item of publicList) {
    const current = byId.get(item.id);
    byId.set(item.id, {
      id: item.id,
      user_id: current?.user_id ?? null,
      branch_id: item.branch_id,
      display_name: item.display_name ?? current?.display_name ?? null,
      bio: item.bio ?? current?.bio ?? null,
      photo_url: item.photo_url ?? current?.photo_url ?? null,
      active: item.active !== false,
      services: item.services ?? [],
    });
  }
  return [...byId.values()].sort((a, b) => Number(b.active) - Number(a.active) || barberName(a).localeCompare(barberName(b), 'pt-BR'));
};

/** Busca o endereço pelo CEP (ViaCEP, público). Falha silenciosa → null. */
export const lookupCep = async (
  cep: string,
  fetcher: typeof fetch = fetch
): Promise<{ street: string; neighborhood: string; city: string; state: string } | null> => {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const response = await fetcher(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
    if (data.erro) return null;
    return { street: data.logradouro ?? '', neighborhood: data.bairro ?? '', city: data.localidade ?? '', state: data.uf ?? '' };
  } catch {
    return null;
  }
};
