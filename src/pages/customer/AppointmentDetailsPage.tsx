// Figma "Detalhes do Agendamento" (1:1659) — /cliente/agendamentos/:appointmentId (GET /appointment/{id}).
// Cabeçalho de status, bento barbeiro/serviço, localização (GET /barbershop/{id}, público) e ações:
// reagendar/cancelar só quando a API permite (`allowed_actions`, janela de 24 h) e "Agendar novamente".
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CalendarClock, CalendarPlus, CheckCircle2, Clock, MapPin, Navigation, Scissors, UserX, XCircle } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';

import { Alert, Avatar, ErrorState, Skeleton, buttonClass } from '@/components/ui';
import { CancelAppointmentDialog, RescheduleModal } from '@/features/customer/AppointmentActions';
import { useCustomerAppointmentQuery, useCustomerBarbershopQuery } from '@/features/customer/api';
import {
  barberName,
  canCancel,
  canReschedule,
  formatWeekdayDayMonth,
  isCancellationWindowClosed,
  rebookPath,
  serviceName,
  timezoneOf,
} from '@/features/customer/helpers';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Address, AppointmentStatus } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTime } from '@/utils/date';
import { formatBRL, formatDuration, formatPhone } from '@/utils/format';

const STATUS_VIEW: Record<AppointmentStatus, { label: string; icon: ReactNode; className: string }> = {
  confirmado: { label: 'Confirmado', icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: 'bg-primary-100 text-primary-600' },
  concluido: { label: 'Concluído', icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: 'bg-success-50 text-success-700' },
  cancelado: { label: 'Cancelado', icon: <XCircle className="h-3.5 w-3.5" />, className: 'bg-surface-high text-ink-variant' },
  nao_compareceu: { label: 'Não compareceu', icon: <UserX className="h-3.5 w-3.5" />, className: 'bg-danger-50 text-danger-700' },
};

const eyebrow = 'text-xs font-bold uppercase tracking-label text-ink-variant';

const addressLines = (address: Address | null | undefined): string[] => {
  if (!address) return [];
  const street = [address.street, address.number].filter(Boolean).join(', ');
  const first = [street, address.complement].filter(Boolean).join(' – ');
  const second = [address.neighborhood, [address.city, address.state].filter(Boolean).join('/')].filter(Boolean).join(' · ');
  return [first, second].filter(Boolean);
};

const mapsLink = (name: string, address: Address): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, address.street, address.number, address.city, address.state, address.cep].filter(Boolean).join(', '))}`;

const BackLink = () => (
  <Link to="/cliente/agendamentos" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" aria-label="Voltar para meus agendamentos">
    <ArrowLeft className="h-5 w-5" />
  </Link>
);

const AppointmentDetailsPage = () => {
  const { appointmentId } = useParams();
  const id = Number(appointmentId);
  const { data: appointment, isLoading, error, refetch } = useCustomerAppointmentQuery(id || skipToken);
  const shopId = appointment?.Branch?.barbershop_id;
  const { data: shop, isLoading: shopLoading } = useCustomerBarbershopQuery(shopId ?? skipToken);
  const { data: publicShop } = useGetPublicBarbershopQuery(shop?.slug ?? skipToken);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  usePageTitle(appointment ? `${serviceName(appointment)} · Agendamento` : 'Detalhes do agendamento');

  const header = (
    <div className="flex items-center gap-3">
      <BackLink />
      <h1 className="text-xl font-bold tracking-[-0.025em] text-ink">Detalhes do agendamento</h1>
    </div>
  );

  if (!id) {
    return (
      <div className="mx-auto w-full max-w-[768px] px-4 py-6 sm:px-6">
        {header}
        <ErrorState className="mt-8" title="Agendamento não encontrado" error={{ message: 'Endereço inválido.' }} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[768px] space-y-6 px-4 py-6 sm:px-6" role="status" aria-label="Carregando agendamento">
        {header}
        <Skeleton className="mx-auto h-32 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-44" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto w-full max-w-[768px] px-4 py-6 sm:px-6">
        {header}
        <ErrorState className="mt-8" error={error} onRetry={refetch} title="Não foi possível carregar o agendamento" />
      </div>
    );
  }

  const timezone = timezoneOf(appointment);
  const status = STATUS_VIEW[appointment.status];
  const barber = barberName(appointment);
  const barberPhoto = publicShop?.barbers.find((item) => item.id === appointment.barber_id)?.photo_url ?? null;
  const branch = shop?.Branches?.find((item) => item.id === appointment.branch_id);
  const branchName = branch?.name ?? appointment.Branch?.name ?? 'Filial';
  const lines = addressLines(branch?.Address);
  const duration = appointment.duration_min || appointment.Service?.duration;
  const showReschedule = canReschedule(appointment);
  const showCancel = canCancel(appointment);
  const windowClosed = isCancellationWindowClosed(appointment);
  const contact = branch?.whatsapp || branch?.phone || shop?.whatsapp || shop?.phone || null;

  return (
    <div className="mx-auto w-full max-w-[768px] px-4 pb-16 pt-6 sm:px-6">
      {header}

      <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
        {/* Status Header */}
        <section className="flex flex-col items-center py-4 text-center sm:py-6">
          <span className={cn('inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-bold', status.className)}>
            {status.icon}
            {status.label}
          </span>
          <h2 className="mt-4 text-base font-semibold text-ink-variant">{formatWeekdayDayMonth(appointment.start_at, timezone)}</h2>
          <p className="mt-1 text-[28px] font-black leading-9 tracking-[-0.05em] text-ink sm:text-4xl sm:leading-10">
            {formatTime(appointment.start_at, timezone)}
            <span className="font-medium text-ink-variant"> – {formatTime(appointment.end_at, timezone)}</span>
          </p>
          {shop?.name ? <p className="mt-2 text-sm text-ink-variant">{shop.name}</p> : null}
        </section>

        {appointment.status === 'cancelado' && appointment.cancel_reason ? (
          <Alert tone="info" title="Motivo do cancelamento">
            {appointment.cancel_reason}
          </Alert>
        ) : null}
        {windowClosed ? (
          <Alert tone="warning" title="Prazo para alterar online encerrado">
            Cancelamentos e reagendamentos online vão até 24 h antes ({formatDateTime(appointment.can_cancel_until, timezone)}). Para mudanças, fale com a
            barbearia{contact ? <>: <strong>{formatPhone(contact)}</strong></> : '.'}
          </Alert>
        ) : null}

        {/* Bento: barbeiro + serviço */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-card">
            {barberPhoto ? (
              <img src={barberPhoto} alt={barber ?? 'Barbeiro'} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <Avatar name={barber} size="lg" />
            )}
            <div className="min-w-0">
              <p className={eyebrow}>Seu barbeiro</p>
              <h3 className="mt-1 truncate text-lg font-bold leading-7 text-ink">{barber ?? 'Barbeiro da casa'}</h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-variant">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{branchName}</span>
              </p>
            </div>
          </section>
          <section className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-card">
            <p className={eyebrow}>Serviço agendado</p>
            <div className="mt-1 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-7 text-ink">{serviceName(appointment)}</h3>
                {duration ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-variant">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatDuration(duration)}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-lg font-black tracking-[-0.025em] text-primary-600">{formatBRL(appointment.price_snapshot)}</p>
            </div>
          </section>
        </div>

        {/* Localização */}
        <section className="rounded-xl bg-white p-6 shadow-card">
          <p className={eyebrow}>Localização</p>
          <div className="mt-3 flex items-start gap-4">
            <span className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600" aria-hidden="true">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-ink">
                {shop?.name ? `${shop.name} – ${branchName}` : branchName}
              </h4>
              {shopLoading ? (
                <Skeleton className="mt-2 h-4 w-48" />
              ) : lines.length ? (
                lines.map((line) => (
                  <p key={line} className="text-sm text-ink-variant">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-sm text-ink-variant">Endereço não informado pela barbearia.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {branch?.Address ? (
                  <a href={mapsLink(shop?.name ?? branchName, branch.Address)} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'sm')}>
                    <Navigation className="h-4 w-4" aria-hidden="true" /> Como chegar
                  </a>
                ) : null}
                {shop?.slug ? (
                  <Link to={`/b/${shop.slug}/${appointment.branch_id}`} className={buttonClass('ghost', 'sm')}>
                    Ver filial
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Ações */}
        <section className="space-y-3 rounded-xl bg-surface-low p-4 sm:p-6" aria-label="Ações">
          {showReschedule ? (
            <button type="button" onClick={() => setRescheduleOpen(true)} className={buttonClass('primary', 'lg', 'w-full')}>
              <CalendarClock className="h-5 w-5" aria-hidden="true" /> Reagendar horário
            </button>
          ) : null}
          {showCancel ? (
            <button type="button" onClick={() => setCancelOpen(true)} className={buttonClass('outline', 'lg', 'w-full text-danger-600 hover:bg-danger-50')}>
              <Ban className="h-5 w-5" aria-hidden="true" /> Cancelar agendamento
            </button>
          ) : null}
          {shop?.slug ? (
            <Link to={rebookPath(shop.slug, appointment)} className={buttonClass(showReschedule || showCancel ? 'ghost' : 'primary', 'lg', 'w-full')}>
              <CalendarPlus className="h-5 w-5" aria-hidden="true" /> Agendar novamente
            </Link>
          ) : !shopLoading ? (
            <Link to="/filiais" className={buttonClass(showReschedule || showCancel ? 'ghost' : 'primary', 'lg', 'w-full')}>
              <Scissors className="h-5 w-5" aria-hidden="true" /> Encontrar barbearia
            </Link>
          ) : null}
        </section>
      </div>

      <CancelAppointmentDialog appointment={cancelOpen ? appointment : null} onClose={() => setCancelOpen(false)} />
      <RescheduleModal appointment={rescheduleOpen ? appointment : null} onClose={() => setRescheduleOpen(false)} />
    </div>
  );
};

export default AppointmentDetailsPage;
