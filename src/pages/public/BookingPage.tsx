// Figma 1:1881 (serviço) → 1:1736 (barbeiro) → 1:1253 (horário) → 1:2060 (pagamento), com o painel lateral
// de resumo (1:5950). A seleção vive na URL (?branch, servico, barbeiro, data, horario, etapa) e num rascunho
// de sessão: o login/cadastro só é pedido na etapa final e devolve o cliente ao mesmo ponto (B1).
// Pagamento: só "Pagar no local" (A2); Cartão e Pix aparecem desabilitados como "Em breve".
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowLeft, ArrowRight, CalendarCheck, Check, ChevronLeft, ChevronRight, Clock, CreditCard, MapPin, QrCode, Scissors, Store, User, Wallet } from 'lucide-react';

import { Alert, Avatar, Badge, Button, Card, EmptyState, ErrorState, Input, ListSkeleton, Skeleton, Textarea, useToast } from '@/components/ui';
import { useUpdateProfileMutation } from '@/features/account/api';
import { newIdempotencyKey, useCreateAppointmentMutation } from '@/features/appointments/api';
import { refreshMe } from '@/features/auth/authSlice';
import { useAuth } from '@/features/auth/hooks';
import {
  MONTHS,
  PERIOD_LABEL,
  STEP_ORDER,
  barbersFor,
  buildCalendarMonth,
  canBookWithContact,
  clearBookingDraft,
  groupSlotsByPeriod,
  isContactRequiredError,
  isSlotConflictError,
  loadBookingDraft,
  normalizePhone,
  resolveStep,
  sanitizeSelection,
  saveBookingDraft,
  selectionFromParams,
  selectionToParams,
  shiftMonth,
  type BookingSelection,
  type BookingStep,
} from '@/features/booking/selection';
import { useGetAvailabilityQuery, useGetPublicBarbershopQuery } from '@/features/public/api';
import { addressLine } from '@/features/public/components';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Appointment, PublicBarbershop } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { WEEKDAYS_SHORT, addDays, formatDate, formatLocalDateLong, formatTime, todayIn } from '@/utils/date';
import { formatBRL, formatDuration } from '@/utils/format';

const STEP_LABEL: Record<BookingStep, string> = { filial: 'Unidade', servico: 'Serviço', barbeiro: 'Barbeiro', horario: 'Horário', pagamento: 'Pagamento' };
const BOOKING_WINDOW_DAYS = 60;

// ---------------------------------------------------------------------------------------------

const Stepper = ({ steps, current, onGo, reachable }: { steps: BookingStep[]; current: BookingStep; onGo: (s: BookingStep) => void; reachable: (s: BookingStep) => boolean }) => {
  const index = steps.indexOf(current);
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Etapas do agendamento">
      {steps.map((step, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!reachable(step) || active}
              onClick={() => onGo(step)}
              aria-current={active ? 'step' : undefined}
              className="flex min-w-0 items-center gap-2 disabled:cursor-default"
            >
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition', done ? 'bg-primary-600 text-white' : active ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-surface-high text-ink-variant')}>
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn('hidden truncate text-sm font-semibold md:inline', active ? 'text-ink' : 'text-ink-variant')}>{STEP_LABEL[step]}</span>
            </button>
            {i < steps.length - 1 ? <span className={cn('h-0.5 flex-1 rounded-full', done ? 'bg-primary-600' : 'bg-surface-high')} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
};

const choice = (selected: boolean) =>
  cn('w-full rounded-xl border-2 bg-white p-4 text-left shadow-card transition focus:outline-none focus:ring-2 focus:ring-primary-200', selected ? 'border-primary-600 bg-primary-50' : 'border-transparent hover:border-primary-200');

// ---------------------------------------------------------------------------------------------

const Summary = ({ shop, selection, onContinue, continueLabel, canContinue, loading }: { shop: PublicBarbershop; selection: BookingSelection; onContinue?: () => void; continueLabel?: string; canContinue?: boolean; loading?: boolean }) => {
  const branch = shop.branches.find((b) => b.id === selection.branchId);
  const service = shop.services.find((s) => s.id === selection.serviceId);
  const barber = typeof selection.barber === 'number' ? shop.barbers.find((b) => b.id === selection.barber) : null;
  const tz = branch?.timezone;
  const rows = [
    { icon: Store, label: 'Unidade', value: branch?.name },
    { icon: Scissors, label: 'Serviço', value: service ? `${service.name} · ${formatDuration(service.duration)}` : undefined },
    { icon: User, label: 'Barbeiro', value: selection.barber === 'qualquer' ? 'Sem preferência' : barber?.display_name ?? undefined },
    { icon: CalendarCheck, label: 'Data e hora', value: selection.startAt ? `${formatDate(selection.startAt, tz)} às ${formatTime(selection.startAt, tz)}` : undefined },
  ];
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl bg-white shadow-card">
        <div className="flex items-center gap-3 bg-primary-600 p-5 text-white">
          {shop.logo_url ? <img src={shop.logo_url} alt="" className="h-12 w-12 rounded-xl bg-white object-cover" /> : <Avatar name={shop.name} />}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-label text-primary-100">Seu agendamento</p>
            <p className="truncate text-lg font-bold">{shop.name}</p>
          </div>
        </div>
        <dl className="space-y-4 p-5">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', value ? 'bg-primary-100 text-primary-600' : 'bg-surface-low text-ink-subtle')}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-label text-ink-variant">{label}</dt>
                <dd className={cn('text-sm font-semibold', value ? 'text-ink' : 'text-ink-subtle')}>{value ?? 'A escolher'}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="border-t border-surface-low p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-variant">Total</span>
            <span className="text-2xl font-black tracking-[-0.05em] text-ink">{service ? formatBRL(service.price) : '—'}</span>
          </div>
          {onContinue ? (
            <Button className="mt-4" block size="lg" disabled={!canContinue} loading={loading} onClick={onContinue} icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              {continueLabel ?? 'Continuar'}
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

// ---------------------------------------------------------------------------------------------

const TimeStep = ({ shop, selection, update }: { shop: PublicBarbershop; selection: BookingSelection; update: (patch: Partial<BookingSelection>) => void }) => {
  const branch = shop.branches.find((b) => b.id === selection.branchId)!;
  const tz = branch.timezone;
  const today = todayIn(tz);
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS);
  const date = selection.date ?? today;
  const [month, setMonth] = useState(date.slice(0, 7));
  const openingHours = branch.opening_hours;
  const days = useMemo(
    () => buildCalendarMonth(month, today, maxDate, openingHours?.length ? [...new Set(openingHours.map((h) => h.weekday))] : null),
    [month, today, maxDate, openingHours]
  );
  const { data: slots = [], isFetching, error, refetch } = useGetAvailabilityQuery(
    selection.serviceId ? { branch_id: branch.id, service_id: selection.serviceId, date, barber_id: typeof selection.barber === 'number' ? selection.barber : undefined } : skipToken
  );
  const groups = groupSlotsByPeriod(slots, tz);
  const [y, m] = month.split('-').map(Number);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low disabled:opacity-30" aria-label="Mês anterior" disabled={month <= today.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-bold text-ink">
            {MONTHS[m - 1]} {y}
          </p>
          <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low disabled:opacity-30" aria-label="Próximo mês" disabled={month >= maxDate.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS_SHORT.map((d) => (
            <span key={d} className="py-1 text-[11px] font-semibold uppercase tracking-label text-ink-subtle">
              {d}
            </span>
          ))}
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              disabled={day.disabled}
              aria-pressed={day.date === date}
              aria-label={formatLocalDateLong(day.date)}
              onClick={() => update({ date: day.date, startAt: null })}
              className={cn(
                'aspect-square rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed',
                !day.inMonth && 'invisible',
                day.date === date ? 'bg-primary-600 text-white shadow-primary' : day.disabled ? 'text-ink-subtle/50' : day.today ? 'bg-primary-50 text-primary-600 hover:bg-primary-100' : 'text-ink hover:bg-surface-low'
              )}
            >
              {day.day}
            </button>
          ))}
        </div>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-bold capitalize text-ink">{formatLocalDateLong(date)}</h3>
        {isFetching ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : groups.length === 0 ? (
          <EmptyState title="Nenhum horário livre neste dia" description="Escolha outra data ou outro barbeiro." />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.period}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-label text-ink-variant">{PERIOD_LABEL[group.period]}</h4>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {group.slots.map((slot) => {
                    const active = slot.start_at === selection.startAt;
                    return (
                      <button
                        key={slot.start_at}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update({ date, startAt: slot.start_at })}
                        className={cn('h-12 rounded-lg text-sm font-bold transition', active ? 'bg-primary-600 text-white shadow-primary' : 'bg-white text-ink shadow-card hover:bg-primary-50 hover:text-primary-600')}
                      >
                        {formatTime(slot.start_at, tz)}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------

const BookingPage = () => {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug);
  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();
  const [updateProfile, { isLoading: savingPhone }] = useUpdateProfileMutation();
  const draft = useMemo(() => loadBookingDraft(slug), [slug]);
  const [notes, setNotes] = useState(draft?.notes ?? '');
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsContact, setNeedsContact] = useState(false);
  const [created, setCreated] = useState<Appointment | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());
  usePageTitle(shop ? `Agendar em ${shop.name}` : 'Agendar');

  // Seleção: URL > rascunho salvo antes do login.
  const fromUrl = selectionFromParams(params);
  const raw = fromUrl.branchId || fromUrl.serviceId || !draft ? fromUrl : draft.selection;
  const selection = shop ? sanitizeSelection(raw, shop) : raw;
  const steps = shop && shop.branches.length > 1 ? STEP_ORDER : STEP_ORDER.filter((s) => s !== 'filial');
  const step = resolveStep(params.get('etapa'), selection);

  // Normaliza a URL quando a seleção muda (rascunho restaurado ou escolha inválida removida).
  useEffect(() => {
    if (!shop) return;
    const next = selectionToParams(selection, params);
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop, selection.branchId, selection.serviceId, selection.barber, selection.date, selection.startAt]);

  const go = (target: BookingStep, patch?: Partial<BookingSelection>) => {
    const next = selectionToParams({ ...selection, ...patch }, params);
    next.set('etapa', target);
    setParams(next);
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const update = (patch: Partial<BookingSelection>) => {
    const next = selectionToParams({ ...selection, ...patch }, params);
    setParams(next, { replace: true });
    setSubmitError(null);
  };
  const nextOf = (s: BookingStep) => steps[steps.indexOf(s) + 1] ?? 'pagamento';
  const prevOf = (s: BookingStep) => steps[steps.indexOf(s) - 1];

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10"><ListSkeleton rows={4} /></div>;
  if (error || !shop) return <div className="mx-auto max-w-xl px-4 py-16"><ErrorState error={error} title="Barbearia indisponível" onRetry={refetch} /></div>;

  const branch = shop.branches.find((b) => b.id === selection.branchId);
  const service = shop.services.find((s) => s.id === selection.serviceId);
  const barbers = barbersFor(shop, selection.branchId, selection.serviceId);
  const tz = branch?.timezone ?? 'America/Sao_Paulo';

  const confirm = async () => {
    if (!branch || !service || !selection.startAt) return;
    if (!isAuthenticated) {
      saveBookingDraft(slug, selection, notes);
      navigate('/login', { state: { from: `${location.pathname}${location.search}`, reason: 'booking' } });
      return;
    }
    setSubmitError(null);
    try {
      if (needsContact || !canBookWithContact(user)) {
        const digits = normalizePhone(phone);
        if (!digits) {
          setNeedsContact(true);
          setSubmitError('Informe um celular com DDD para a barbearia poder falar com você.');
          return;
        }
        await updateProfile({ phone: digits }).unwrap();
        await dispatch(refreshMe());
        setNeedsContact(false);
      }
      const result = await createAppointment({
        branch_id: branch.id,
        service_id: service.id,
        barber_id: typeof selection.barber === 'number' ? selection.barber : undefined,
        start_at: selection.startAt,
        notes: notes.trim() || undefined,
        source: 'web',
        idempotencyKey: idempotencyKey.current,
      }).unwrap();
      clearBookingDraft();
      setCreated(result.appointment);
      toast.success('Agendamento confirmado!');
    } catch (err) {
      if (isContactRequiredError(err)) {
        setNeedsContact(true);
        setSubmitError('Para confirmar, informe um celular (ou confirme seu e-mail).');
      } else if (isSlotConflictError(err)) {
        idempotencyKey.current = newIdempotencyKey();
        toast.error('Esse horário acabou de ser reservado. Escolha outro.');
        go('horario', { startAt: null });
      } else {
        setSubmitError(apiErrorMessage(err));
      }
    }
  };

  if (created) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        <Card className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
            <CalendarCheck className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-ink">Agendamento confirmado!</h1>
          <p className="mt-2 text-ink-variant">
            {created.service_name_snapshot} em {formatDate(created.start_at, tz)} às {formatTime(created.start_at, tz)} — {branch?.name}.
          </p>
          <p className="mt-1 text-sm text-ink-variant">Pagamento no local. Enviamos a confirmação por e-mail.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to={`/cliente/agendamentos/${created.id}`} className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-600 font-semibold text-white hover:bg-primary-700">
              Ver meu agendamento
            </Link>
            <Link to={`/b/${shop.slug}`} className="text-sm font-semibold text-primary-600 hover:underline">
              Voltar para {shop.name}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const reachable = (s: BookingStep) => STEP_ORDER.indexOf(s) <= STEP_ORDER.indexOf(resolveStep(null, selection));
  const back = prevOf(step);
  const canContinue =
    step === 'filial' ? Boolean(branch) : step === 'servico' ? Boolean(service) : step === 'barbeiro' ? selection.barber !== null : step === 'horario' ? Boolean(selection.startAt) : true;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-32 sm:py-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        {back ? (
          <button type="button" onClick={() => go(back)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {STEP_LABEL[back]}
          </button>
        ) : (
          <Link to={`/b/${shop.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {shop.name}
          </Link>
        )}
      </div>
      <Stepper steps={steps} current={step} onGo={(s) => go(s)} reachable={reachable} />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {step === 'filial' ? (
            <>
              <h1 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-3xl">Escolha a unidade</h1>
              <p className="mb-6 text-ink-variant">Onde você quer ser atendido?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {shop.branches.map((b) => (
                  <button key={b.id} type="button" className={choice(b.id === selection.branchId)} onClick={() => go(nextOf('filial'), { branchId: b.id, barber: null, startAt: null })}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-ink">{b.name}</p>
                      <Badge tone={b.open_now ? 'green' : 'gray'}>{b.open_now ? 'Aberto agora' : 'Fechado'}</Badge>
                    </div>
                    <p className="mt-2 flex items-start gap-1 text-sm text-ink-variant">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {addressLine(b.address)}
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 'servico' ? (
            <>
              <h1 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-3xl">Escolha o serviço</h1>
              <p className="mb-6 text-ink-variant">{branch ? `${branch.name} · ` : ''}Selecione o que você quer fazer.</p>
              {shop.services.length === 0 ? (
                <EmptyState title="Nenhum serviço disponível" />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {shop.services.map((s) => (
                    <button key={s.id} type="button" className={choice(s.id === selection.serviceId)} onClick={() => go('barbeiro', { serviceId: s.id, barber: null, startAt: null })}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-ink">{s.name}</p>
                          {s.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-variant">{s.description}</p> : null}
                        </div>
                        <span className="shrink-0 text-lg font-black text-primary-600">{formatBRL(s.price)}</span>
                      </div>
                      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-variant">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatDuration(s.duration)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {step === 'barbeiro' ? (
            <>
              <h1 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-3xl">Escolha o barbeiro</h1>
              <p className="mb-6 text-ink-variant">Prefere alguém em especial?</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <button type="button" className={choice(selection.barber === 'qualquer')} onClick={() => go('horario', { barber: 'qualquer', startAt: null })}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <User className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-bold text-ink">Sem preferência</p>
                  <p className="text-sm text-ink-variant">Mais horários disponíveis</p>
                </button>
                {barbers.map((b) => (
                  <button key={b.id} type="button" className={choice(selection.barber === b.id)} onClick={() => go('horario', { barber: b.id, startAt: null })}>
                    <Avatar name={b.display_name} src={b.photo_url} size="lg" />
                    <p className="mt-3 font-bold text-ink">{b.display_name || 'Barbeiro'}</p>
                    {b.bio ? <p className="line-clamp-2 text-sm text-ink-variant">{b.bio}</p> : null}
                  </button>
                ))}
              </div>
              {barbers.length === 0 ? <p className="mt-4 text-sm text-ink-variant">Nenhum barbeiro específico para este serviço — escolha “Sem preferência”.</p> : null}
            </>
          ) : null}

          {step === 'horario' && branch && service ? (
            <>
              <h1 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-3xl">Escolha o horário</h1>
              <p className="mb-6 text-ink-variant">Horários no fuso da unidade.</p>
              <TimeStep shop={shop} selection={selection} update={update} />
            </>
          ) : null}

          {step === 'pagamento' && branch && service && selection.startAt ? (
            <>
              <h1 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-3xl">Pagamento</h1>
              <p className="mb-6 text-ink-variant">Escolha como você vai pagar.</p>
              <div className="space-y-3" role="radiogroup" aria-label="Forma de pagamento">
                <div role="radio" aria-checked="true" className="flex items-center gap-4 rounded-xl border-2 border-primary-600 bg-primary-50 p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-card">
                    <Wallet className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-ink">Pagar no local</p>
                    <p className="text-sm text-ink-variant">Dinheiro, Pix ou cartão direto na barbearia.</p>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
                {[
                  { icon: CreditCard, label: 'Cartão de crédito' },
                  { icon: QrCode, label: 'Pix online' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} role="radio" aria-checked="false" aria-disabled="true" className="flex items-center gap-4 rounded-xl border-2 border-transparent bg-white p-4 opacity-60 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-low text-ink-subtle">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="flex-1 font-semibold text-ink-variant">{label}</p>
                    <Badge>Em breve</Badge>
                  </div>
                ))}
              </div>

              <Textarea containerClassName="mt-6" label="Observações (opcional)" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: quero manter o comprimento em cima" />

              {isAuthenticated && (needsContact || !canBookWithContact(user)) ? (
                <Card className="mt-6">
                  <p className="mb-3 text-sm text-ink-variant">Precisamos de um contato para a barbearia avisar você sobre o horário.</p>
                  <Input label="Celular com DDD" inputMode="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Card>
              ) : null}
              {!isAuthenticated ? (
                <Alert tone="info" className="mt-6" title="Falta só entrar">
                  Entre ou crie sua conta para confirmar — sua escolha fica guardada.
                </Alert>
              ) : null}
              {submitError ? (
                <Alert tone="error" className="mt-6">
                  {submitError}
                </Alert>
              ) : null}
              <p className="mt-4 text-xs text-ink-variant">Você pode cancelar ou remarcar online até 24 horas antes.</p>
            </>
          ) : null}
        </div>

        <Summary
          shop={shop}
          selection={selection}
          canContinue={canContinue && !creating}
          loading={creating || savingPhone}
          continueLabel={step === 'pagamento' ? (isAuthenticated ? 'Confirmar agendamento' : 'Entrar e confirmar') : 'Continuar'}
          onContinue={step === 'pagamento' ? () => void confirm() : () => go(nextOf(step))}
        />
      </div>
    </div>
  );
};

export default BookingPage;
