// FE-19: página pública da barbearia (/b/:slug) — filiais, serviços, equipe e botão de agendar.
import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, Clock } from 'lucide-react';

import { Avatar, ButtonLink, Card, CardTitle, ErrorState, ListSkeleton } from '@/components/ui';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { AddressLine, OpenNowBadge, OpeningHoursList, ShopHero } from '@/features/public/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatBRL, formatDuration } from '@/utils/format';

const BarbershopPage = () => {
  const { slug = '' } = useParams();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug);
  usePageTitle(shop ? `${shop.name} — agende online` : 'Barbearia', shop?.description ?? undefined);

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-8"><ListSkeleton rows={5} /></div>;
  if (error || !shop) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState error={error} title="Barbearia não encontrada ou indisponível" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-28 sm:pb-6">
      <ShopHero shop={shop} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Serviços</CardTitle>
            <ul className="divide-y divide-slate-100">
              {shop.services.map((service) => (
                <li key={service.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="flex items-center gap-1 text-sm text-muted">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatDuration(service.duration)}
                      {service.description ? ` · ${service.description}` : ''}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-bold text-slate-900">{formatBRL(service.price)}</span>
                </li>
              ))}
            </ul>
          </Card>
          {shop.barbers.length ? (
            <Card>
              <CardTitle>Equipe</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                {shop.barbers.map((barber) => (
                  <div key={barber.id} className="flex items-center gap-3">
                    <Avatar name={barber.display_name} src={barber.photo_url} />
                    <div>
                      <p className="font-semibold text-slate-900">{barber.display_name}</p>
                      <p className="text-sm text-muted">{shop.branches.find((branch) => branch.id === barber.branch_id)?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
        <div className="space-y-4">
          {shop.branches.map((branch) => (
            <Card key={branch.id}>
              <div className="flex items-start justify-between gap-2">
                <Link to={`/b/${shop.slug}/${branch.id}`} className="text-lg font-bold text-slate-900 hover:text-primary-700">
                  {branch.name}
                </Link>
                <OpenNowBadge open={branch.open_now} />
              </div>
              <div className="mt-2">
                <AddressLine address={branch.address} />
              </div>
              <div className="mt-4">
                <OpeningHoursList hours={branch.opening_hours} />
              </div>
              <ButtonLink to={`/b/${shop.slug}/agendar?filial=${branch.id}`} block className="mt-4" icon={<CalendarCheck className="h-4 w-4" />}>
                Agendar nesta filial
              </ButtonLink>
            </Card>
          ))}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 sm:hidden">
        <ButtonLink to={`/b/${shop.slug}/agendar${shop.branches.length === 1 ? `?filial=${shop.branches[0].id}` : ''}`} block size="lg">
          Agendar horário
        </ButtonLink>
      </div>
    </div>
  );
};

export default BarbershopPage;
