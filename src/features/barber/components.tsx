// Peças visuais da área do barbeiro (Figma 1:5027, 1:4578, 1:4820, 1:5175), sobre os tokens do design system.
import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { STATUS_LABEL } from '@/components/ui';
import type { AppointmentStatus } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatBRL } from '@/utils/format';

import { profileLabel, type ChangeInfo, type SeriesPoint } from './helpers';
import type { BarberProfileContext } from './useBarberProfile';

/** Seletor de perfil (só aparece com 2+ perfis em filiais diferentes). */
export const BarberProfileSelect = ({ ctx }: { ctx: BarberProfileContext }) => {
  if (ctx.profiles.length < 2 || !ctx.profile) return null;
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-label text-ink-variant">
      Filial
      <select
        className="h-10 rounded-lg border-0 bg-surface-low px-3 text-sm font-semibold normal-case tracking-normal text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
        value={ctx.profile.id}
        onChange={(event) => ctx.setProfileId(Number(event.target.value))}
      >
        {ctx.profiles.map((item) => (
          <option key={item.id} value={item.id}>
            {profileLabel(item)}
          </option>
        ))}
      </select>
    </label>
  );
};

/** Linha de variação ("+12% vs. ontem"), verde/vermelha conforme a direção. */
export const ChangeHint = ({ change, fallback, inverse }: { change: ChangeInfo | null; fallback?: ReactNode; inverse?: boolean }) => {
  if (!change) return fallback ? <p className={cn('text-xs font-medium', inverse ? 'text-primary-100' : 'text-ink-variant')}>{fallback}</p> : null;
  const Icon = change.tone === 'down' ? TrendingDown : TrendingUp;
  const tone = inverse
    ? 'text-primary-100'
    : change.tone === 'up'
      ? 'text-success-700'
      : change.tone === 'down'
        ? 'text-danger-600'
        : 'text-ink-variant';
  return (
    <p className={cn('flex items-center gap-1 text-xs font-semibold', tone)}>
      {change.tone !== 'flat' ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {change.label}
    </p>
  );
};

/** Card de KPI do Figma: rótulo + ícone, número Black 30–36, linha de apoio. */
export const KpiCard = ({
  label,
  icon,
  value,
  footer,
  highlight,
  className,
}: {
  label: string;
  icon?: ReactNode;
  value: ReactNode;
  footer?: ReactNode;
  highlight?: boolean;
  className?: string;
}) => (
  <section
    className={cn(
      'relative flex min-h-[152px] flex-col justify-between gap-3 overflow-hidden rounded-xl p-6',
      highlight ? 'bg-primary-600 text-white shadow-primary' : 'bg-white shadow-card',
      className
    )}
  >
    {highlight ? <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" aria-hidden="true" /> : null}
    <div className="flex items-center justify-between gap-3">
      <p className={cn('text-sm font-medium', highlight ? 'text-primary-100' : 'text-ink-variant')}>{label}</p>
      {icon ? <span className={cn(highlight ? 'text-white' : 'text-primary-600')}>{icon}</span> : null}
    </div>
    <div className={cn('text-[30px] font-black leading-9 tracking-[-0.05em] sm:text-4xl sm:leading-10', highlight ? 'text-white' : 'text-ink')}>{value}</div>
    {footer ? <div>{footer}</div> : null}
  </section>
);

/** Barra de progresso fina (Figma: trilho surface-high 8px, preenchimento primário). */
export const ProgressBar = ({ value, label }: { value: number; label: string }) => {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div className="h-full rounded-full bg-primary-600 transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
};

/** Gráfico de barras simplificado (Figma "Simplified Bar Chart Visual"): 7 barras com valor e dia. */
export const WeeklyBarChart = ({ points, highlightDate }: { points: SeriesPoint[]; highlightDate?: string }) => (
  <div className="flex h-56 items-end gap-2 sm:gap-3" role="img" aria-label={`Receita por dia: ${points.map((point) => `${point.label} ${formatBRL(point.amount)}`).join(', ')}`}>
    {points.map((point) => {
      const active = point.date === highlightDate;
      return (
        <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <span className={cn('truncate text-[11px] font-semibold', active ? 'text-primary-600' : 'text-ink-variant')}>
            {point.amount > 0 ? formatBRL(point.amount).replace(/,00$/, '') : ''}
          </span>
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className={cn('w-full max-w-[40px] rounded-t-lg transition-[height]', active ? 'bg-primary-600' : point.amount > 0 ? 'bg-primary-100' : 'bg-surface-high')}
              style={{ height: `${Math.max(point.ratio * 100, 4)}%` }}
            />
          </div>
          <span className={cn('text-xs font-semibold uppercase tracking-label', active ? 'text-primary-600' : 'text-ink-variant')}>{point.label}</span>
        </div>
      );
    })}
  </div>
);

const CHIP: Record<AppointmentStatus, { box: string; dot: string; edge: string }> = {
  confirmado: { box: 'bg-primary-100 text-primary-600', dot: 'bg-primary-600', edge: 'bg-primary-600' },
  concluido: { box: 'bg-success-50 text-success-700', dot: 'bg-success-600', edge: 'bg-success-600' },
  cancelado: { box: 'bg-surface-high text-ink-variant', dot: 'bg-outline', edge: 'bg-outline-variant' },
  nao_compareceu: { box: 'bg-danger-50 text-danger-700', dot: 'bg-danger-600', edge: 'bg-danger-600' },
};

/** Chip de status com ponto (Figma "Status Chip"). */
export const StatusChip = ({ status }: { status: AppointmentStatus }) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold leading-4', CHIP[status].box)}>
    <span className={cn('h-1.5 w-1.5 rounded-full', CHIP[status].dot)} aria-hidden="true" />
    {STATUS_LABEL[status]}
  </span>
);

/** Faixa lateral sutil de status do card (Figma "Subtle status edge"). */
export const statusEdgeClass = (status: AppointmentStatus): string => CHIP[status].edge;

/** Avatar de iniciais 48px (Figma: quadrado raio 12, primary-fixed). */
export const Initials = ({ name, className }: { name: string; className?: string }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-600', className)} aria-hidden="true">
      {initials || '?'}
    </span>
  );
};
