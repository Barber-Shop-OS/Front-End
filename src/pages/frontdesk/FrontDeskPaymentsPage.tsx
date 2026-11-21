// Figma 1:5661 "Pagamento de Serviço - Atendimento": atendimentos do dia à esquerda (com situação do
// pagamento) e, à direita, o caixa do atendimento selecionado (forma de pagamento + valor recebido).
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Receipt, Search, Wallet } from 'lucide-react';

import { Badge, Button, Card, EmptyState, ErrorState, Input, ListSkeleton, PageHeader, StatusBadge, useToast } from '@/components/ui';
import { useListAppointmentsQuery } from '@/features/appointments/api';
import { useOwnerOpsAppointmentPaymentQuery, useOwnerOpsRegisterPaymentMutation } from '@/features/owner-ops/api';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { METHOD_LABEL, appointmentBarberName, appointmentClientName, rangeToUtc } from '@/features/owner-ops/metrics';
import { parseMoney } from '@/features/owner-ops/schemas';
import { MethodPicker } from '@/features/owner-ops/staff';
import { useActiveContext, type ActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Appointment, PaymentMethod } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTime, todayIn } from '@/utils/date';
import { formatBRL } from '@/utils/format';

const PaymentBadge = ({ appointmentId }: { appointmentId: number }) => {
  const { data, isLoading } = useOwnerOpsAppointmentPaymentQuery(appointmentId);
  if (isLoading) return null;
  if (!data) return <Badge tone="yellow">A receber</Badge>;
  return <Badge tone={data.status === 'PAID' ? 'green' : 'orange'}>{data.status === 'PAID' ? `Pago · ${METHOD_LABEL[data.method]}` : 'Pendente'}</Badge>;
};

const Checkout = ({ appointment }: { appointment: Appointment }) => {
  const toast = useToast();
  const tz = appointment.Branch?.timezone;
  const { data: payment, isLoading } = useOwnerOpsAppointmentPaymentQuery(appointment.id);
  const [register, { isLoading: saving }] = useOwnerOpsRegisterPaymentMutation();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [received, setReceived] = useState('');

  useEffect(() => {
    setMethod('CASH');
    setAmount(Number(appointment.price_snapshot).toFixed(2).replace('.', ','));
    setReceived('');
  }, [appointment]);

  const value = parseMoney(amount);
  const cash = parseMoney(received);
  const change = method === 'CASH' && Number.isFinite(cash) && Number.isFinite(value) && cash > value ? cash - value : 0;

  const confirm = async () => {
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }
    try {
      await register({ appointment_id: appointment.id, method, amount: value, status: 'PAID' }).unwrap();
      toast.success(`Pagamento de ${formatBRL(value)} registrado.`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível registrar o pagamento.'));
    }
  };

  return (
    <Card className="lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Resumo do serviço</p>
      <h2 className="mt-2 text-xl font-bold text-ink">{appointmentClientName(appointment)}</h2>
      <p className="text-sm text-ink-variant">
        {formatDateTime(appointment.start_at, tz)} · {appointmentBarberName(appointment)}
      </p>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-low p-4">
        <span className="text-sm font-semibold text-ink">{appointment.service_name_snapshot}</span>
        <span className="font-bold text-ink">{formatBRL(appointment.price_snapshot)}</span>
      </div>

      {isLoading ? null : payment && payment.status === 'PAID' ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-success-50 p-6 text-center text-success-700">
          <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          <p className="font-bold">Pago — {formatBRL(payment.amount)}</p>
          <p className="text-sm">
            {METHOD_LABEL[payment.method]}
            {payment.paid_at ? ` · ${formatDateTime(payment.paid_at, tz)}` : ''}
          </p>
        </div>
      ) : payment ? (
        <p className="mt-6 rounded-xl bg-warning-50 p-4 text-sm text-warning-700">Já existe um pagamento {payment.status === 'PENDING' ? 'pendente' : 'com falha'} para este atendimento. Fale com o gerente para ajustar.</p>
      ) : (
        <div className="mt-6 space-y-4">
          <MethodPicker value={method} onChange={setMethod} />
          <Input label="Valor cobrado (R$)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {method === 'CASH' ? (
            <Input label="Valor recebido em dinheiro" inputMode="decimal" placeholder="Para calcular o troco" value={received} onChange={(e) => setReceived(e.target.value)} hint={change > 0 ? `Troco: ${formatBRL(change)}` : undefined} />
          ) : null}
          <div className="flex items-baseline justify-between border-t border-surface-low pt-4">
            <span className="text-sm text-ink-variant">Total</span>
            <span className="text-3xl font-black tracking-[-0.05em] text-ink">{Number.isFinite(value) ? formatBRL(value) : '—'}</span>
          </div>
          <Button block size="lg" loading={saving} icon={<Wallet className="h-4 w-4" aria-hidden="true" />} onClick={() => void confirm()}>
            Confirmar pagamento
          </Button>
        </div>
      )}
    </Card>
  );
};

const Content = ({ ctx }: { ctx: ActiveContext }) => {
  const branch = ctx.branch!;
  const tz = branch.timezone;
  const [date, setDate] = useState(todayIn(tz));
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const range = rangeToUtc({ from: date, to: date }, tz);
  const { data, isLoading, error, refetch } = useListAppointmentsQuery({ branch_id: branch.id, from: range.from, to: range.to, pageSize: 100, sortBy: 'start_at', sortDir: 'ASC' });
  const items = useMemo(
    () =>
      (data?.items ?? [])
        .filter((a) => a.status === 'concluido' || a.status === 'confirmado')
        .filter((a) => !search.trim() || appointmentClientName(a).toLowerCase().includes(search.trim().toLowerCase())),
    [data, search]
  );
  const selected = items.find((a) => a.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader title="Pagamento de Serviço" description="Receba no balcão os atendimentos do dia." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar cliente</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente" className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100" />
            </label>
            <label className="sr-only" htmlFor="payments-date">
              Data
            </label>
            <input id="payments-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-12 rounded-lg bg-white px-3 text-sm shadow-card" />
          </div>
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : items.length === 0 ? (
            <EmptyState icon={<Receipt className="h-8 w-8" aria-hidden="true" />} title="Nenhum atendimento para receber" description="Atendimentos confirmados e concluídos do dia aparecem aqui." />
          ) : (
            <ul className="space-y-2">
              {items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    aria-pressed={a.id === selectedId}
                    className={cn('flex w-full items-center gap-4 rounded-xl bg-white p-4 text-left shadow-card transition', a.id === selectedId ? 'ring-2 ring-primary-600' : 'hover:shadow-elevated')}
                  >
                    <span className="w-14 text-lg font-black text-primary-600">{formatTime(a.start_at, tz)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{appointmentClientName(a)}</span>
                      <span className="block truncate text-xs text-ink-variant">
                        {a.service_name_snapshot} · {appointmentBarberName(a)}
                      </span>
                    </span>
                    <span className="hidden font-semibold text-ink sm:block">{formatBRL(a.price_snapshot)}</span>
                    <span className="flex flex-col items-end gap-1">
                      <PaymentBadge appointmentId={a.id} />
                      {a.status !== 'concluido' ? <StatusBadge status={a.status} /> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>{selected ? <Checkout appointment={selected} /> : <EmptyState icon={<Wallet className="h-8 w-8" aria-hidden="true" />} title="Selecione um atendimento" description="Escolha na lista para registrar o pagamento." />}</div>
      </div>
    </div>
  );
};

const FrontDeskPaymentsPage = () => {
  usePageTitle('Pagamentos');
  const ctx = useActiveContext('frontdesk');
  return (
    <WorkspaceGate ctx={ctx}>
      <Content ctx={ctx} />
    </WorkspaceGate>
  );
};

export default FrontDeskPaymentsPage;
