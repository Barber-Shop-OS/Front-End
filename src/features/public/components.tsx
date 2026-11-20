// Peças das páginas públicas: endereço, horário de funcionamento, cabeçalho da barbearia.
import { AtSign, MapPin, MessageCircle, Phone, Share2 } from 'lucide-react';

import { Avatar, Badge, useToast } from '@/components/ui';
import type { Address, OpeningHour, PublicBarbershop } from '@/types/api';
import { WEEKDAYS } from '@/utils/date';
import { formatPhone, whatsappLink } from '@/utils/format';

export const addressLine = (address: Address | null | undefined): string =>
  address
    ? `${[address.street, address.number].filter(Boolean).join(', ')}${address.neighborhood ? ` — ${address.neighborhood}` : ''}, ${address.city}/${address.state}`
    : '';

export const mapsLink = (address: Address | null | undefined): string | null =>
  address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(address))}` : null;

export const AddressLine = ({ address }: { address: Address | null | undefined }) => {
  if (!address) return null;
  const link = mapsLink(address);
  return (
    <a href={link ?? undefined} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm text-slate-600 hover:text-primary-700">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{addressLine(address)}</span>
    </a>
  );
};

export const OpeningHoursList = ({ hours }: { hours: OpeningHour[] }) => {
  const today = new Date().getDay();
  return (
    <ul className="space-y-1 text-sm">
      {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
        const intervals = hours.filter((hour) => hour.weekday === weekday);
        return (
          <li key={weekday} className={`flex justify-between gap-4 ${weekday === today ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
            <span>{WEEKDAYS[weekday]}</span>
            <span>{intervals.length ? intervals.map((item) => `${item.opens_at}–${item.closes_at}`).join(', ') : 'Fechado'}</span>
          </li>
        );
      })}
    </ul>
  );
};

export const OpenNowBadge = ({ open }: { open: boolean }) => <Badge tone={open ? 'green' : 'gray'}>{open ? 'Aberto agora' : 'Fechado agora'}</Badge>;

export const ShopHero = ({ shop }: { shop: PublicBarbershop }) => {
  const toast = useToast();
  const share = async () => {
    const url = window.location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: shop.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado!');
      }
    } catch {
      // compartilhamento cancelado
    }
  };
  const whatsapp = whatsappLink(shop.whatsapp || shop.phone, `Olá, ${shop.name}!`);
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="h-32 bg-gradient-to-r from-primary-700 to-primary-500 sm:h-48" style={shop.cover_url ? { backgroundImage: `url(${shop.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
      <div className="px-4 pb-6 sm:px-8">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="rounded-full border-4 border-white bg-white">
              <Avatar name={shop.name} src={shop.logo_url} size="lg" />
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{shop.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            ) : null}
            {shop.phone ? (
              <a href={`tel:${shop.phone}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Phone className="h-4 w-4" /> {formatPhone(shop.phone)}
              </a>
            ) : null}
            {shop.instagram ? (
              <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <AtSign className="h-4 w-4" /> Instagram
              </a>
            ) : null}
            <button type="button" onClick={share} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
          </div>
        </div>
        {shop.description ? <p className="mt-4 max-w-3xl text-slate-600">{shop.description}</p> : null}
      </div>
    </div>
  );
};
