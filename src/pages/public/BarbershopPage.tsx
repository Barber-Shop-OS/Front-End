// Figma 1:521 "Página da Barbearia" (/b/:slug): hero com nome/descrição/CTA e capa, "Nossas Filiais",
// "Serviços" e "Nossos Especialistas", com contatos reais. Dados de GET /barbershop/slug/{slug}.
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Banknote, CalendarCheck, Clock, Plus, Store } from 'lucide-react';

import shopInterior from '@/assets/figma/public/shop-interior.png';
import { Avatar, ButtonLink, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { ContactLinks, OpenNowBadge, mapsLink } from '@/features/public/components';
import { addressLines, bookingPath, initials } from '@/features/public/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils/cn';
import { formatBRL, formatDuration } from '@/utils/format';

const sectionTitle = 'text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink sm:text-[30px]';

const PageSkeleton = () => (
  <div className="mx-auto w-full max-w-[1280px] space-y-12 px-4 py-12 sm:px-6" role="status" aria-label="Carregando barbearia">
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-14 w-48" />
      </div>
      <Skeleton className="h-64 w-full lg:h-96" />
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-52 w-full" />
      ))}
    </div>
  </div>
);

const BarbershopPage = () => {
  const { slug = '' } = useParams();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug, { skip: !slug });
  usePageTitle(shop ? `${shop.name} — agende online` : 'Barbearia', shop?.description ?? undefined);

  if (isLoading) return <PageSkeleton />;
  if (error || !shop) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState error={error} title="Barbearia não encontrada ou indisponível" onRetry={refetch} />
      </div>
    );
  }

  const singleBranch = shop.branches.length === 1 ? shop.branches[0] : null;
  const mainBooking = bookingPath(shop.slug, { branchId: singleBranch?.id });
  const branchName = (id: number) => shop.branches.find((branch) => branch.id === id)?.name;
  const contactBranch = singleBranch ?? shop.branches[0];

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-4 pb-28 pt-8 sm:px-6 sm:gap-24 sm:py-12">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {shop.logo_url ? <Avatar name={shop.name} src={shop.logo_url} size="lg" /> : null}
            {singleBranch ? <OpenNowBadge open={singleBranch.open_now} /> : null}
          </div>
          <h1 className="text-[40px] font-bold leading-[44px] tracking-[-0.05em] text-ink sm:text-6xl sm:leading-[60px]">{shop.name}</h1>
          <p className="max-w-md whitespace-pre-line text-lg leading-7 text-ink-variant">
            {shop.description || 'Agende seu horário online em poucos cliques, com a agenda em tempo real da barbearia.'}
          </p>
          <div className="flex flex-col gap-4 pt-2">
            <ButtonLink to={mainBooking} size="lg" className="h-14 self-start px-8 shadow-primary">
              Agendar Agora <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ContactLinks
              name={shop.name}
              phone={shop.phone || contactBranch?.phone}
              whatsapp={shop.whatsapp || contactBranch?.whatsapp}
              instagram={shop.instagram}
              share
            />
          </div>
        </div>
        <div className="relative h-64 overflow-hidden rounded-lg bg-surface-high shadow-elevated sm:h-96">
          <img src={shop.cover_url || shopInterior} alt={`Ambiente da ${shop.name}`} className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/60 via-transparent to-transparent" aria-hidden="true" />
        </div>
      </section>

      {/* Filiais */}
      <section className="flex flex-col gap-8 sm:gap-10" aria-labelledby="branches-title">
        <div className="flex flex-col gap-2">
          <h2 id="branches-title" className={sectionTitle}>
            Nossas Filiais
          </h2>
          <p className="text-base text-ink-variant">Encontre a unidade mais próxima de você.</p>
        </div>
        {shop.branches.length ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shop.branches.map((branch, index) => {
              const lines = addressLines(branch.address);
              const maps = mapsLink(branch.address);
              return (
                <li key={branch.id} className={cn('flex flex-col gap-2 rounded-lg p-6 sm:p-8', index === 0 ? 'bg-white shadow-card' : 'bg-surface-low')}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-primary-600', index === 0 ? 'bg-surface-container' : 'bg-surface-highest')}>
                      <Store className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <OpenNowBadge open={branch.open_now} />
                  </div>
                  <h3 className="pt-4 text-xl font-semibold leading-7 text-ink">
                    <Link to={`/b/${shop.slug}/${branch.id}`} className="hover:text-primary-600">
                      {branch.name}
                    </Link>
                  </h3>
                  {lines ? (
                    <p className="text-sm leading-[22.75px] text-ink-variant">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm font-semibold text-primary-600">
                    <Link to={`/b/${shop.slug}/${branch.id}`} className="inline-flex min-h-10 items-center gap-1 hover:underline">
                      Ver filial <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    {maps ? (
                      <a href={maps} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 hover:underline">
                        Ver no mapa <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                    <Link to={bookingPath(shop.slug, { branchId: branch.id })} className="inline-flex min-h-10 items-center gap-1 hover:underline">
                      <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Agendar aqui
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="Nenhuma filial disponível no momento" />
        )}
      </section>

      {/* Serviços */}
      <section className="flex flex-col gap-8 sm:gap-10" aria-labelledby="services-title">
        <h2 id="services-title" className={sectionTitle}>
          Serviços
        </h2>
        {shop.services.length ? (
          <ul className="grid gap-4 md:grid-cols-2 md:gap-8">
            {shop.services.map((service) => (
              <li key={service.id}>
                <Link
                  to={bookingPath(shop.slug, { branchId: singleBranch?.id, serviceId: service.id })}
                  className="group flex min-h-[104px] items-center justify-between gap-4 rounded-lg bg-white p-6 shadow-card transition hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  aria-label={`Agendar ${service.name}, ${formatDuration(service.duration)}, ${formatBRL(service.price)}`}
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-lg font-semibold leading-7 text-ink">{service.name}</h3>
                    {service.description ? <p className="line-clamp-2 text-sm text-ink-variant">{service.description}</p> : null}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-ink-variant">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {formatDuration(service.duration)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5" aria-hidden="true" /> {formatBRL(service.price)}
                      </span>
                    </div>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white" aria-hidden="true">
                    <Plus className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nenhum serviço publicado ainda" description="Entre em contato com a barbearia para mais informações." />
        )}
      </section>

      {/* Equipe */}
      {shop.barbers.length ? (
        <section className="flex flex-col gap-8 sm:gap-10" aria-labelledby="team-title">
          <h2 id="team-title" className={sectionTitle}>
            Nossos Especialistas
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {shop.barbers.map((barber) => {
              const subtitle = shop.branches.length > 1 ? branchName(barber.branch_id) : barber.services?.[0]?.name;
              return (
                <li key={barber.id} className="flex flex-col items-center gap-1 rounded-lg bg-surface-low p-4 text-center sm:p-6">
                  {barber.photo_url ? (
                    <img src={barber.photo_url} alt={barber.display_name ?? ''} className="h-20 w-20 rounded-xl bg-surface-highest object-cover" />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-surface-highest text-2xl font-bold text-primary-600" aria-hidden="true">
                      {initials(barber.display_name)}
                    </span>
                  )}
                  <p className="pt-3 text-base font-semibold leading-6 text-ink">{barber.display_name}</p>
                  {subtitle ? <p className="text-xs uppercase leading-4 tracking-[0.05em] text-ink-variant">{subtitle}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* CTA fixo no celular */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-low bg-white/95 p-3 backdrop-blur sm:hidden">
        <ButtonLink to={mainBooking} block size="lg" icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}>
          Agendar horário
        </ButtonLink>
      </div>
    </div>
  );
};

export default BarbershopPage;
