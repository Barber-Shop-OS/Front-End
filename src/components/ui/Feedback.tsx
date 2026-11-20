// FE-06: estados obrigatórios das telas — carregando, vazio, erro (com tentar de novo) e avisos.
import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw } from 'lucide-react';

import { cn } from '@/utils/cn';
import { apiErrorMessage } from '@/utils/apiErrors';

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn('animate-spin', className ?? 'h-5 w-5')} aria-hidden="true" />
);

export const FullScreenLoader = ({ label = 'Carregando…' }: { label?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-live="polite">
    <div className="flex flex-col items-center gap-3 text-ink-variant">
      <Spinner className="h-8 w-8 text-primary-600" />
      <span className="text-sm">{label}</span>
    </div>
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-lg bg-surface-high', className ?? 'h-4 w-full')} aria-hidden="true" />
);

export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-3" role="status" aria-label="Carregando">
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} className="h-16 w-full" />
    ))}
  </div>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center rounded-xl border border-dashed border-outline-variant bg-white px-6 py-10 text-center', className)}>
    {icon ? <div className="mb-3 text-ink-subtle">{icon}</div> : null}
    <p className="text-base font-semibold text-ink">{title}</p>
    {description ? <p className="mt-1 max-w-md text-sm text-ink-variant">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ error, title = 'Não foi possível carregar', onRetry, className }: ErrorStateProps) => (
  <div className={cn('flex flex-col items-center rounded-xl border border-danger-600/20 bg-danger-50 px-6 py-8 text-center', className)} role="alert">
    <AlertCircle className="mb-2 h-6 w-6 text-danger-600" aria-hidden="true" />
    <p className="font-semibold text-danger-700">{title}</p>
    <p className="mt-1 text-sm text-danger-700/80">{apiErrorMessage(error)}</p>
    {onRetry ? (
      <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-danger-700 shadow-sm hover:bg-danger-50">
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> Tentar novamente
      </button>
    ) : null}
  </div>
);

type AlertTone = 'info' | 'success' | 'warning' | 'error';
const alertStyles: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: 'border-primary-200 bg-primary-50 text-primary-900', icon: <Info className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" /> },
  success: { box: 'border-success-600/30 bg-success-50 text-success-700', icon: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" /> },
  warning: { box: 'border-warning-600/30 bg-warning-50 text-warning-700', icon: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" /> },
  error: { box: 'border-danger-600/30 bg-danger-50 text-danger-700', icon: <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> },
};

export const Alert = ({ tone = 'info', title, children, action, className }: { tone?: AlertTone; title?: string; children?: ReactNode; action?: ReactNode; className?: string }) => (
  <div className={cn('flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center', alertStyles[tone].box, className)} role={tone === 'error' ? 'alert' : 'status'}>
    <div className="flex flex-1 gap-3">
      {alertStyles[tone].icon}
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5' : ''}>{children}</div> : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
