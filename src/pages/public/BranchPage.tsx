// FE-20: página pública da filial (/b/:slug/:branchId).
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

import { Avatar, ButtonLink, Card, CardTitle, ErrorState, ListSkeleton } from '@/components/ui';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { AddressLine, OpenNowBadge, OpeningHoursList, mapsLink } from '@/features/public/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatBRL, formatDuration, formatPhone, whatsappLink } from '@/utils/format';

const BranchPage = () => {
  const { slug = '', branchId } = useParams();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug);
  const branch = shop?.branches.find((item) => String(item.id) === branchId);
  usePageTitle(shop && branch ? `${shop.name} — ${branch.name}` : 'Filial');

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-8"><ListSkeleton rows={5} /></div>;
  if (error || !shop || !branch) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState error={error ?? { message: 'Filial não encontrada' }} title="Filial não encontrada" onRetry={refetch} />
      </div>
    );
  }
  const barbers = shop.barbers.filter((barber) => barber.branch_id === branch.id);
  const contact = whatsappLink(branch.whatsapp || branch.phone, `Olá, ${shop.name} — ${branch.name}!`);
  const maps = mapsLink(branch.address);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-28 sm:pb-6">
      <Link to={`/b/${shop.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> {shop.name}
      </Link>
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {shop.name} — {branch.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <OpenNowBadge open={branch.open_now} />
              {branch.phone ? <a href={`tel:${branch.phone}`} className="text-sm font-semibold text-slate-700">{formatPhone(branch.phone)}</a> : null}
            </div>
            <div className="mt-3">
              <AddressLine address={branch.address} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:w-56">
            <ButtonLink to={`/b/${shop.slug}/agendar?filial=${branch.id}`} size="lg" block>
              Agendar horário
            </ButtonLink>
            {contact ? (
              <a href={contact} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Falar no WhatsApp
              </a>
            ) : null}
            {maps ? (
              <a href={maps} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Como chegar
              </a>
            ) : null}
          </div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardTitle>Serviços</CardTitle>
          <ul className="divide-y divide-slate-100">
            {shop.services.map((service) => (
              <li key={service.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatDuration(service.duration)}
                  </p>
                </div>
                <Link to={`/b/${shop.slug}/agendar?filial=${branch.id}&servico=${service.id}`} className="text-right">
                  <span className="block font-bold text-slate-900">{formatBRL(service.price)}</span>
                  <span className="text-xs font-semibold text-primary-700">Agendar</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle>Horário de funcionamento</CardTitle>
            <OpeningHoursList hours={branch.opening_hours} />
          </Card>
          {barbers.length ? (
            <Card>
              <CardTitle>Barbeiros</CardTitle>
              <ul className="space-y-3">
                {barbers.map((barber) => (
                  <li key={barber.id} className="flex items-center gap-3">
                    <Avatar name={barber.display_name} src={barber.photo_url} />
                    <div>
                      <p className="font-semibold text-slate-900">{barber.display_name}</p>
                      {barber.bio ? <p className="text-xs text-muted">{barber.bio}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 sm:hidden">
        <ButtonLink to={`/b/${shop.slug}/agendar?filial=${branch.id}`} block size="lg">
          Agendar horário
        </ButtonLink>
      </div>
    </div>
  );
};

export default BranchPage;
