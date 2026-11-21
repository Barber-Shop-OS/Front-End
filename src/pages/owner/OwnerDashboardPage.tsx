// Figma 1:3879 "Dashboard do Dono": cabeçalho com "Novo Agendamento", 3 KPIs do dia com variação vs ontem,
// card de ações rápidas, "Receita Semanal" (barras HTML/CSS dos últimos 7 dias) e "Próximos Cortes".
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowRight, CalendarCheck, Clock, Plus, Users, Wallet } from 'lucide-react';

import { ButtonLink, EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from '@/components/ui';
import { useListAppointmentsQuery } from '@/features/appointments/api';
import { DeltaBadge, KpiCard, RevenueBars, WorkspaceGate } from '@/features/owner-ops/components';
import { useOwnerOpsSummaryQuery } from '@/features/owner-ops/api';
import { appointmentClientName, dailyBars, pctChange, previousRange, sumRevenue } from '@/features/owner-ops/metrics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { addDays, DEFAULT_TIMEZONE, formatShortDate, formatTime, todayIn, toLocalDate } from '@/utils/date';
import { formatBRL } from '@/utils/format';
import { cn } from '@/utils/cn';

const dayMonth = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(y, m - 1, d)));
};

type Scope = 'branch' | 'all';

const OwnerDashboardPage = () => {
  usePageTitle('Painel');
  const ctx = useActiveContext();
  return (
    <WorkspaceGate ctx={ctx}>
      <DashboardContent ctx={ctx} />
    </WorkspaceGate>
  );
};

const DashboardContent = ({ ctx }: { ctx: ReturnType<typeof useActiveContext> }) => {
  const [scope, setScope] = useState<Scope>('branch');
  const timeZone = ctx.branch?.timezone ?? DEFAULT_TIMEZONE;
  const today = todayIn(timeZone);
  const yesterday = addDays(today, -1);
  const barbershopId = ctx.barbershop?.id;
  const branchId = scope === 'branch' ? ctx.branch?.id : undefined;
  const base = barbershopId ? { barbershop_id: barbershopId, branch_id: branchId } : null;

  const todayQuery = useOwnerOpsSummaryQuery(base ? { ...base, from: today, to: today } : skipToken);
  const yesterdayQuery = useOwnerOpsSummaryQuery(base ? { ...base, from: yesterday, to: yesterday } : skipToken);
  // 14 dias: semana atual + semana anterior para a variação da receita semanal.
  const weekQuery = useOwnerOpsSummaryQuery(base ? { ...base, from: addDays(today, -13), to: today } : skipToken);
  const [nowIso] = useState(() => new Date().toISOString());
  const upcoming = useListAppointmentsQuery({ branch_id: branchId, status: 'confirmado', from: nowIso, pageSize: 4, sortBy: 'start_at', sortDir: 'ASC' });

  const kpis = useMemo(() => {
    const t = todayQuery.data;
    const y = yesterdayQuery.data;
    if (!t) return null;
    const booked = (s: typeof t) => s.appointments.total - (s.appointments.by_status.cancelado ?? 0);
    return {
      appointments: booked(t),
      appointmentsDelta: y ? pctChange(booked(t), booked(y)) : null,
      revenue: Number(t.revenue.total),
      revenueDelta: y ? pctChange(Number(t.revenue.total), Number(y.revenue.total)) : null,
      attended: t.appointments.by_status.concluido ?? 0,
      attendedDelta: y ? pctChange(t.appointments.by_status.concluido ?? 0, y.appointments.by_status.concluido ?? 0) : null,
    };
  }, [todayQuery.data, yesterdayQuery.data]);

  const week = useMemo(() => {
    const series = weekQuery.data?.revenue_by_day;
    const current = { from: addDays(today, -6), to: today };
    const total = sumRevenue(series, current);
    return { bars: dailyBars(series, today, 7), total, delta: series ? pctChange(total, sumRevenue(series, previousRange(current))) : null };
  }, [weekQuery.data, today]);

  const kpiError = todayQuery.error;
  const showScope = ctx.isOwner && ctx.branches.length > 1;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description={`Visão geral do negócio para hoje, ${dayMonth(today)}.`}
        action={
          <ButtonLink to="/dashboard/agendamentos/novo" icon={<Plus className="h-4 w-4" />}>
            Novo Agendamento
          </ButtonLink>
        }
      />

      {showScope ? (
        <div className="-mt-4 flex flex-wrap items-center gap-3">
          <Tabs<Scope>
            value={scope}
            onChange={setScope}
            tabs={[
              { value: 'branch', label: ctx.branch?.name ?? 'Filial atual' },
              { value: 'all', label: 'Todas as filiais' },
            ]}
          />
        </div>
      ) : null}

      {kpiError ? (
        <ErrorState error={kpiError} onRetry={() => void todayQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<CalendarCheck className="h-5 w-5" />}
            label="Agendamentos hoje"
            value={kpis?.appointments ?? 0}
            delta={kpis?.appointmentsDelta}
            deltaHint="vs. ontem"
            loading={todayQuery.isLoading}
          />
          <KpiCard
            icon={<Wallet className="h-5 w-5" />}
            label="Faturamento hoje"
            value={formatBRL(kpis?.revenue ?? 0)}
            delta={kpis?.revenueDelta}
            deltaHint="vs. ontem"
            loading={todayQuery.isLoading}
          />
          <KpiCard
            icon={<Users className="h-5 w-5" />}
            label="Clientes atendidos"
            value={kpis?.attended ?? 0}
            delta={kpis?.attendedDelta}
            deltaHint="vs. ontem"
            loading={todayQuery.isLoading}
          />
          <section className="flex flex-col justify-center gap-3 rounded-xl bg-primary-600/5 p-6 sm:col-span-2 xl:col-span-1">
            <h2 className="pb-2 text-sm font-bold uppercase tracking-label text-primary-600">Ações rápidas</h2>
            {(ctx.isOwner
              ? [
                  { to: '/dashboard/barbeiros', label: 'Adicionar barbeiro' },
                  { to: '/dashboard/servicos', label: 'Criar serviço' },
                ]
              : [
                  { to: '/dashboard/clientes', label: 'Cadastrar cliente' },
                  { to: '/dashboard/agenda', label: 'Ver agenda' },
                ]
            ).map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex min-h-[48px] items-center justify-between gap-2 rounded-lg bg-white px-4 py-3 text-base font-bold tracking-[-0.025em] text-primary-600 transition hover:bg-surface-low focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {action.label}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </section>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-8 rounded-xl bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Receita Semanal</h2>
              {weekQuery.data ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-ink-variant">
                  {formatBRL(week.total)} nos últimos 7 dias <DeltaBadge value={week.delta} hint="vs. 7 dias anteriores" />
                </p>
              ) : null}
            </div>
            <Link to="/dashboard/rendimentos" className="text-sm font-medium text-primary-600 hover:underline">
              Ver Relatório Completo
            </Link>
          </div>
          {weekQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : weekQuery.error ? (
            <ErrorState error={weekQuery.error} onRetry={() => void weekQuery.refetch()} />
          ) : (
            <RevenueBars bars={week.bars} highlight={today} />
          )}
        </section>

        <section className="flex flex-col rounded-xl bg-surface-highest/30 p-6">
          <h2 className="pb-6 text-lg font-bold tracking-[-0.025em] text-ink">Próximos Cortes</h2>
          {upcoming.isLoading ? (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-20 w-full" />
              ))}
            </div>
          ) : upcoming.error ? (
            <ErrorState error={upcoming.error} onRetry={() => void upcoming.refetch()} />
          ) : !upcoming.data?.items.length ? (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="Nenhum horário marcado" description="Os próximos agendamentos aparecem aqui." className="bg-white" />
          ) : (
            <ul className="flex flex-col gap-4">
              {upcoming.data.items.map((item, index) => {
                const tz = item.Branch?.timezone ?? timeZone;
                const sameDay = toLocalDate(item.start_at, tz) === today;
                return (
                  <li key={item.id}>
                    <Link
                      to="/dashboard/agenda"
                      className={cn('flex items-center gap-4 rounded-lg bg-white p-4 transition hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary-600', index > 1 && 'opacity-70')}
                    >
                      <span
                        className={cn(
                          'flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded text-sm font-bold leading-4',
                          index === 0 ? 'bg-primary-100 text-primary-600' : 'bg-surface-high text-ink-variant'
                        )}
                      >
                        {formatTime(item.start_at, tz)}
                        {!sameDay ? <span className="mt-0.5 text-[10px] font-semibold">{formatShortDate(item.start_at, tz)}</span> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{appointmentClientName(item)}</span>
                        <span className="block truncate text-xs text-ink-variant">{item.service_name_snapshot}</span>
                      </span>
                      <Clock className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/dashboard/agenda" className="mt-6 text-center text-sm font-bold text-primary-600 hover:underline">
            Ver agenda completa
          </Link>
        </section>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
