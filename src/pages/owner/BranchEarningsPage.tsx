// Figma 1:3498 "Rendimentos da Filial": filial ativa + período, receita de hoje/semana/mês com variação,
// evolução da receita (barras HTML/CSS), indicadores do período e receita por barbeiro e por serviço.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { BadgeDollarSign, CalendarDays, Scissors, Sparkles, Store, UserRound } from 'lucide-react';

import { Alert, Avatar, buttonClass, EmptyState, ErrorState, ListSkeleton, PageHeader, Skeleton, Tabs } from '@/components/ui';
import { useOwnerOpsSummaryQuery } from '@/features/owner-ops/api';
import { KpiCard, RevenueBars, WorkspaceGate } from '@/features/owner-ops/components';
import { dailyBars, pctChange, PERIOD_DAYS, PERIOD_LABEL, periodRange, previousRange, serviceRows, sumRevenue, type PeriodPreset } from '@/features/owner-ops/metrics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useActiveContext, type ActiveContext } from '@/features/workspace/useActiveContext';
import { addDays, DEFAULT_TIMEZONE, todayIn } from '@/utils/date';
import { formatBRL } from '@/utils/format';

const BranchEarningsPage = () => {
  usePageTitle('Rendimentos da filial');
  const ctx = useActiveContext();
  return (
    <WorkspaceGate ctx={ctx}>
      <EarningsContent ctx={ctx} />
    </WorkspaceGate>
  );
};

const ShareRow = ({ name, detail, revenue, share, avatar }: { name: string; detail: string; revenue: number; share: number; avatar?: boolean }) => (
  <li className="flex items-center gap-3 rounded-lg bg-white p-4">
    {avatar ? (
      <Avatar name={name} size="sm" />
    ) : (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600" aria-hidden="true">
        <Scissors className="h-4 w-4" />
      </span>
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-bold text-ink">{name}</p>
        <p className="shrink-0 text-sm font-bold text-ink">{formatBRL(revenue)}</p>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded bg-surface-low" aria-hidden="true">
          <div className="h-1.5 rounded bg-primary-600" style={{ width: `${share}%` }} />
        </div>
        <span className="shrink-0 text-xs text-ink-variant">{detail}</span>
      </div>
    </div>
  </li>
);

const EarningsContent = ({ ctx }: { ctx: ActiveContext }) => {
  const [preset, setPreset] = useState<PeriodPreset>('week');
  const branch = ctx.branch;
  const timeZone = branch?.timezone ?? DEFAULT_TIMEZONE;
  const today = todayIn(timeZone);
  const base = ctx.barbershop && branch ? { barbershop_id: ctx.barbershop.id, branch_id: branch.id } : null;

  // 60 dias de série diária → hoje/ontem, semana/semana anterior e mês/mês anterior sem chamadas extras.
  const series = useOwnerOpsSummaryQuery(base ? { ...base, from: addDays(today, -59), to: today } : skipToken);
  const range = periodRange(preset, today);
  const period = useOwnerOpsSummaryQuery(base ? { ...base, ...range } : skipToken);

  const kpis = useMemo(() => {
    const byDay = series.data?.revenue_by_day;
    return (['today', 'week', 'month'] as const).map((key) => {
      const current = periodRange(key, today);
      const value = sumRevenue(byDay, current);
      return { key, value, delta: byDay ? pctChange(value, sumRevenue(byDay, previousRange(current))) : null };
    });
  }, [series.data, today]);

  const chartDays = Math.max(PERIOD_DAYS[preset], 7);
  const bars = useMemo(() => dailyBars(series.data?.revenue_by_day, today, chartDays), [series.data, today, chartDays]);

  const data = period.data;
  const locked = data?.locked_features?.includes('financial_reports');
  const barbers = data?.revenue_by_barber ?? [];
  const services = serviceRows(data);
  const barberMax = Math.max(0, ...barbers.map((item) => Number(item.revenue)));
  const serviceMax = Math.max(0, ...services.map((item) => item.revenue));
  const KPI_META = {
    today: { label: 'Receita de hoje', hint: 'vs. ontem', icon: <CalendarDays className="h-5 w-5" /> },
    week: { label: 'Receita da semana', hint: 'vs. 7 dias anteriores', icon: <Sparkles className="h-5 w-5" /> },
    month: { label: 'Receita do mês', hint: 'vs. 30 dias anteriores', icon: <BadgeDollarSign className="h-5 w-5" /> },
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Rendimentos da Filial"
        description="Visão geral do desempenho financeiro."
        action={
          <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-low px-4 text-sm font-semibold text-ink">
            <Store className="h-4 w-4 text-primary-600" aria-hidden="true" />
            {branch?.name}
          </span>
        }
      />

      {series.error ? (
        <ErrorState error={series.error} onRetry={() => void series.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.key}
              icon={KPI_META[kpi.key].icon}
              label={KPI_META[kpi.key].label}
              value={formatBRL(kpi.value)}
              delta={kpi.delta}
              deltaHint={KPI_META[kpi.key].hint}
              loading={series.isLoading}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Período</h2>
        <Tabs<PeriodPreset> value={preset} onChange={setPreset} tabs={(['today', 'week', 'month'] as const).map((value) => ({ value, label: PERIOD_LABEL[value] }))} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-card lg:col-span-2">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Evolução de Receita</h2>
            <p className="text-sm text-ink-variant">Últimos {chartDays} dias</p>
          </div>
          {series.isLoading ? <Skeleton className="h-64 w-full" /> : <RevenueBars bars={bars} highlight={today} />}
        </section>
        <section className="flex flex-col gap-3 rounded-xl bg-surface-highest/30 p-6">
          <h2 className="pb-2 text-lg font-bold tracking-[-0.025em] text-ink">Indicadores</h2>
          {period.isLoading ? (
            <ListSkeleton rows={4} />
          ) : period.error ? (
            <ErrorState error={period.error} onRetry={() => void period.refetch()} />
          ) : data ? (
            [
              { label: 'Receita no período', value: formatBRL(data.revenue.total) },
              { label: 'Atendimentos concluídos', value: String(data.appointments.by_status.concluido ?? 0) },
              { label: 'Ticket médio', value: formatBRL(data.revenue.average_ticket) },
              { label: 'Ocupação da agenda', value: `${Math.round((data.occupancy.rate ?? 0) * 100)}%` },
              { label: 'Faltas', value: String(data.appointments.by_status.nao_compareceu ?? 0) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3">
                <span className="text-sm text-ink-variant">{item.label}</span>
                <span className="text-sm font-bold text-ink">{item.value}</span>
              </div>
            ))
          ) : null}
        </section>
      </div>

      {locked ? (
        <Alert
          tone="info"
          title="Relatórios financeiros detalhados"
          action={
            ctx.isOwner ? (
              <Link to="/dashboard/assinatura" className={buttonClass('primary', 'sm')}>
                Ver planos
              </Link>
            ) : undefined
          }
        >
          A receita por barbeiro e por serviço está disponível em um plano superior.
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-surface-highest/30 p-6">
            <h2 className="pb-4 text-lg font-bold tracking-[-0.025em] text-ink">Por barbeiro</h2>
            {period.isLoading ? (
              <ListSkeleton rows={3} />
            ) : !barbers.length ? (
              <EmptyState icon={<UserRound className="h-6 w-6" />} title="Sem atendimentos no período" className="bg-white" />
            ) : (
              <ul className="flex flex-col gap-3">
                {barbers.map((item) => (
                  <ShareRow
                    key={item.barber_id}
                    avatar
                    name={item.name}
                    revenue={Number(item.revenue)}
                    share={barberMax ? Math.round((Number(item.revenue) / barberMax) * 100) : 0}
                    detail={`${item.appointments} atendimento${item.appointments === 1 ? '' : 's'}`}
                  />
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl bg-surface-highest/30 p-6">
            <h2 className="pb-4 text-lg font-bold tracking-[-0.025em] text-ink">Por serviço</h2>
            {period.isLoading ? (
              <ListSkeleton rows={3} />
            ) : !services.length ? (
              <EmptyState icon={<Scissors className="h-6 w-6" />} title="Sem serviços no período" className="bg-white" />
            ) : (
              <ul className="flex flex-col gap-3">
                {services.map((item) => (
                  <ShareRow
                    key={item.id}
                    name={item.name}
                    revenue={item.revenue}
                    share={serviceMax ? Math.round((item.revenue / serviceMax) * 100) : 0}
                    detail={`${item.count} agendamento${item.count === 1 ? '' : 's'}`}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default BranchEarningsPage;
