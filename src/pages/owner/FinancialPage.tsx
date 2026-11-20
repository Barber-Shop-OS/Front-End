// Figma 1:2662 "Financeiro": filtro de período (Hoje/Semana/Mês), cards de receita, faturamento por dia
// (barras HTML/CSS), divisão por método e a lista de pagamentos presenciais com filtros, paginação e CSV.
import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Banknote, CircleDollarSign, Clock, Download, Receipt, Wallet } from 'lucide-react';

import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination, Select, Skeleton, Tabs, useToast, type BadgeTone } from '@/components/ui';
import { useOwnerOpsPaymentsQuery, useOwnerOpsSummaryQuery, useOwnerOpsUpdatePaymentStatusMutation, type PaymentRow } from '@/features/owner-ops/api';
import { KpiCard, RevenueBars, WorkspaceGate } from '@/features/owner-ops/components';
import { dailyBars, METHOD_LABEL, PAYMENT_STATUS_LABEL, pctChange, PERIOD_DAYS, PERIOD_LABEL, periodRange, previousRange, rangeToUtc, sumRevenue, type PeriodPreset } from '@/features/owner-ops/metrics';
import { useActiveContext, type ActiveContext } from '@/features/workspace/useActiveContext';
import type { PaymentMethod, PaymentStatus } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { addDays, DEFAULT_TIMEZONE, formatDateTime, todayIn } from '@/utils/date';
import { formatBRL } from '@/utils/format';

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = { PAID: 'green', PENDING: 'orange', FAILED: 'red' };
const PAGE_SIZE = 20;

const FinancialPage = () => {
  const ctx = useActiveContext();
  return (
    <WorkspaceGate ctx={ctx} requireBranch={false}>
      <FinancialContent ctx={ctx} />
    </WorkspaceGate>
  );
};

const paymentClient = (row: PaymentRow) => row.Appointment?.client?.name ?? 'Cliente de balcão';
const paymentBarber = (row: PaymentRow) => row.Appointment?.Barber?.display_name ?? '—';

const toCsv = (rows: PaymentRow[], timeZone: string) => {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ['Data', 'Cliente', 'Serviço', 'Barbeiro', 'Método', 'Status', 'Valor'];
  const lines = rows.map((row) =>
    [
      formatDateTime(row.paid_at ?? row.created_at ?? new Date(), timeZone),
      paymentClient(row),
      row.Appointment?.service_name_snapshot ?? '',
      paymentBarber(row),
      METHOD_LABEL[row.method],
      PAYMENT_STATUS_LABEL[row.status],
      Number(row.amount).toFixed(2).replace('.', ','),
    ]
      .map(escape)
      .join(';')
  );
  return [header.map(escape).join(';'), ...lines].join('\n');
};

const FinancialContent = ({ ctx }: { ctx: ActiveContext }) => {
  const toast = useToast();
  const [preset, setPreset] = useState<PeriodPreset>('today');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ row: PaymentRow; status: 'PAID' | 'FAILED' } | null>(null);
  const [updateStatus, updateState] = useOwnerOpsUpdatePaymentStatusMutation();

  const branchId = branchFilter ? Number(branchFilter) : undefined;
  const timeZone = ctx.branches.find((item) => item.id === branchId)?.timezone ?? ctx.branch?.timezone ?? DEFAULT_TIMEZONE;
  const today = todayIn(timeZone);
  const range = periodRange(preset, today);
  const barbershopId = ctx.barbershop?.id;
  const utc = rangeToUtc(range, timeZone);

  const payments = useOwnerOpsPaymentsQuery(
    barbershopId
      ? { barbershop_id: barbershopId, branch_id: branchId, status: status || undefined, method: method || undefined, from: utc.from, to: utc.to, page, pageSize: PAGE_SIZE }
      : skipToken
  );
  // Série diária: período atual + anterior (para a variação), mínimo de 7 dias no gráfico.
  const chartDays = Math.max(PERIOD_DAYS[preset], 7);
  const prev = previousRange(range);
  const summary = useOwnerOpsSummaryQuery(
    barbershopId ? { barbershop_id: barbershopId, branch_id: branchId, from: addDays(today, -(Math.max(chartDays, PERIOD_DAYS[preset] * 2) - 1)), to: today } : skipToken
  );

  const series = summary.data?.revenue_by_day;
  const revenue = sumRevenue(series, range);
  const revenueDelta = series ? pctChange(revenue, sumRevenue(series, prev)) : null;
  const bars = useMemo(() => dailyBars(series, today, chartDays), [series, today, chartDays]);
  const totals = payments.data?.totals;
  const paidCount = totals?.paid.count ?? 0;
  const paidAmount = Number(totals?.paid.amount ?? 0);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const confirmStatus = async () => {
    if (!pending) return;
    try {
      await updateStatus({ id: pending.row.id, status: pending.status }).unwrap();
      toast.success(pending.status === 'PAID' ? 'Pagamento marcado como pago.' : 'Pagamento marcado como falho.');
      setPending(null);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const exportCsv = () => {
    const rows = payments.data?.items ?? [];
    const blob = new Blob([String.fromCharCode(0xfeff) + toCsv(rows, timeZone)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagamentos-${range.from}-a-${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const methodTotal = totals ? Object.values(totals.paid_by_method).reduce((sum, value) => sum + Number(value), 0) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Financeiro"
        description="Visão geral do desempenho e faturamento."
        action={<Tabs<PeriodPreset> value={preset} onChange={resetPage(setPreset)} tabs={(['today', 'week', 'month'] as const).map((value) => ({ value, label: PERIOD_LABEL[value] }))} />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label={preset === 'today' ? 'Receita hoje' : preset === 'week' ? 'Receita da semana' : 'Receita do mês'}
          value={formatBRL(revenue)}
          delta={revenueDelta}
          deltaHint={preset === 'today' ? 'vs. ontem' : 'vs. período anterior'}
          hint={preset === 'today' ? undefined : `Últimos ${PERIOD_DAYS[preset]} dias`}
          loading={summary.isLoading}
        />
        <KpiCard
          icon={<Receipt className="h-5 w-5" />}
          label="Ticket médio"
          value={formatBRL(paidCount ? paidAmount / paidCount : 0)}
          hint={`${paidCount} pagamento${paidCount === 1 ? '' : 's'} recebido${paidCount === 1 ? '' : 's'}`}
          loading={payments.isLoading}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5" />}
          label="Pendentes"
          value={formatBRL(totals?.pending.amount ?? 0)}
          hint={`${totals?.pending.count ?? 0} aguardando confirmação`}
          loading={payments.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Faturamento {preset === 'month' ? 'dos últimos 30 dias' : 'da semana'}</h2>
          {summary.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : summary.error ? (
            <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
          ) : (
            <RevenueBars bars={bars} highlight={today} />
          )}
        </section>
        <section className="flex flex-col gap-4 rounded-xl bg-surface-highest/30 p-6">
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Por método</h2>
          {payments.isLoading ? (
            <ListSkeleton rows={3} />
          ) : (
            (['PIX', 'CASH', 'CARD'] as const).map((key) => {
              const value = Number(totals?.paid_by_method[key] ?? 0);
              const share = methodTotal ? Math.round((value / methodTotal) * 100) : 0;
              return (
                <div key={key} className="rounded-lg bg-white p-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-bold text-ink">
                      {key === 'CASH' ? <Banknote className="h-4 w-4 text-primary-600" aria-hidden="true" /> : <Wallet className="h-4 w-4 text-primary-600" aria-hidden="true" />}
                      {METHOD_LABEL[key]}
                    </span>
                    <span className="font-bold text-ink">{formatBRL(value)}</span>
                  </div>
                  <div className="mt-3 h-2 rounded bg-surface-low" role="progressbar" aria-valuenow={share} aria-valuemin={0} aria-valuemax={100} aria-label={`${METHOD_LABEL[key]}: ${share}%`}>
                    <div className="h-2 rounded bg-primary-600" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <section className="rounded-xl bg-white shadow-card">
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 p-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Transações</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 lg:flex lg:items-end">
            {ctx.branches.length > 1 ? (
              <Select label="Filial" value={branchFilter} onChange={(event) => resetPage(setBranchFilter)(event.target.value)} className="h-10">
                <option value="">Todas as filiais</option>
                {ctx.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            ) : null}
            <Select label="Status" value={status} onChange={(event) => resetPage(setStatus)(event.target.value as PaymentStatus | '')} className="h-10">
              <option value="">Todos</option>
              {(['PAID', 'PENDING', 'FAILED'] as const).map((value) => (
                <option key={value} value={value}>
                  {PAYMENT_STATUS_LABEL[value]}
                </option>
              ))}
            </Select>
            <Select label="Método" value={method} onChange={(event) => resetPage(setMethod)(event.target.value as PaymentMethod | '')} className="h-10">
              <option value="">Todos</option>
              {(['PIX', 'CASH', 'CARD'] as const).map((value) => (
                <option key={value} value={value}>
                  {METHOD_LABEL[value]}
                </option>
              ))}
            </Select>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={exportCsv} disabled={!payments.data?.items.length}>
              Exportar CSV
            </Button>
          </div>
        </div>

        {payments.isLoading ? (
          <div className="p-6">
            <ListSkeleton rows={5} />
          </div>
        ) : payments.error ? (
          <ErrorState error={payments.error} onRetry={() => void payments.refetch()} className="m-6" />
        ) : !payments.data?.items.length ? (
          <EmptyState icon={<Wallet className="h-6 w-6" />} title="Nenhum pagamento no período" description="Os pagamentos registrados no balcão aparecem aqui." className="m-6" />
        ) : (
          <>
            <ul className="divide-y divide-outline-variant/20">
              {payments.data.items.map((row) => (
                <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 sm:flex" aria-hidden="true">
                    {row.method === 'CASH' ? <Banknote className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{paymentClient(row)}</p>
                    <p className="truncate text-xs text-ink-variant">
                      {row.Appointment?.service_name_snapshot ?? 'Serviço'} · {paymentBarber(row)} · {METHOD_LABEL[row.method]}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <Badge tone={STATUS_TONE[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink">{formatBRL(row.amount)}</p>
                      <p className="text-xs text-ink-variant">{formatDateTime(row.paid_at ?? row.created_at ?? new Date(), timeZone)}</p>
                    </div>
                  </div>
                  {row.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setPending({ row, status: 'PAID' })}>
                        Marcar pago
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPending({ row, status: 'FAILED' })}>
                        Falhou
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-center justify-between gap-3 p-4 text-sm text-ink-variant sm:flex-row sm:px-6">
              <span>
                {payments.data.total} pagamento{payments.data.total === 1 ? '' : 's'} · total {formatBRL(totals?.amount ?? 0)}
              </span>
              <Pagination page={payments.data.page} totalPages={payments.data.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.status === 'PAID' ? 'Confirmar recebimento?' : 'Marcar pagamento como falho?'}
        description={pending ? `${paymentClient(pending.row)} · ${formatBRL(pending.row.amount)}` : undefined}
        confirmLabel={pending?.status === 'PAID' ? 'Marcar como pago' : 'Marcar como falho'}
        tone={pending?.status === 'FAILED' ? 'danger' : 'primary'}
        loading={updateState.isLoading}
        onConfirm={() => void confirmStatus()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default FinancialPage;
