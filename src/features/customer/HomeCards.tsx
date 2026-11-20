// Cartões da "Home do Cliente" (Figma 1:2209): reserva próxima (carrossel) e barbearia frequente.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Map, Scissors } from 'lucide-react';

import { Avatar, Skeleton } from '@/components/ui';
import shopFallback1 from '@/assets/figma/customer/shop-fallback-1.png';
import shopFallback2 from '@/assets/figma/customer/shop-fallback-2.png';
import shopFallback3 from '@/assets/figma/customer/shop-fallback-3.png';
import { cn } from '@/utils/cn';
import { formatTime, relativeFromNow } from '@/utils/date';

import { useCustomerBarbershopQuery } from './api';
import { appointmentPath, barberName, canReschedule, formatDayMonth, frequentSubtitle, relativeDayLabel, serviceName, timezoneOf } from './helpers';
import type { CustomerAppointment, FrequentBarbershop } from './types';

const FALLBACKS = [shopFallback1, shopFallback2, shopFallback3];

/** "AMANHÃ, 14:30" / "24 DE NOVEMBRO, 10:00" */
const whenLabel = (appointment: CustomerAppointment): string => {
  const timezone = timezoneOf(appointment);
  const day = relativeDayLabel(appointment.start_at, timezone) ?? formatDayMonth(appointment.start_at, timezone);
  return `${day}, ${formatTime(appointment.start_at, timezone)}`;
};

interface BookingCardProps {
  appointment: CustomerAppointment;
  featured: boolean;
  onReschedule: (appointment: CustomerAppointment) => void;
}

export const UpcomingBookingCard = ({ appointment, featured, onReschedule }: BookingCardProps) => {
  const shopId = appointment.Branch?.barbershop_id;
  const { data: shop } = useCustomerBarbershopQuery(shopId ?? 0, { skip: !shopId });
  const barber = barberName(appointment);
  const details = appointmentPath(appointment.id);
  const reschedulable = featured && canReschedule(appointment);

  return (
    <article className={cn('flex w-[85vw] max-w-[340px] shrink-0 snap-start flex-col gap-6 rounded-lg bg-white p-6 shadow-card sm:w-[340px]', !featured && 'opacity-80')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('pb-1 text-xs font-bold uppercase tracking-label', featured ? 'text-primary-600' : 'text-slate-400')}>{whenLabel(appointment)}</p>
          <h3 className="truncate text-lg font-bold leading-7 text-ink">
            <Link to={details} className="hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
              {serviceName(appointment)}
            </Link>
          </h3>
        </div>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', featured ? 'bg-primary-100 text-primary-600' : 'bg-surface-container text-ink-subtle')} aria-hidden="true">
          <Scissors className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={shop?.name ?? appointment.Branch?.name} src={shop?.logo_url} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{shop?.name ?? appointment.Branch?.name ?? 'Barbearia'}</p>
          <p className="truncate text-xs text-ink-variant">{barber ? `Barbeiro: ${barber}` : appointment.Branch?.name}</p>
        </div>
      </div>
      <div className="mt-auto flex gap-2">
        {reschedulable ? (
          <>
            <button
              type="button"
              onClick={() => onReschedule(appointment)}
              className="min-h-[44px] flex-1 rounded-lg bg-surface-low text-xs font-semibold text-ink transition hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              Reagendar
            </button>
            <Link
              to={details}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary-600 px-4 text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              aria-label="Ver detalhes e localização"
            >
              <Map className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <Link
            to={details}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-surface-low text-xs font-semibold text-ink transition hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            Detalhes
          </Link>
        )}
      </div>
    </article>
  );
};

export const FrequentBarbershopCard = ({ entry, index, badge }: { entry: FrequentBarbershop; index: number; badge?: string }) => {
  const { data: shop, isLoading, isError } = useCustomerBarbershopQuery(entry.barbershopId);
  if (isLoading) return <Skeleton className="aspect-[4/3] w-full" />;
  // Barbearia suspensa/removida (404 no perfil público): não aparece.
  if (isError || !shop) return null;
  const image = shop.cover_url || shop.logo_url || FALLBACKS[index % FALLBACKS.length];

  return (
    <Link
      to={`/b/${shop.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
        <span className="min-w-0">
          <span className="block truncate text-lg font-bold leading-7 text-white">{shop.name}</span>
          <span className="block truncate text-xs text-white/70">{frequentSubtitle(entry, relativeFromNow)}</span>
        </span>
        {badge ? <span className="shrink-0 rounded-xl bg-primary-500 px-3 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.05em] text-white">{badge}</span> : null}
      </span>
    </Link>
  );
};

export const QuickAction = ({ to, icon, title, description }: { to: string; icon: ReactNode; title: string; description: string }) => (
  <Link
    to={to}
    className="flex min-h-[72px] items-center gap-4 rounded-lg bg-white p-4 shadow-card transition hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600" aria-hidden="true">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-bold text-ink">{title}</span>
      <span className="block text-xs text-ink-variant">{description}</span>
    </span>
  </Link>
);

