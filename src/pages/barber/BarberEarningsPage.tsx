// Figma 1:4820 "Rendimentos do Barbeiro": período (semana/mês), KPIs com variação, barras por dia, receita
// por serviço e últimos pagamentos recebidos.
import { useState } from 'react';
import { Receipt, Scissors, TrendingUp, Wallet } from 'lucide-react';

import { Badge, Card, CardTitle, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination, Skeleton, Tabs } from '@/components/ui';
import { useGetBarberDashboardQuery, useListBarberPaymentsQuery } from '@/features/barber/api';
import { BarberProfileSelect, ChangeHint, KpiCard, ProgressBar, WeeklyBarChart } from '@/features/barber/components';
import { dailySeries, formatChange, monthLabel, startOfMonth, startOfWeek, weekDates } from '@/features/barber/helpers';
import { useBarberProfile } from '@/features/barber/useBarberProfile';
import { METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/features/owner-ops/metrics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { addDays, formatDateTime, todayIn } from '@/utils/date';
import { formatBRL } from '@/utils/format';

type Period = 'week' | 'month';

const lastDayOfMonth = (date: string) => {
  const [y, m] = date.split('-').map(Number);
  return `${date.slice(0, 7)}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
};

const BarberEarningsPage = () => {
  usePageTitle('Rendimentos');
  const ctx = useBarberProfile();
  const today = todayIn(ctx.timezone);
  const [period, setPeriod] = useState<Period>('week');
  const [page, setPage] = useState(1);
  const from = period === 'week' ? startOfWeek(today) : startOfMonth(today);
  const to = period === 'week' ? addDays(from, 6) : lastDayOfMonth(today);
  const { data, isLoading, error, refetch } = useGetBarberDashboardQuery({ from, to });
  const payments = useListBarberPaymentsQuery({ page, pageSize: 10 });

  const suffix = period === 'week' ? 'vs. semana passada' : 'vs. mês passado';
  const points = dailySeries(data?.revenue_by_day, weekDates(today));
  const services = [...(data?.revenue_by_service ?? data?.top_services?.map((s) => ({ ...s, appointments: s.count })) ?? [])].sort((a, b) => Number(b.revenue) - Number(a.revenue));
  const maxService = Math.max(1, ...services.map((s) => Number(s.revenue)));

  return (
    <div>
      <PageHeader
        title="Rendimentos"
        description={period === 'week' ? 'Semana atual (segunda a domingo)' : monthLabel(today)}
        action={
          <>
            <BarberProfileSelect ctx={ctx} />
            <Tabs
              value={period}
              onChange={setPeriod}
              tabs={[
                { value: 'week', label: 'Semana' },
                { value: 'month', label: 'Mês' },
              ]}
            />
          </>
        }
      />

      {error ? <ErrorState error={error} onRetry={refetch} className="mb-6" /> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard highlight label="Receita" icon={<Wallet className="h-5 w-5" aria-hidden="true" />} value={data ? formatBRL(data.revenue.total) : <Skeleton className="h-9 w-24 bg-white/30" />} footer={<ChangeHint inverse change={data?.comparison ? formatChange(data.comparison.revenue.change_pct, suffix) : null} />} />
        <KpiCard label="Atendimentos" icon={<Scissors className="h-5 w-5" aria-hidden="true" />} value={data ? data.appointments.by_status.concluido ?? 0 : <Skeleton className="h-9 w-12" />} footer={<ChangeHint change={data?.comparison ? formatChange(data.comparison.appointments.change_pct, suffix) : null} fallback="Concluídos no período" />} />
        <KpiCard label="Ticket médio" icon={<Receipt className="h-5 w-5" aria-hidden="true" />} value={data ? formatBRL(data.revenue.average_ticket) : <Skeleton className="h-9 w-20" />} footer={<ChangeHint change={data?.comparison ? formatChange(data.comparison.average_ticket.change_pct, suffix) : null} />} />
        <KpiCard label="Ocupação" icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />} value={data ? `${Math.round(data.occupancy.rate * 100)}%` : <Skeleton className="h-9 w-12" />} footer={<ProgressBar value={data?.occupancy.rate ?? 0} label="Ocupação" />} />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardTitle>{period === 'week' ? 'Receita por dia' : 'Receita desta semana'}</CardTitle>
          {isLoading ? <Skeleton className="h-56 w-full" /> : <WeeklyBarChart points={points} highlightDate={today} />}
        </Card>
        <Card>
          <CardTitle>Por serviço</CardTitle>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : services.length === 0 ? (
            <p className="text-sm text-ink-variant">Sem atendimentos no período.</p>
          ) : (
            <ul className="space-y-4">
              {services.slice(0, 6).map((s) => (
                <li key={s.service_id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-ink">{s.name}</span>
                    <span className="text-ink-variant">{formatBRL(s.revenue)}</span>
                  </div>
                  <ProgressBar value={Number(s.revenue) / maxService} label={s.name} />
                  <p className="mt-1 text-xs text-ink-subtle">{s.appointments ?? 0} atendimento(s)</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>Últimos pagamentos</CardTitle>
        {payments.isLoading ? (
          <ListSkeleton rows={4} />
        ) : payments.error ? (
          <ErrorState error={payments.error} onRetry={payments.refetch} />
        ) : !payments.data?.items.length ? (
          <EmptyState title="Nenhum pagamento registrado" />
        ) : (
          <>
            <ul className="divide-y divide-surface-low">
              {payments.data.items.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{p.Appointment?.service_name_snapshot ?? `Atendimento #${p.appointment_id}`}</p>
                    <p className="truncate text-xs text-ink-variant">
                      {p.Appointment?.client?.name ?? 'Cliente'} · {formatDateTime(p.paid_at ?? p.Appointment?.start_at ?? p.created_at ?? '', ctx.timezone)}
                    </p>
                  </div>
                  <Badge tone={p.status === 'PAID' ? 'green' : p.status === 'PENDING' ? 'yellow' : 'red'}>
                    {PAYMENT_STATUS_LABEL[p.status]} · {METHOD_LABEL[p.method]}
                  </Badge>
                  <span className="w-24 text-right font-bold text-ink">{formatBRL(p.amount)}</span>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={payments.data.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};

export default BarberEarningsPage;
