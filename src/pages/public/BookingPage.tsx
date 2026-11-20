// FE-21: wizard de agendamento do cliente — filial → serviço → barbeiro → dia/horário → confirmar.
// As escolhas ficam na URL: o cliente pode fazer login no meio e voltar exatamente ao mesmo ponto.
import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Check, Clock, MapPin, Scissors, User } from 'lucide-react';

import { Alert, Avatar, Button, Card, ErrorState, ListSkeleton, Textarea, useToast } from '@/components/ui';
import { newIdempotencyKey, useCreateAppointmentMutation } from '@/features/appointments/api';
import { SlotPicker } from '@/features/appointments/SlotPicker';
import { useAuth } from '@/features/auth/hooks';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { addressLine } from '@/features/public/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Appointment, Slot } from '@/types/api';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatDate, formatTime, todayIn } from '@/utils/date';
import { formatBRL, formatDuration } from '@/utils/format';

const Step = ({ index, title, done, active, children, onEdit, summary }: { index: number; title: string; done: boolean; active: boolean; children?: React.ReactNode; onEdit?: () => void; summary?: React.ReactNode }) => (
  <Card className={cn(!active && !done && 'opacity-60')}>
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', done ? 'bg-success-600 text-white' : active ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600')}>
          {done ? <Check className="h-4 w-4" /> : index}
        </span>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {done && summary ? <p className="text-sm text-muted">{summary}</p> : null}
        </div>
      </div>
      {done && onEdit ? (
        <button type="button" className="text-sm font-semibold text-primary-700 hover:underline" onClick={onEdit}>
          Alterar
        </button>
      ) : null}
    </div>
    {active ? <div className="mt-4">{children}</div> : null}
  </Card>
);

const BookingPage = () => {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug);
  const [createAppointment, creating] = useCreateAppointmentMutation();
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<Appointment | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());
  usePageTitle(shop ? `Agendar em ${shop.name}` : 'Agendar');

  const branchId = Number(params.get('filial')) || (shop?.branches.length === 1 ? shop.branches[0].id : 0);
  const serviceId = Number(params.get('servico')) || 0;
  const barberParam = params.get('barbeiro');
  const barberId = barberParam && barberParam !== 'qualquer' ? Number(barberParam) : undefined;
  const branch = shop?.branches.find((item) => item.id === branchId);
  const timezone = branch?.timezone ?? 'America/Sao_Paulo';
  const date = params.get('data') || todayIn(timezone);
  const startAt = params.get('horario');
  const service = shop?.services.find((item) => item.id === serviceId);

  const barbers = useMemo(
    () => (shop?.barbers ?? []).filter((barber) => barber.branch_id === branchId && (!serviceId || !barber.services || barber.services.some((item) => item.id === serviceId))),
    [shop, branchId, serviceId]
  );
  const barber = barbers.find((item) => item.id === barberId);

  const set = (next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => (value === null ? merged.delete(key) : merged.set(key, value)));
    setParams(merged, { replace: true });
    setSubmitError(null);
  };

  const confirm = async () => {
    if (!branch || !service || !startAt) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    setSubmitError(null);
    try {
      const result = await createAppointment({
        branch_id: branch.id,
        service_id: service.id,
        barber_id: barberId,
        start_at: startAt,
        notes: notes.trim() || undefined,
        source: 'web',
        idempotencyKey: idempotencyKey.current,
      }).unwrap();
      setCreated(result.appointment);
      toast.success('Agendamento confirmado!');
    } catch (err) {
      const code = errorCode(err);
      setSubmitError(apiErrorMessage(err));
      if (code === 'SLOT_TAKEN' || code === 'SLOT_UNAVAILABLE') {
        idempotencyKey.current = newIdempotencyKey();
        set({ horario: null });
      }
    }
  };

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-8"><ListSkeleton rows={4} /></div>;
  if (error || !shop) return <div className="mx-auto max-w-xl px-4 py-16"><ErrorState error={error} title="Barbearia indisponível" onRetry={refetch} /></div>;

  if (created) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <Card className="text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-success-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">Agendamento confirmado!</h1>
          <p className="mt-2 text-slate-600">
            {created.service_name_snapshot} em {formatDate(created.start_at, timezone)} às {formatTime(created.start_at, timezone)}.
          </p>
          <p className="mt-1 text-sm text-muted">Enviamos a confirmação por e-mail, com o convite para a sua agenda.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to={`/cliente/agendamentos/${created.id}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary-600 font-semibold text-white hover:bg-primary-700">
              Ver meu agendamento
            </Link>
            <Link to={`/b/${shop.slug}`} className="text-sm font-semibold text-primary-700 hover:underline">
              Voltar para {shop.name}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const step = !branch ? 1 : !service ? 2 : barberParam === null ? 3 : !startAt ? 4 : 5;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 pb-32">
      <Link to={`/b/${shop.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> {shop.name}
      </Link>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Agendar horário</h1>

      <Step index={1} title="Filial" done={!!branch} active={step === 1} summary={branch?.name} onEdit={shop.branches.length > 1 ? () => set({ filial: null, horario: null, barbeiro: null }) : undefined}>
        <div className="grid gap-3 sm:grid-cols-2">
          {shop.branches.map((item) => (
            <button key={item.id} type="button" onClick={() => set({ filial: String(item.id), barbeiro: null, horario: null })} className="rounded-xl border border-slate-200 p-4 text-left hover:border-primary-400">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="mt-1 flex items-start gap-1 text-sm text-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {addressLine(item.address)}
              </p>
            </button>
          ))}
        </div>
      </Step>

      <Step index={2} title="Serviço" done={!!service && step > 2} active={step === 2} summary={service ? `${service.name} · ${formatBRL(service.price)}` : undefined} onEdit={() => set({ servico: null, barbeiro: null, horario: null })}>
        <div className="grid gap-3 sm:grid-cols-2">
          {shop.services.map((item) => (
            <button key={item.id} type="button" onClick={() => set({ servico: String(item.id), barbeiro: null, horario: null })} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-primary-400">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <Clock className="h-3.5 w-3.5" /> {formatDuration(item.duration)}
                </p>
              </div>
              <span className="font-bold text-slate-900">{formatBRL(item.price)}</span>
            </button>
          ))}
        </div>
      </Step>

      <Step index={3} title="Barbeiro" done={barberParam !== null && step > 3} active={step === 3} summary={barber?.display_name ?? 'Sem preferência'} onEdit={() => set({ barbeiro: null, horario: null })}>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => set({ barbeiro: 'qualquer', horario: null })} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-primary-400">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <User className="h-5 w-5 text-slate-500" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Sem preferência</p>
              <p className="text-sm text-muted">Mais horários disponíveis</p>
            </div>
          </button>
          {barbers.map((item) => (
            <button key={item.id} type="button" onClick={() => set({ barbeiro: String(item.id), horario: null })} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-primary-400">
              <Avatar name={item.display_name} src={item.photo_url} />
              <p className="font-semibold text-slate-900">{item.display_name}</p>
            </button>
          ))}
        </div>
      </Step>

      <Step index={4} title="Dia e horário" done={!!startAt} active={step === 4} summary={startAt ? `${formatDate(startAt, timezone)} às ${formatTime(startAt, timezone)}` : undefined} onEdit={() => set({ horario: null })}>
        {branch && service ? (
          <SlotPicker
            branchId={branch.id}
            serviceId={service.id}
            barberId={barberId}
            timezone={timezone}
            date={date}
            onDateChange={(next) => set({ data: next, horario: null })}
            value={startAt ? ({ start_at: startAt } as Slot) : null}
            onChange={(slot) => set({ horario: slot.start_at })}
          />
        ) : null}
      </Step>

      {step === 5 && branch && service && startAt ? (
        <Card>
          <h2 className="text-lg font-bold text-slate-900">Confira e confirme</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <Scissors className="h-4 w-4 text-muted" />
              <dd>
                {service.name} · {formatDuration(service.duration)} · <strong>{formatBRL(service.price)}</strong>
              </dd>
            </div>
            <div className="flex gap-2">
              <CalendarCheck className="h-4 w-4 text-muted" />
              <dd>
                {formatDate(startAt, timezone)} às {formatTime(startAt, timezone)}
              </dd>
            </div>
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 text-muted" />
              <dd>
                {shop.name} — {branch.name}
              </dd>
            </div>
            <div className="flex gap-2">
              <User className="h-4 w-4 text-muted" />
              <dd>{barber?.display_name ?? 'Sem preferência (o primeiro barbeiro livre)'}</dd>
            </div>
          </dl>
          <Textarea className="mt-4" label="Observações (opcional)" maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: quero manter o comprimento em cima" />
          <p className="mt-3 text-xs text-muted">Pagamento na barbearia. Você pode cancelar ou remarcar online até 24 horas antes.</p>
          {submitError ? (
            <Alert tone="error" className="mt-4">
              {submitError}
            </Alert>
          ) : null}
          <Button className="mt-4" size="lg" block onClick={confirm} loading={creating.isLoading}>
            {isAuthenticated ? 'Confirmar agendamento' : 'Entrar para confirmar'}
          </Button>
        </Card>
      ) : null}
    </div>
  );
};

export default BookingPage;
