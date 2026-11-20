// Peças visuais do grupo D seguindo o Figma "Dashboard do Dono" (1:3879): cards de KPI com selo de
// variação, gráfico de barras em HTML/CSS (sem libs) e o "portão" que exige barbearia/filial ativas.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

import { buttonClass, EmptyState, Skeleton } from '@/components/ui';
import type { ActiveContext } from '@/features/workspace/useActiveContext';
import { formatBRL } from '@/utils/format';
import { formatLocalDateShort } from '@/utils/date';
import { cn } from '@/utils/cn';

import { chartScale, formatCompact, formatPct, type ChartBar } from './metrics';

/** Selo "+12%" do Figma (primary-fixed); queda em vermelho. */
export const DeltaBadge = ({ value, hint }: { value: number | null | undefined; hint?: string }) => {
  if (value === null || value === undefined) return null;
  return (
    <span
      className={cn('rounded-xl px-2 py-1 text-xs font-bold', value < 0 ? 'bg-danger-50 text-danger-700' : 'bg-primary-100 text-primary-600')}
      title={hint}
      aria-label={`${formatPct(value)}${hint ? ` ${hint}` : ''}`}
    >
      {formatPct(value)}
    </span>
  );
};

export const KpiCard = ({
  icon,
  label,
  value,
  delta,
  deltaHint,
  hint,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: number | null;
  deltaHint?: string;
  hint?: ReactNode;
  loading?: boolean;
}) => (
  <section className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-card">
    <div className="flex items-start justify-between gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600" aria-hidden="true">
        {icon}
      </span>
      {!loading ? <DeltaBadge value={delta} hint={deltaHint} /> : null}
    </div>
    <p className="pt-3 text-sm font-medium text-ink-variant">{label}</p>
    {loading ? <Skeleton className="h-9 w-24" /> : <p className="text-3xl font-black leading-9 tracking-[-0.05em] text-ink">{value}</p>}
    {hint && !loading ? <p className="text-xs text-ink-variant">{hint}</p> : null}
  </section>
);

/**
 * Barras de receita por dia (Figma "Receita Semanal"): eixo Y com 6 marcas à esquerda, barras de no
 * máximo 40px com topo arredondado, a barra destacada em primary e as demais em primary-fixed; tooltip
 * inverse-surface no hover/foco e uma tabela equivalente para leitores de tela.
 */
export const RevenueBars = ({ bars, highlight, className }: { bars: ChartBar[]; highlight?: string; className?: string }) => {
  const max = Math.max(0, ...bars.map((bar) => bar.amount));
  const { top, ticks } = chartScale(max);
  return (
    <div className={cn('relative', className)}>
      <div className="flex h-64 items-stretch gap-2" aria-hidden="true">
        <div className="flex w-8 shrink-0 flex-col justify-between pb-6 text-xs text-ink-variant">
          {ticks.map((tick) => (
            <span key={tick} className="leading-4">
              {formatCompact(tick)}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-end justify-between gap-[2px] sm:gap-2">
          {bars.map((bar) => {
            const active = bar.date === highlight;
            const height = top ? Math.max((bar.amount / top) * 100, bar.amount > 0 ? 2 : 0) : 0;
            return (
              <div key={bar.date} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <div className="flex w-full flex-1 items-end justify-center pt-6 pb-2">
                  <div
                    className={cn(
                      'w-full max-w-[40px] rounded-t transition focus:outline-none focus:ring-2 focus:ring-primary-500',
                      active ? 'bg-primary-600' : 'bg-primary-100 group-hover:bg-primary-200'
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className={cn('text-xs leading-4', active ? 'font-bold text-primary-600' : 'text-ink-variant')}>{bar.label}</span>
                <span className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-inverse-surface px-2 py-1 text-xs text-inverse-on group-focus-within:block group-hover:block">
                  {formatLocalDateShort(bar.date)} · {formatBRL(bar.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <table className="sr-only">
        <caption>Receita por dia</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Receita</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.date}>
              <td>
                {bar.label} {formatLocalDateShort(bar.date)}
              </td>
              <td>{formatBRL(bar.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Exige barbearia (e, se pedido, filial) ativa antes de renderizar a tela. Dono sem barbearia vai
 * para o onboarding; sem filial, para o cadastro de filial (só o dono vê o atalho).
 */
export const WorkspaceGate = ({ ctx, requireBranch = true, children }: { ctx: ActiveContext; requireBranch?: boolean; children: ReactNode }) => {
  if (!ctx.barbershop) {
    return (
      <EmptyState
        icon={<Store className="h-6 w-6" />}
        title="Nenhuma barbearia vinculada"
        description="Cadastre sua barbearia para começar a usar o painel."
        action={
          <Link to="/nova-barbearia" className={buttonClass('primary')}>
            Cadastrar barbearia
          </Link>
        }
      />
    );
  }
  if (requireBranch && ctx.branchesLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (requireBranch && !ctx.branch) {
    return (
      <EmptyState
        icon={<Store className="h-6 w-6" />}
        title="Nenhuma filial cadastrada"
        description={ctx.isOwner ? 'Cadastre a primeira filial para abrir a agenda.' : 'Você ainda não foi vinculado a uma filial.'}
        action={
          ctx.isOwner ? (
            <Link to="/dashboard/filiais/nova" className={buttonClass('primary')}>
              Cadastrar filial
            </Link>
          ) : undefined
        }
      />
    );
  }
  return <>{children}</>;
};
