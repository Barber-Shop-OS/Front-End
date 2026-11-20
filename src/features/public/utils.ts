// Regras puras das páginas públicas: links de agendamento, agrupamento de horários, fotos de fallback e rótulos.
import type { Address, OpeningHour, Plan } from '@/types/api';

import landingShop1 from '@/assets/figma/landing/shop-1.png';
import landingShop2 from '@/assets/figma/landing/shop-2.png';
import landingShop3 from '@/assets/figma/landing/shop-3.png';
import searchShop1 from '@/assets/figma/public/search-shop-1.png';
import searchShop2 from '@/assets/figma/public/search-shop-2.png';
import searchShop3 from '@/assets/figma/public/search-shop-3.png';
import searchShop4 from '@/assets/figma/public/search-shop-4.png';

/** Fotos do Figma usadas quando a barbearia não tem capa (a busca pública não devolve cover_url). */
export const FALLBACK_COVERS = [landingShop1, landingShop2, landingShop3, searchShop1, searchShop2, searchShop3, searchShop4];

/** Escolhe uma foto de fallback estável para o id (o mesmo registro sempre recebe a mesma foto). */
export const fallbackCover = (id: number, pool: string[] = FALLBACK_COVERS): string => pool[Math.abs(Math.trunc(id)) % pool.length];

interface BookingTarget {
  branchId?: number | null;
  serviceId?: number | null;
  barberId?: number | null;
}

/**
 * Rota do fluxo de agendamento (/b/:slug/agendar). A filial vai em `branch` (contrato combinado);
 * `filial`/`servico`/`barbeiro` são mantidos porque a BookingPage atual lê esses nomes.
 */
export const bookingPath = (slug: string, { branchId, serviceId, barberId }: BookingTarget = {}): string => {
  const params = new URLSearchParams();
  if (branchId) {
    params.set('branch', String(branchId));
    params.set('filial', String(branchId));
  }
  if (serviceId) params.set('servico', String(serviceId));
  if (barberId) params.set('barbeiro', String(barberId));
  const query = params.toString();
  return `/b/${encodeURIComponent(slug)}/agendar${query ? `?${query}` : ''}`;
};

/** "09:00:00" → "09:00". */
export const shortTime = (value: string): string => value.slice(0, 5);

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
/** Ordem de exibição: segunda a domingo. */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export interface HoursRow {
  label: string;
  value: string;
  closed: boolean;
  weekdays: number[];
}

/**
 * Agrupa dias consecutivos (seg→dom) com o mesmo expediente, como no Figma:
 * "Segunda - Sexta 09:00 - 21:00", "Sábado 08:00 - 19:00", "Domingo Fechado".
 */
export const groupOpeningHours = (hours: OpeningHour[]): HoursRow[] => {
  const describe = (weekday: number) => {
    const intervals = hours
      .filter((hour) => hour.weekday === weekday)
      .sort((a, b) => a.opens_at.localeCompare(b.opens_at))
      .map((hour) => `${shortTime(hour.opens_at)} - ${shortTime(hour.closes_at)}`);
    return intervals.length ? intervals.join(', ') : 'Fechado';
  };
  const rows: HoursRow[] = [];
  for (const weekday of DISPLAY_ORDER) {
    const value = describe(weekday);
    const last = rows[rows.length - 1];
    if (last && last.value === value) last.weekdays.push(weekday);
    else rows.push({ label: '', value, closed: value === 'Fechado', weekdays: [weekday] });
  }
  return rows.map((row) => {
    const first = DAY_NAMES[row.weekdays[0]];
    const lastDay = DAY_NAMES[row.weekdays[row.weekdays.length - 1]];
    return { ...row, label: row.weekdays.length === 1 ? first : `${first} - ${lastDay}` };
  });
};

/** "Jardins, São Paulo" — bairro e cidade (cards). */
export const shortLocation = (address: Address | null | undefined): string =>
  address ? [address.neighborhood, address.city].filter(Boolean).join(', ') : '';

/** "Rua Oscar Freire, 1234" (linha 1) e "São Paulo - SP" (linha 2). */
export const addressLines = (address: Address | null | undefined): [string, string] | null =>
  address
    ? [
        [address.street, address.number].filter((part) => part !== null && part !== undefined && part !== '').join(', ') +
          (address.neighborhood ? ` — ${address.neighborhood}` : ''),
        `${address.city} - ${address.state}`,
      ]
    : null;

/** "0,8 km" / "350 m". */
export const formatDistance = (km: number | null | undefined): string | null => {
  if (km === null || km === undefined || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
};

/** Rótulos dos recursos dos planos (códigos de Back-End/src/shared/plans.js). */
export const PLAN_FEATURE_LABELS: Record<string, string> = {
  agenda: 'Agenda completa por barbeiro',
  public_page: 'Página pública da barbearia',
  online_booking: 'Agendamento online 24h',
  email_reminders: 'Lembretes automáticos por e-mail',
  in_person_payments: 'Registro de pagamentos presenciais',
  financial_reports: 'Relatórios financeiros',
  clients_crm: 'Histórico e cadastro de clientes',
  csv_export: 'Exportação em CSV',
  network_dashboard: 'Painel consolidado da rede',
  branch_managers: 'Gerentes por filial',
  priority_support: 'Suporte prioritário',
};

export const planFeatureLabel = (code: string): string => PLAN_FEATURE_LABELS[code] ?? code.replace(/_/g, ' ');

/** "Até 3 filiais" / "1 filial" / "Barbeiros ilimitados". */
export const planLimitLabel = (value: number | null, singular: string, plural: string, unlimited: string): string =>
  value === null ? unlimited : value === 1 ? `1 ${singular}` : `Até ${value} ${plural}`;

/** Planos em ordem de preço. */
export const sortPlans = (plans: Plan[]): Plan[] => [...plans].sort((a, b) => a.price_cents - b.price_cents);

/** "Ricardo Silva" → "RS". */
export const initials = (name: string | null | undefined): string =>
  String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
