// Novo agendamento de balcão (dono/gerente em /dashboard e atendimento em /atendimento): cliente
// (busca ou cadastro rápido), serviço, barbeiro (ou sem preferência), dia/horário via /availability e observações.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowLeft, CalendarCheck, Check, Search, UserPlus, X } from 'lucide-react';

import { Alert, Avatar, Button, Card, CardTitle, EmptyState, Modal, PageHeader, Skeleton, Textarea, useToast } from '@/components/ui';
import { SlotPicker } from '@/features/appointments/SlotPicker';
import { useCreateAppointmentMutation } from '@/features/appointments/api';
import { useOwnerOpsBarbersQuery, useOwnerOpsClientQuery, useOwnerOpsClientsQuery, useOwnerOpsServicesQuery } from '@/features/owner-ops/api';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { ClientForm } from '@/features/owner-ops/staff';
import { useActiveContext, type ActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Slot } from '@/types/api';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatDateTime, todayIn } from '@/utils/date';
import { formatBRL, formatDuration, formatPhone } from '@/utils/format';

interface PickedClient {
  id: number;
  name: string;
  phone: string | null;
}

const newKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const ClientPicker = ({ barbershopId, value, onChange }: { barbershopId: number; value: PickedClient | null; onChange: (c: PickedClient | null) => void }) => {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const h = window.setTimeout(() => setDebounced(term.trim()), 300);
    return () => window.clearTimeout(h);
  }, [term]);
  const { data, isFetching } = useOwnerOpsClientsQuery(debounced.length >= 3 ? { barbershopId, search: debounced, pageSize: 6 } : skipToken);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-primary-600 bg-primary-50 p-3">
        <Avatar name={value.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{value.name}</p>
          {value.phone ? <p className="text-xs text-ink-variant">{formatPhone(value.phone)}</p> : null}
        </div>
        <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-white" aria-label="Trocar cliente" onClick={() => onChange(null)}>
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar cliente</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nome, telefone ou e-mail"
            className="h-12 w-full rounded-lg bg-surface-low pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </label>
        <Button variant="secondary" size="lg" icon={<UserPlus className="h-4 w-4" aria-hidden="true" />} onClick={() => setCreating(true)}>
          <span className="hidden sm:inline">Novo</span>
        </Button>
      </div>
      {debounced.length >= 3 ? (
        <ul className="mt-2 divide-y divide-surface-low rounded-xl border border-surface-low">
          {isFetching && !data ? (
            <li className="p-3">
              <Skeleton className="h-8 w-full" />
            </li>
          ) : data?.items.length ? (
            data.items.map((c) => (
              <li key={c.id}>
                <button type="button" className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-low" onClick={() => onChange({ id: c.id, name: c.name, phone: c.phone })}>
                  <Avatar name={c.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                    <span className="text-xs text-ink-variant">{formatPhone(c.phone)}</span>
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="p-3 text-sm text-ink-variant">
              Nenhum cliente encontrado.{' '}
              <button type="button" className="font-semibold text-primary-600" onClick={() => setCreating(true)}>
                Cadastrar agora
              </button>
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-ink-subtle">Digite ao menos 3 caracteres para buscar.</p>
      )}
      <Modal open={creating} onClose={() => setCreating(false)} title="Cadastro rápido de cliente">
        <ClientForm
          barbershopId={barbershopId}
          submitLabel="Cadastrar e selecionar"
          onCancel={() => setCreating(false)}
          onSaved={(c) => {
            setCreating(false);
            onChange({ id: c.id, name: c.name, phone: c.phone });
          }}
        />
      </Modal>
    </div>
  );
};

const Step = ({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) => (
  <Card>
    <CardTitle>
      <span className="inline-flex items-center gap-3">
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold', done ? 'bg-success-600 text-white' : 'bg-primary-100 text-primary-600')}>
          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : n}
        </span>
        {title}
      </span>
    </CardTitle>
    {children}
  </Card>
);

const Content = ({ ctx, basePath }: { ctx: ActiveContext; basePath: string }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const barbershopId = ctx.barbershop!.id;
  const branch = ctx.branch!;
  const timeZone = branch.timezone;
  const preClientId = Number(params.get('cliente')) || 0;

  const [client, setClient] = useState<PickedClient | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [barberId, setBarberId] = useState<number | null>(null);
  const [date, setDate] = useState(todayIn(timeZone));
  const [slot, setSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);

  const { data: pre } = useOwnerOpsClientQuery(preClientId ? { barbershopId, clientId: preClientId } : skipToken);
  useEffect(() => {
    if (pre && !client) setClient({ id: pre.id, name: pre.name, phone: pre.phone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pre]);
  useEffect(() => {
    if (preClientId && !client && !pre) setClient({ id: preClientId, name: `Cliente #${preClientId}`, phone: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preClientId]);

  const { data: services = [], isLoading: servicesLoading } = useOwnerOpsServicesQuery(barbershopId);
  const { data: barbers = [] } = useOwnerOpsBarbersQuery(serviceId ? { branch_id: branch.id, service_id: serviceId } : skipToken);
  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);
  const [create, { isLoading: saving }] = useCreateAppointmentMutation();

  useEffect(() => setSlot(null), [serviceId, barberId, date]);
  useEffect(() => {
    if (barberId && !barbers.some((b) => b.id === barberId)) setBarberId(null);
  }, [barbers, barberId]);

  const ready = Boolean(client && service && slot);
  const summary = useMemo(
    () =>
      [
        { label: 'Cliente', value: client?.name },
        { label: 'Serviço', value: service ? `${service.name} · ${formatDuration(service.duration)}` : undefined },
        { label: 'Barbeiro', value: barber ? barber.display_name : serviceId ? 'Sem preferência' : undefined },
        { label: 'Horário', value: slot ? formatDateTime(slot.start_at, timeZone) : undefined },
      ] as { label: string; value?: string | null }[],
    [client, service, barber, serviceId, slot, timeZone]
  );

  const submit = async () => {
    if (!client || !service || !slot) return;
    try {
      await create({
        branch_id: branch.id,
        service_id: service.id,
        barber_id: barberId ?? undefined,
        start_at: slot.start_at,
        notes: notes.trim() || undefined,
        source: 'balcao',
        client_id: client.id,
        idempotencyKey,
      }).unwrap();
      toast.success(`Agendado para ${client.name.split(' ')[0]} em ${formatDateTime(slot.start_at, timeZone)}.`);
      navigate(`${basePath}/agenda`);
    } catch (error) {
      const code = errorCode(error);
      if (code === 'SLOT_UNAVAILABLE' || code === 'CONFLICT' || code === 'SLOT_TAKEN') {
        toast.error('Esse horário acabou de ser ocupado. Escolha outro.');
        setSlot(null);
      } else {
        toast.error(apiErrorMessage(error, 'Não foi possível agendar.'));
      }
      setIdempotencyKey(newKey());
    }
  };

  return (
    <div>
      <PageHeader
        back={
          <Link to={`${basePath}/agenda`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Agenda
          </Link>
        }
        title="Novo Agendamento"
        description={`Agendamento de balcão — ${branch.name}`}
      />
      {!branch.active ? <Alert tone="warning" className="mb-6">Esta filial está inativa e não aceita novos agendamentos.</Alert> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Step n={1} title="Cliente" done={Boolean(client)}>
            <ClientPicker barbershopId={barbershopId} value={client} onChange={setClient} />
          </Step>

          <Step n={2} title="Serviço" done={Boolean(service)}>
            {servicesLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : services.length === 0 ? (
              <EmptyState title="Nenhum serviço ativo" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={serviceId === s.id}
                    onClick={() => setServiceId(s.id)}
                    className={cn('rounded-xl border-2 p-3 text-left transition', serviceId === s.id ? 'border-primary-600 bg-primary-50' : 'border-transparent bg-surface-low hover:bg-surface-high')}
                  >
                    <p className="font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-ink-variant">
                      {formatBRL(s.price)} · {formatDuration(s.duration)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Step>

          {service ? (
            <Step n={3} title="Barbeiro" done={Boolean(slot)}>
              <div className="flex gap-3 overflow-x-auto pb-1">
                <button
                  type="button"
                  aria-pressed={barberId === null}
                  onClick={() => setBarberId(null)}
                  className={cn('flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl border-2 p-3 text-center text-sm transition', barberId === null ? 'border-primary-600 bg-primary-50' : 'border-transparent bg-surface-low')}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-primary-600">?</span>
                  <span className="font-semibold text-ink">Sem preferência</span>
                </button>
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={barberId === b.id}
                    onClick={() => setBarberId(b.id)}
                    className={cn('flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl border-2 p-3 text-center text-sm transition', barberId === b.id ? 'border-primary-600 bg-primary-50' : 'border-transparent bg-surface-low')}
                  >
                    <Avatar name={b.display_name} src={b.photo_url} />
                    <span className="line-clamp-2 font-semibold text-ink">{b.display_name || `Barbeiro #${b.id}`}</span>
                  </button>
                ))}
              </div>
              {barbers.length === 0 ? <p className="mt-2 text-sm text-ink-variant">Nenhum barbeiro desta filial realiza esse serviço.</p> : null}
              <div className="mt-6">
                <SlotPicker branchId={branch.id} serviceId={service.id} barberId={barberId ?? undefined} timezone={timeZone} date={date} onDateChange={setDate} value={slot} onChange={setSlot} days={21} />
              </div>
            </Step>
          ) : null}

          <Card>
            <Textarea label="Observações (opcional)" value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: cliente prefere máquina 2 nas laterais" />
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Resumo</p>
            <dl className="mt-3 space-y-3 text-sm">
              {summary.map((row) => (
                <div key={row.label} className="flex justify-between gap-3">
                  <dt className="text-ink-variant">{row.label}</dt>
                  <dd className={cn('text-right font-semibold', row.value ? 'text-ink' : 'text-ink-subtle')}>{row.value || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-surface-low pt-4">
              <span className="text-sm text-ink-variant">Total</span>
              <span className="text-2xl font-black text-ink">{service ? formatBRL(service.price) : '—'}</span>
            </div>
            <p className="mt-1 text-xs text-ink-variant">Pagamento no local, registrado ao concluir o atendimento.</p>
            <Button className="mt-5" block size="lg" disabled={!ready || !branch.active} loading={saving} icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />} onClick={() => void submit()}>
              Confirmar agendamento
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
};

const NewAppointmentPage = () => {
  usePageTitle('Novo agendamento');
  const frontdesk = useLocation().pathname.startsWith('/atendimento');
  const ctx = useActiveContext(frontdesk ? 'frontdesk' : 'owner');
  return (
    <WorkspaceGate ctx={ctx}>
      <Content ctx={ctx} basePath={frontdesk ? '/atendimento' : '/dashboard'} />
    </WorkspaceGate>
  );
};

export default NewAppointmentPage;
