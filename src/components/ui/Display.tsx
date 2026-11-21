// FE-06: componentes de exibição — Card, PageHeader, Badge de status, Avatar, Tabs, Pagination, Stat.
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { AppointmentStatus } from '@/types/api';
import { cn } from '@/utils/cn';

export const Card = ({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) => (
  <section className={cn('rounded-xl bg-white shadow-card', padded && 'p-4 sm:p-6', className)}>{children}</section>
);

export const CardTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">{children}</h2>
    {action}
  </div>
);

export const PageHeader = ({ title, description, action, back }: { title: string; description?: ReactNode; action?: ReactNode; back?: ReactNode }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      {back ? <div className="mb-2">{back}</div> : null}
      <h1 className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-ink sm:text-4xl sm:leading-10">{title}</h1>
      {description ? <p className="mt-1 text-sm text-ink-variant">{description}</p> : null}
    </div>
    {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
  </div>
);

export type BadgeTone = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange';
const badgeTones: Record<BadgeTone, string> = {
  gray: 'bg-surface-high text-ink-variant',
  blue: 'bg-primary-100 text-primary-600',
  green: 'bg-success-50 text-success-700',
  yellow: 'bg-warning-50 text-warning-700',
  red: 'bg-danger-50 text-danger-700',
  orange: 'bg-tertiary-fixed text-tertiary',
};

export const Badge = ({ tone = 'gray', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center whitespace-nowrap rounded-xl px-2 py-1 text-xs font-bold leading-4', badgeTones[tone], className)}>{children}</span>
);

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  nao_compareceu: 'Não compareceu',
};
const STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  confirmado: 'blue',
  concluido: 'green',
  cancelado: 'gray',
  nao_compareceu: 'red',
};

export const StatusBadge = ({ status }: { status: AppointmentStatus }) => <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;

export const Avatar = ({ name, src, size = 'md' }: { name?: string | null; src?: string | null; size?: 'sm' | 'md' | 'lg' }) => {
  const initials = String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-sm';
  return src ? (
    <img src={src} alt={name || ''} className={cn('shrink-0 rounded-xl border border-outline-variant/30 object-cover', dimension)} />
  ) : (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-xl bg-surface-highest font-bold text-primary-600', dimension)} aria-hidden="true">
      {initials}
    </span>
  );
};

export const Tabs = <T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: ReactNode }[]; value: T; onChange: (value: T) => void }) => (
  <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface-low p-1" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={tab.value === value}
        onClick={() => onChange(tab.value)}
        className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition', tab.value === value ? 'bg-white text-primary-600 shadow-card' : 'text-ink-variant hover:text-ink')}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export const Pagination = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-between gap-2" aria-label="Paginação">
      <button type="button" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink-variant hover:bg-surface-low disabled:opacity-40" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" /> Anterior
      </button>
      <span className="text-sm text-ink-variant">
        Página {page} de {totalPages}
      </span>
      <button type="button" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink-variant hover:bg-surface-low disabled:opacity-40" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Próxima <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export const Stat = ({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) => (
  <Card>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-ink-variant">{label}</p>
        <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{value}</p>
        {hint ? <p className="mt-1 text-xs text-ink-variant">{hint}</p> : null}
      </div>
      {icon ? <div className="rounded-lg bg-primary-100 p-2 text-primary-600">{icon}</div> : null}
    </div>
  </Card>
);
