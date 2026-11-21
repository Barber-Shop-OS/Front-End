// Figma 1:5027 "Dashboard do Barbeiro": saudação, KPIs do dia (atendimentos, receita, ocupação), receita da
// semana em barras e a fila de hoje com ações rápidas (concluir, não compareceu, pagamento).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Clock, Percent, Wallet } from 'lucide-react';

import { Card, CardTitle, EmptyState, ErrorState, ListSkeleton, PageHeader, Skeleton } from '@/components/ui';
import { useListAppointmentsQuery } from '@/features/appointments/api';
import { useGetBarberDashboardQuery } from '@/features/barber/api';
import { BarberProfileSelect, ChangeHint, KpiCard, ProgressBar, StatusChip, WeeklyBarChart, statusEdgeClass } from '@/features/barber/components';
import { appointmentClientName, dailySeries, dayRangeUtc, formatChange, formatDelta, startOfWeek, sumSeries, upcomingConfirmed, weekDates } from '@/features/barber/helpers';
import { useBarberProfile } from '@/features/barber/useBarberProfile';
import { useAuth } from '@/features/auth/hooks';
import { AppointmentDetailModal } from '@/features/owner-ops/staff';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Appointment } from '@/types/api';
import { cn } from '@/utils/cn';
import { addDays, formatLocalDateLong, formatTime, todayIn } from '@/utils/date';
import { formatBRL } from '@/utils/format';

const greeting = (timeZone: string) => {
  const hour = Number(new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', hour12: false }).format(new Date())) % 24;
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
};

const BarberDashboardPage = () => {
  usePageTitle('Meu dia');
  const { user } = useAuth();
  const ctx = useBarberProfile();
  const tz = ctx.timezone;
  const today = todayIn(tz);
  const yesterday = addDays(today, -1);
  const monday = startOfWeek(today);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const todayStats = useGetBarberDashboardQuery({ from: today, to: today });
  const yesterdayStats = useGetBarberDashboardQuery({ from: yesterday, to: yesterday });
  const week = useGetBarberDashboardQuery({ from: monday, to: addDays(monday, 6) });
  const range = dayRangeUtc(today, tz);
  const appts = useListAppointmentsQuery(ctx.profile ? { barber_id: ctx.profile.id, from: range.from, to: range.to, pageSize: 100, sortBy: 'start_at', sortDir: 'ASC' } : { pageSize: 1 }, {
    skip: !ctx.profile,
    pollingInterval: 60000,
  });

  if (!ctx.profile) return <EmptyState title="Você ainda não tem perfil de barbeiro" description="Peça ao dono da barbearia para vincular sua conta a uma filial." />;

  const t = todayStats.data;
  const y = yesterdayStats.data;
  const booked = (s: typeof t) => (s ? s.appointments.total - (s.appointments.by_status.cancelado ?? 0) : 0);
  const items = appts.data?.items ?? [];
  const next = upcomingConfirmed(items);
  const points = dailySeries(week.data?.revenue_by_day, weekDates(today));
  const current = selected ? items.find((a) => a.id === selected.id) ?? selected : null;
  const firstName = (ctx.profile.display_name || user?.name || '').split(' ')[0];

  return (
    <div>
      <PageHeader
        title={`${greeting(tz)}, ${firstName}!`}
        description={<span className="capitalize">{formatLocalDateLong(today)}</span>}
        action={<BarberProfileSelect ctx={ctx} />}
      />

      {todayStats.error ? <ErrorState error={todayStats.error} onRetry={todayStats.refetch} className="mb-6" /> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          highlight
          label="Atendimentos hoje"
          icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
          value={t ? booked(t) : <Skeleton className="h-9 w-16 bg-white/30" />}
          footer={<ChangeHint inverse change={t && y ? formatDelta(booked(t), booked(y), 'em relação a ontem') : null} fallback={`${t?.appointments.by_status.concluido ?? 0} concluídos`} />}
        />
        <KpiCard
          label="Receita hoje"
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          value={t ? formatBRL(t.revenue.total) : <Skeleton className="h-9 w-24" />}
          footer={<ChangeHint change={t?.comparison ? formatChange(t.comparison.revenue.change_pct, 'vs. ontem') : null} fallback={`${t?.revenue.payments ?? 0} pagamento(s)`} />}
        />
        <KpiCard
          label="Receita da semana"
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          value={week.data ? formatBRL(sumSeries(points)) : <Skeleton className="h-9 w-24" />}
          footer={<ChangeHint change={week.data?.comparison ? formatChange(week.data.comparison.revenue.change_pct, 'vs. semana passada') : null} fallback="Segunda a domingo" />}
        />
        <KpiCard
          label="Ocupação hoje"
          icon={<Percent className="h-5 w-5" aria-hidden="true" />}
          value={t ? `${Math.round((t.occupancy.rate ?? 0) * 100)}%` : <Skeleton className="h-9 w-16" />}
          footer={<ProgressBar value={t?.occupancy.rate ?? 0} label="Ocupação da agenda" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardTitle
            action={
              <Link to="/barbeiro/rendimentos" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                Rendimentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          >
            Receita da semana
          </CardTitle>
          {week.isLoading ? <Skeleton className="h-56 w-full" /> : <WeeklyBarChart points={points} highlightDate={today} />}
        </Card>

        <Card>
          <CardTitle
            action={
              <Link to="/barbeiro/agendamentos" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                Agenda <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          >
            Próximos de hoje
          </CardTitle>
          {appts.isLoading ? (
            <ListSkeleton rows={3} />
          ) : appts.error ? (
            <ErrorState error={appts.error} onRetry={appts.refetch} />
          ) : next.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-variant">{items.length ? 'Todos os atendimentos de hoje foram finalizados. 🎉' : 'Nenhum agendamento para hoje.'}</p>
          ) : (
            <ul className="space-y-2">
              {next.slice(0, 6).map((a, index) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(a)}
                    className={cn('relative flex w-full items-center gap-3 overflow-hidden rounded-xl p-3 pl-4 text-left transition hover:bg-surface-low', index === 0 ? 'bg-primary-50' : 'bg-white')}
                  >
                    <span className={cn('absolute inset-y-0 left-0 w-1', statusEdgeClass(a.status))} aria-hidden="true" />
                    <span className="w-14 text-sm font-black text-primary-600">{formatTime(a.start_at, tz)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{appointmentClientName(a)}</span>
                      <span className="block truncate text-xs text-ink-variant">{a.service_name_snapshot}</span>
                    </span>
                    {index === 0 ? <StatusChip status={a.status} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AppointmentDetailModal appointment={current} onClose={() => setSelected(null)} />
    </div>
  );
};

export default BarberDashboardPage;
