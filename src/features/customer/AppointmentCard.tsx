// Cartões de agendamento do Figma "Meus Agendamentos" (1:1112): destaque (próximo), padrão (demais
// futuros, fundo surface-container) e minimalista (histórico, fundo surface-low).
import { Link } from 'react-router-dom';
import { Clock, MapPin, User } from 'lucide-react';

import { Avatar, StatusBadge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatShortDate, formatTime } from '@/utils/date';

import { appointmentPath, barberName, canCancel, canReschedule, formatDayMonth, isCancellationWindowClosed, relativeDayLabel, serviceName, timezoneOf } from './helpers';
import type { CustomerAppointment } from './types';

interface AppointmentCardProps {
  appointment: CustomerAppointment;
  variant: 'highlight' | 'default' | 'minimal';
  onReschedule?: (appointment: CustomerAppointment) => void;
  onCancel?: (appointment: CustomerAppointment) => void;
}

const actionText = 'text-xs font-bold uppercase tracking-label sm:text-sm sm:tracking-[0.05em]';

export const AppointmentCard = ({ appointment, variant, onReschedule, onCancel }: AppointmentCardProps) => {
  const timezone = timezoneOf(appointment);
  const barber = barberName(appointment);
  const dayLabel = relativeDayLabel(appointment.start_at, timezone);
  const showCancel = canCancel(appointment) && !!onCancel;
  const showReschedule = canReschedule(appointment) && !!onReschedule;
  const windowClosed = isCancellationWindowClosed(appointment);
  const details = appointmentPath(appointment.id);

  if (variant === 'minimal') {
    return (
      <article className="flex flex-col gap-4 rounded-lg bg-surface-low p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-lg font-bold leading-7 tracking-[-0.025em] text-ink">
              <Link to={details} className="hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                {serviceName(appointment)}
              </Link>
            </h3>
            <p className="truncate text-sm text-ink-variant">
              {barber ? `Com ${barber}` : null}
              {barber && appointment.Branch?.name ? ' · ' : null}
              {appointment.Branch?.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-ink">{formatTime(appointment.start_at, timezone)}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-variant">{formatShortDate(appointment.start_at, timezone)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={appointment.status} />
          <Link to={details} className="inline-flex min-h-[40px] items-center text-xs font-bold uppercase tracking-label text-primary-500 hover:text-primary-600">
            Ver detalhes do serviço
          </Link>
        </div>
      </article>
    );
  }

  const highlight = variant === 'highlight';
  return (
    <article className={cn('flex flex-col overflow-hidden rounded-lg p-5 sm:p-6', highlight ? 'gap-6 bg-white shadow-soft sm:gap-8' : 'gap-5 bg-surface-container sm:gap-6')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className={cn('hidden shrink-0 sm:block', !highlight && 'opacity-80')}>
            <Avatar name={barber || serviceName(appointment)} size="lg" />
          </span>
          <div className="min-w-0">
            {highlight && dayLabel ? (
              <span className="mb-1 inline-flex rounded-xl bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase leading-[15px] tracking-[0.1em] text-primary-900">{dayLabel}</span>
            ) : null}
            <h3 className={cn('font-bold text-ink', highlight ? 'text-xl leading-7 tracking-[-0.025em]' : 'text-lg leading-7 tracking-[-0.025em]')}>
              <Link to={details} className="hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                {serviceName(appointment)}
              </Link>
            </h3>
            {barber ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-variant">
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{barber}</span>
              </p>
            ) : null}
            {appointment.Branch?.name ? (
              <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-variant">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{appointment.Branch.name}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('font-black', highlight ? 'text-2xl leading-8 tracking-[-0.05em] text-primary-600' : 'text-xl leading-7 tracking-[-0.025em] text-ink')}>
            {formatTime(appointment.start_at, timezone)}
          </p>
          <p className="text-xs font-bold uppercase tracking-label text-ink-variant">{formatDayMonth(appointment.start_at, timezone)}</p>
        </div>
      </div>

      {showReschedule || showCancel ? (
        <div className={cn('flex gap-3', highlight && 'border-t border-surface-low pt-6')}>
          {showReschedule ? (
            <button
              type="button"
              onClick={() => onReschedule?.(appointment)}
              className={cn(
                'min-h-[44px] flex-1 rounded-lg px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
                actionText,
                highlight ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white text-ink shadow-card hover:bg-surface-low'
              )}
            >
              {highlight ? 'Reagendar' : 'Alterar'}
            </button>
          ) : null}
          {showCancel ? (
            <button
              type="button"
              onClick={() => onCancel?.(appointment)}
              className={cn(
                'min-h-[44px] flex-1 rounded-lg px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-600 focus-visible:ring-offset-2',
                actionText,
                highlight ? 'bg-surface-low text-ink-variant hover:bg-surface-high' : 'text-danger-600 hover:bg-danger-50'
              )}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      ) : (
        <div className={cn('flex flex-wrap items-center justify-between gap-3', highlight && 'border-t border-surface-low pt-6')}>
          {windowClosed ? (
            <p className="flex items-center gap-2 text-xs text-ink-variant">
              <Clock className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
              Prazo para alterar online encerrado (24 h antes). Fale com a barbearia.
            </p>
          ) : (
            <StatusBadge status={appointment.status} />
          )}
          <Link to={details} className="inline-flex min-h-[40px] items-center text-xs font-bold uppercase tracking-label text-primary-600 hover:text-primary-700">
            Ver detalhes
          </Link>
        </div>
      )}
    </article>
  );
};
