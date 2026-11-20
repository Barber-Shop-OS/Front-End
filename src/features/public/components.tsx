// Peças das páginas públicas (Figma: Landing 1:252, Busca 1:714, Barbearia 1:521, Filial 1:949).
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, MapPin, MessageCircle, Navigation, Phone, Share2 } from 'lucide-react';

import { Badge, Skeleton, useToast } from '@/components/ui';
import type { Address, OpeningHour } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatPhone, whatsappLink } from '@/utils/format';

import { groupOpeningHours } from './utils';

export const addressLine = (address: Address | null | undefined): string =>
  address
    ? `${[address.street, address.number].filter(Boolean).join(', ')}${address.neighborhood ? ` — ${address.neighborhood}` : ''}, ${address.city}/${address.state}`
    : '';

export const mapsLink = (address: Address | null | undefined): string | null =>
  address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(address))}` : null;

export const AddressLine = ({ address, className }: { address: Address | null | undefined; className?: string }) => {
  if (!address) return null;
  const link = mapsLink(address);
  return (
    <a href={link ?? undefined} target="_blank" rel="noreferrer" className={cn('flex items-start gap-2 text-sm text-ink-variant hover:text-primary-600', className)}>
      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{addressLine(address)}</span>
    </a>
  );
};

export const OpenNowBadge = ({ open, className }: { open: boolean; className?: string }) => (
  <Badge tone={open ? 'green' : 'gray'} className={className}>
    {open ? 'Aberto agora' : 'Fechado agora'}
  </Badge>
);

/** Horários agrupados (Figma 1:949 "Horário de Precisão"): rótulo à esquerda, horário em primary, "Fechado" em vermelho. */
export const OpeningHoursList = ({ hours, className }: { hours: OpeningHour[]; className?: string }) => {
  const today = new Date().getDay();
  const rows = groupOpeningHours(hours);
  return (
    <ul className={cn('space-y-4', className)}>
      {rows.map((row) => {
        const isToday = row.weekdays.includes(today);
        return (
          <li key={row.label} className="flex items-center justify-between gap-4 text-sm leading-5">
            <span className={cn('text-ink-variant', isToday && 'font-semibold text-ink')}>
              {row.label}
              {isToday ? <span className="sr-only"> (hoje)</span> : null}
            </span>
            <span className={cn('text-right font-semibold', row.closed ? 'text-danger-600' : 'text-primary-600')}>{row.value}</span>
          </li>
        );
      })}
    </ul>
  );
};

/** Eyebrow + título de seção (landing: Bold 14 caixa-alta primary + 36/40 tracking −1.8px). */
export const SectionHeading = ({ eyebrow, title, titleId, description, action, className }: { eyebrow?: string; title: string; titleId?: string; description?: string; action?: ReactNode; className?: string }) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="flex flex-col gap-2">
      {eyebrow ? <p className="text-sm font-bold uppercase leading-5 tracking-label text-primary-600">{eyebrow}</p> : null}
      <h2 id={titleId} className="text-[28px] font-bold leading-9 tracking-[-0.04em] text-ink sm:text-4xl sm:leading-10">{title}</h2>
      {description ? <p className="text-base text-ink-variant">{description}</p> : null}
    </div>
    {action}
  </div>
);

interface ShopCardProps {
  to: string;
  name: string;
  subtitle?: string | null;
  location?: string | null;
  cover: string;
  logo?: string | null;
  badge?: ReactNode;
  actions: ReactNode;
  className?: string;
}

/** Card de barbearia/filial com foto (landing "Barbearias em destaque" e resultados de busca). */
export const ShopCard = ({ to, name, subtitle, location, cover, logo, badge, actions, className }: ShopCardProps) => (
  <article className={cn('flex flex-col overflow-hidden rounded-2xl bg-white shadow-float', className)}>
    <Link to={to} className="relative block h-48 overflow-hidden bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600" tabIndex={-1} aria-hidden="true">
      <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
      {logo ? <img src={logo} alt="" className="absolute bottom-3 left-3 h-12 w-12 rounded-xl border-2 border-white bg-white object-cover shadow-card" /> : null}
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-xl font-semibold leading-7 tracking-[-0.025em] text-ink">
          <Link to={to} className="hover:text-primary-600 focus-visible:underline focus-visible:outline-none">
            {name}
          </Link>
        </h3>
        {badge}
      </div>
      {subtitle ? <p className="-mt-1 text-sm text-ink-variant">{subtitle}</p> : null}
      {location ? (
        <p className="flex items-center gap-2 text-sm leading-5 text-ink-subtle">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>
      ) : null}
      <div className="mt-auto flex gap-2 pt-4">{actions}</div>
    </div>
  </article>
);

export const ShopCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-float" aria-hidden="true">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="space-y-3 p-6">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-4 h-12 w-full" />
    </div>
  </div>
);

const contactClass =
  'inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container px-4 text-sm font-semibold text-primary-600 transition hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600';

interface ContactLinksProps {
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  address?: Address | null;
  share?: boolean;
  className?: string;
}

/** Botões de contato reais: WhatsApp, telefone, Instagram, rota no mapa e compartilhar. */
export const ContactLinks = ({ name, phone, whatsapp, instagram, address, share, className }: ContactLinksProps) => {
  const toast = useToast();
  const wa = whatsappLink(whatsapp || phone, `Olá, ${name}!`);
  const maps = mapsLink(address);
  const onShare = async () => {
    const url = window.location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado!');
      }
    } catch {
      // compartilhamento cancelado pelo usuário
    }
  };
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {wa ? (
        <a href={wa} target="_blank" rel="noreferrer" className={contactClass}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className={contactClass} aria-label={`Ligar para ${formatPhone(phone)}`}>
          <Phone className="h-4 w-4" aria-hidden="true" /> {formatPhone(phone)}
        </a>
      ) : null}
      {instagram ? (
        <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className={contactClass}>
          <AtSign className="h-4 w-4" aria-hidden="true" /> Instagram
        </a>
      ) : null}
      {maps ? (
        <a href={maps} target="_blank" rel="noreferrer" className={contactClass}>
          <Navigation className="h-4 w-4" aria-hidden="true" /> Como chegar
        </a>
      ) : null}
      {share ? (
        <button type="button" onClick={onShare} className={contactClass}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Compartilhar
        </button>
      ) : null}
    </div>
  );
};
