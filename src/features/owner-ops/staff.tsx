// Peças da operação compartilhadas entre o painel do dono/gerente e o atendimento (front desk):
// detalhe do agendamento com ações, pagamento presencial, quadro da agenda e formulário de cliente.
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CalendarX2, CheckCircle2, Clock, CreditCard, QrCode, Scissors, UserRound, UserX, Wallet } from 'lucide-react';

import { Alert, Avatar, Badge, Button, ConfirmDialog, EmptyState, Input, Modal, StatusBadge, Textarea, useToast } from '@/components/ui';
import { useCancelAppointmentMutation, useCompleteAppointmentMutation, useNoShowAppointmentMutation } from '@/features/appointments/api';
import type { Appointment, Client, PaymentMethod } from '@/types/api';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { WEEKDAYS_SHORT, formatDateTime, formatLocalDateShort, formatTime, todayIn, weekdayOf } from '@/utils/date';
import { formatBRL, formatPhone } from '@/utils/format';

import { useOwnerOpsAppointmentPaymentQuery, useOwnerOpsCreateClientMutation, useOwnerOpsRegisterPaymentMutation, useOwnerOpsUpdateClientMutation } from './api';
import type { BarberColumn } from './agenda';
import { METHOD_LABEL, PAYMENT_STATUS_LABEL, appointmentBarberName, appointmentClientName } from './metrics';
import { clientSchema, paymentSchema, parseMoney, toClientInput, type ClientFormValues, type PaymentFormValues } from './schemas';

// ---------------------------------------------------------------------------------------------
// Pagamento presencial
// ---------------------------------------------------------------------------------------------

const METHODS: { value: PaymentMethod; label: string; icon: ReactNode }[] = [
  { value: 'CASH', label: 'Dinheiro', icon: <Banknote className="h-5 w-5" aria-hidden="true" /> },
  { value: 'PIX', label: 'Pix', icon: <QrCode className="h-5 w-5" aria-hidden="true" /> },
  { value: 'CARD', label: 'Cartão', icon: <CreditCard className="h-5 w-5" aria-hidden="true" /> },
];

export const MethodPicker = ({ value, onChange }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void }) => (
  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Forma de pagamento">
    {METHODS.map((m) => (
      <button
        key={m.value}
        type="button"
        role="radio"
        aria-checked={value === m.value}
        onClick={() => onChange(m.value)}
        className={cn(
          'flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-sm font-semibold transition',
          value === m.value ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-transparent bg-surface-low text-ink-variant hover:bg-surface-high'
        )}
      >
        {m.icon}
        {m.label}
      </button>
    ))}
  </div>
);

export const PaymentModal = ({ appointment, onClose, onPaid }: { appointment: Appointment | null; onClose: () => void; onPaid?: () => void }) => {
  const toast = useToast();
  const [register, { isLoading }] = useOwnerOpsRegisterPaymentMutation();
  const {
    handleSubmit,
    register: field,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema), defaultValues: { method: 'CASH', amount: '' } });

  useEffect(() => {
    if (appointment) reset({ method: 'CASH', amount: Number(appointment.price_snapshot).toFixed(2).replace('.', ',') });
  }, [appointment, reset]);

  const submit = handleSubmit(async (values) => {
    if (!appointment) return;
    try {
      await register({ appointment_id: appointment.id, method: values.method, amount: parseMoney(values.amount), status: 'PAID' }).unwrap();
      toast.success('Pagamento registrado.');
      onPaid?.();
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível registrar o pagamento.'));
    }
  });

  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      title="Registrar pagamento"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={isLoading} icon={<Wallet className="h-4 w-4" aria-hidden="true" />}>
            Confirmar recebimento
          </Button>
        </>
      }
    >
      {appointment ? (
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="rounded-xl bg-surface-low p-4 text-sm">
            <p className="font-semibold text-ink">{appointment.service_name_snapshot}</p>
            <p className="text-ink-variant">
              {appointmentClientName(appointment)} · {formatDateTime(appointment.start_at, appointment.Branch?.timezone)}
            </p>
            <p className="mt-2 text-lg font-black text-ink">{formatBRL(appointment.price_snapshot)}</p>
          </div>
          <MethodPicker value={watch('method')} onChange={(m) => setValue('method', m)} />
          <Input label="Valor recebido (R$)" inputMode="decimal" error={errors.amount?.message} {...field('amount')} />
          <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
        </form>
      ) : null}
    </Modal>
  );
};

// ---------------------------------------------------------------------------------------------
// Detalhe do agendamento (concluir, não compareceu, cancelar, pagamento)
// ---------------------------------------------------------------------------------------------

export const AppointmentDetailModal = ({ appointment, onClose, barbers }: { appointment: Appointment | null; onClose: () => void; barbers?: { id: number; display_name: string | null }[] }) => {
  const toast = useToast();
  const { data: payment } = useOwnerOpsAppointmentPaymentQuery(appointment?.id ?? 0, { skip: !appointment });
  const [complete, { isLoading: completing }] = useCompleteAppointmentMutation();
  const [noShow, { isLoading: marking }] = useNoShowAppointmentMutation();
  const [cancel, { isLoading: canceling }] = useCancelAppointmentMutation();
  const [paying, setPaying] = useState<Appointment | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!appointment) return null;
  const tz = appointment.Branch?.timezone;
  const actions = appointment.allowed_actions ?? [];
  const customer = appointment.customer ?? appointment.client;
  const canPay = !payment && appointment.status !== 'cancelado' && appointment.status !== 'nao_compareceu';

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <>
      <Modal open={!paying && !cancelOpen} onClose={onClose} title="Agendamento">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-ink">{appointment.service_name_snapshot}</p>
              <p className="text-sm text-ink-variant">
                {formatDateTime(appointment.start_at, tz)} – {formatTime(appointment.end_at, tz)}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
          <dl className="grid gap-3 rounded-xl bg-surface-low p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
              <dt className="sr-only">Cliente</dt>
              <dd className="font-semibold text-ink">{appointmentClientName(appointment)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
              <dt className="sr-only">Barbeiro</dt>
              <dd className="text-ink">{appointmentBarberName(appointment, barbers)}</dd>
            </div>
            {customer?.phone ? (
              <div className="flex items-center gap-2">
                <dt className="text-ink-variant">Telefone:</dt>
                <dd>
                  <a className="text-primary-600" href={`tel:${customer.phone}`}>
                    {formatPhone(customer.phone)}
                  </a>
                </dd>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <dt className="text-ink-variant">Valor:</dt>
              <dd className="font-semibold text-ink">{formatBRL(appointment.price_snapshot)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-ink-variant">Origem:</dt>
              <dd className="text-ink">{appointment.source === 'balcao' ? 'Balcão' : appointment.source === 'mobile' ? 'App' : 'Online'}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-ink-variant">Pagamento:</dt>
              <dd>
                {payment ? (
                  <Badge tone={payment.status === 'PAID' ? 'green' : payment.status === 'PENDING' ? 'yellow' : 'red'}>
                    {PAYMENT_STATUS_LABEL[payment.status]} · {METHOD_LABEL[payment.method]}
                  </Badge>
                ) : (
                  <span className="text-ink-variant">Não registrado</span>
                )}
              </dd>
            </div>
          </dl>
          {appointment.notes ? <Alert tone="info" title="Observações">{appointment.notes}</Alert> : null}
          {appointment.cancel_reason ? <Alert tone="warning" title="Motivo do cancelamento">{appointment.cancel_reason}</Alert> : null}

          <div className="flex flex-wrap gap-2 border-t border-surface-low pt-4">
            {actions.includes('complete') ? (
              <Button icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} loading={completing} onClick={() => void run(() => complete(appointment.id).unwrap(), 'Atendimento concluído.')}>
                Concluir
              </Button>
            ) : null}
            {canPay ? (
              <Button variant="tonal" icon={<Wallet className="h-4 w-4" aria-hidden="true" />} onClick={() => setPaying(appointment)}>
                Registrar pagamento
              </Button>
            ) : null}
            {actions.includes('no_show') ? (
              <Button variant="outline" icon={<UserX className="h-4 w-4" aria-hidden="true" />} loading={marking} onClick={() => void run(() => noShow(appointment.id).unwrap(), 'Marcado como não compareceu.')}>
                Não compareceu
              </Button>
            ) : null}
            {actions.includes('cancel') ? (
              <Button variant="ghost" className="hover:text-danger-600" icon={<CalendarX2 className="h-4 w-4" aria-hidden="true" />} onClick={() => setCancelOpen(true)}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
      <PaymentModal appointment={paying} onClose={() => setPaying(null)} />
      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar agendamento?"
        tone="danger"
        confirmLabel="Cancelar agendamento"
        loading={canceling}
        description="O cliente será avisado e o horário volta a ficar livre."
        onCancel={() => setCancelOpen(false)}
        onConfirm={() =>
          void run(async () => {
            await cancel({ id: appointment.id, reason: reason.trim() || undefined }).unwrap();
            setCancelOpen(false);
            setReason('');
          }, 'Agendamento cancelado.')
        }
      >
        <Textarea label="Motivo (opcional)" className="mt-3" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} />
      </ConfirmDialog>
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Quadro da agenda
// ---------------------------------------------------------------------------------------------

const STATUS_BAR: Record<Appointment['status'], string> = {
  confirmado: 'border-l-primary-600',
  concluido: 'border-l-success-600',
  cancelado: 'border-l-outline-variant opacity-60',
  nao_compareceu: 'border-l-danger-600',
};

export const AppointmentChip = ({ appointment, onOpen, showBarber, barbers }: { appointment: Appointment; onOpen: (a: Appointment) => void; showBarber?: boolean; barbers?: { id: number; display_name: string | null }[] }) => {
  const tz = appointment.Branch?.timezone;
  return (
    <button
      type="button"
      onClick={() => onOpen(appointment)}
      className={cn('w-full rounded-lg border-l-4 bg-white p-3 text-left shadow-card transition hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary-200', STATUS_BAR[appointment.status])}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatTime(appointment.start_at, tz)}–{formatTime(appointment.end_at, tz)}
        </span>
        {appointment.status !== 'confirmado' ? <StatusBadge status={appointment.status} /> : null}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{appointmentClientName(appointment)}</p>
      <p className="truncate text-xs text-ink-variant">
        {appointment.service_name_snapshot}
        {showBarber ? ` · ${appointmentBarberName(appointment, barbers)}` : ''}
      </p>
    </button>
  );
};

export const DayBoard = ({ columns, onOpen }: { columns: BarberColumn[]; onOpen: (a: Appointment) => void }) =>
  columns.length === 0 ? (
    <EmptyState title="Nenhum barbeiro ativo nesta filial" />
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((column) => (
        <section key={column.barberId} className="w-64 shrink-0 rounded-xl bg-surface-low p-3 sm:w-72">
          <header className="mb-3 flex items-center gap-2">
            <Avatar name={column.name} src={column.photoUrl} size="sm" />
            <h3 className="flex-1 truncate text-sm font-bold text-ink">{column.name}</h3>
            <Badge tone="blue">{column.items.filter((a) => a.status !== 'cancelado').length}</Badge>
          </header>
          {column.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant/60 px-3 py-6 text-center text-xs text-ink-subtle">Agenda livre</p>
          ) : (
            <div className="space-y-2">
              {column.items.map((a) => (
                <AppointmentChip key={a.id} appointment={a} onOpen={onOpen} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );

export const WeekBoard = ({
  days,
  byDay,
  onOpen,
  onPickDay,
  timeZone,
  barbers,
}: {
  days: string[];
  byDay: Record<string, Appointment[]>;
  onOpen: (a: Appointment) => void;
  onPickDay: (day: string) => void;
  timeZone: string;
  barbers?: { id: number; display_name: string | null }[];
}) => {
  const today = todayIn(timeZone);
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => (
        <section key={day} className={cn('min-h-32 rounded-xl p-2', day === today ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-surface-low')}>
          <button type="button" onClick={() => onPickDay(day)} className="mb-2 flex w-full items-baseline justify-between px-1 text-left hover:text-primary-600">
            <span className="text-xs font-semibold uppercase tracking-label text-ink-variant">{WEEKDAYS_SHORT[weekdayOf(day)]}</span>
            <span className="text-sm font-bold text-ink">{formatLocalDateShort(day)}</span>
          </button>
          <div className="space-y-2">
            {byDay[day]?.length ? byDay[day].map((a) => <AppointmentChip key={a.id} appointment={a} onOpen={onOpen} showBarber barbers={barbers} />) : <p className="px-1 py-3 text-center text-xs text-ink-subtle">—</p>}
          </div>
        </section>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Formulário de cliente (rápido)
// ---------------------------------------------------------------------------------------------

export const ClientForm = ({
  barbershopId,
  client,
  onSaved,
  onCancel,
  submitLabel,
}: {
  barbershopId: number;
  client?: Client | null;
  onSaved: (client: Client) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) => {
  const toast = useToast();
  const [create, { isLoading: creating }] = useOwnerOpsCreateClientMutation();
  const [update, { isLoading: updating }] = useOwnerOpsUpdateClientMutation();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client?.name ?? '', phone: client?.phone ? formatPhone(client.phone) : '', email: client?.email ?? '', notes: client?.notes ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const saved = client
        ? await update({ barbershopId, clientId: client.id, ...toClientInput(values) }).unwrap()
        : await create({ barbershopId, ...toClientInput(values) }).unwrap();
      toast.success(client ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      onSaved((saved as Client & { client?: Client }).client ?? saved);
    } catch (error) {
      Object.entries(fieldErrors(error)).forEach(([name, message]) => setError(name as keyof ClientFormValues, { message }));
      toast.error(apiErrorMessage(error, 'Não foi possível salvar o cliente.'));
    }
  });

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <Input label="Nome completo" required autoComplete="off" error={errors.name?.message} {...register('name')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Telefone / WhatsApp" required inputMode="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone', { onBlur: (e) => setValue('phone', formatPhone(e.target.value)) })} />
        <Input label="E-mail" type="email" placeholder="opcional" error={errors.email?.message} {...register('email')} />
      </div>
      <Textarea label="Observações" placeholder="Preferências, alergias, estilo de corte…" error={errors.notes?.message} {...register('notes')} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" loading={creating || updating}>
          {submitLabel ?? (client ? 'Salvar' : 'Cadastrar cliente')}
        </Button>
      </div>
    </form>
  );
};
