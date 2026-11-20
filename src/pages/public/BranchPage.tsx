// Figma 1:949 "Página da Filial" (/b/:slug/:branchId): foto com nome e endereço, cartão de horários + contato,
// serviços em cards, barbeiros da unidade ("Artesãos") e CTA fixo "Agendar Agora" com ?branch=<id>.
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronRight, Clock, MapPin, Scissors } from 'lucide-react';

import branchHero from '@/assets/figma/public/branch-hero.png';
import { ButtonLink, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useGetPublicBarbershopQuery } from '@/features/public/api';
import { ContactLinks, OpenNowBadge, OpeningHoursList, addressLine, mapsLink } from '@/features/public/components';
import { bookingPath, initials } from '@/features/public/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatBRL, formatDuration, formatPhone } from '@/utils/format';

const PageSkeleton = () => (
  <div className="mx-auto w-full max-w-[1280px] space-y-12 px-4 py-8 sm:px-8" role="status" aria-label="Carregando filial">
    <div className="grid gap-8 lg:grid-cols-12">
      <Skeleton className="h-72 w-full lg:col-span-8 lg:h-[450px]" />
      <Skeleton className="h-72 w-full lg:col-span-4" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((key) => (
        <Skeleton key={key} className="h-44 w-full" />
      ))}
    </div>
  </div>
);

const BranchPage = () => {
  const { slug = '', branchId } = useParams();
  const { data: shop, isLoading, error, refetch } = useGetPublicBarbershopQuery(slug, { skip: !slug });
  const branch = shop?.branches.find((item) => String(item.id) === branchId);
  usePageTitle(shop && branch ? `${shop.name} — ${branch.name}` : 'Filial', shop && branch ? `Agende online na ${shop.name} — ${branch.name}. ${addressLine(branch.address)}` : undefined);

  if (isLoading) return <PageSkeleton />;
  if (error || !shop || !branch) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16">
        {error ? (
          <ErrorState error={error} title="Não foi possível carregar a filial" onRetry={refetch} />
        ) : (
          <EmptyState
            title="Filial não encontrada"
            description="Ela pode ter sido desativada ou o link está incorreto."
            action={shop ? <ButtonLink to={`/b/${shop.slug}`}>Ver {shop.name}</ButtonLink> : <ButtonLink to="/filiais">Buscar barbearias</ButtonLink>}
          />
        )}
      </div>
    );
  }

  const barbers = shop.barbers.filter((barber) => barber.branch_id === branch.id);
  const phone = branch.phone || shop.phone;
  const maps = mapsLink(branch.address);
  const booking = bookingPath(shop.slug, { branchId: branch.id });

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-36 pt-6 sm:gap-12 sm:px-8 sm:pt-8">
      <Link to={`/b/${shop.slug}`} className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-semibold text-primary-600 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {shop.name}
      </Link>

      {/* Hero + horários */}
      <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="relative flex h-80 flex-col justify-end overflow-hidden rounded-xl bg-ink sm:h-[450px] lg:col-span-8">
          <img src={shop.cover_url || branchHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/0" aria-hidden="true" />
          <div className="relative flex flex-col p-6 sm:p-8">
            <p className="pb-2 text-xs uppercase leading-4 tracking-label text-primary-100">{shop.name}</p>
            <h1 className="pb-4 text-4xl font-bold leading-[44px] tracking-[-0.025em] text-surface sm:text-6xl sm:leading-[60px]">{branch.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface/80">
              {branch.address ? (
                <a href={maps ?? undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-surface hover:underline">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {addressLine(branch.address)}
                </a>
              ) : null}
              <OpenNowBadge open={branch.open_now} />
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-xl bg-surface-low p-6 sm:p-8 lg:col-span-4" aria-labelledby="hours-title">
          <div className="flex flex-col gap-6">
            <h2 id="hours-title" className="text-2xl font-semibold leading-8 tracking-[-0.05em] text-ink">
              Horário de Precisão
            </h2>
            {branch.opening_hours.length ? <OpeningHoursList hours={branch.opening_hours} /> : <p className="text-sm text-ink-variant">Horários ainda não informados.</p>}
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant/20 pt-8">
            <p className="text-xs uppercase leading-4 tracking-label text-ink-variant">Contato direto</p>
            {phone ? (
              <a href={`tel:${phone}`} className="text-lg leading-7 text-ink hover:text-primary-600">
                {formatPhone(phone)}
              </a>
            ) : null}
            <ContactLinks name={`${shop.name} — ${branch.name}`} whatsapp={branch.whatsapp || shop.whatsapp} phone={null} instagram={shop.instagram} address={branch.address} share />
          </div>
        </aside>
      </section>

      {/* Serviços + barbeiros */}
      <div className="grid gap-12 lg:grid-cols-3">
        <section className="flex flex-col gap-8 lg:col-span-2" aria-labelledby="services-title">
          <div className="flex items-center gap-3">
            <h2 id="services-title" className="text-[30px] font-bold leading-9 tracking-[-0.05em] text-ink">
              Serviços
            </h2>
            <div className="h-0.5 flex-1 bg-surface-highest" aria-hidden="true" />
          </div>
          {shop.services.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {shop.services.map((service) => (
                <li key={service.id}>
                  <Link
                    to={bookingPath(shop.slug, { branchId: branch.id, serviceId: service.id })}
                    className="flex h-full flex-col gap-1 rounded-xl bg-white p-6 shadow-card transition hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                    aria-label={`Agendar ${service.name}, ${formatDuration(service.duration)}, ${formatBRL(service.price)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Scissors className="h-6 w-6 text-primary-600" aria-hidden="true" />
                      <span className="text-xl font-bold leading-7 text-primary-600">{formatBRL(service.price)}</span>
                    </div>
                    <h3 className="pt-3 text-lg font-medium leading-7 text-ink">{service.name}</h3>
                    {service.description ? <p className="text-sm leading-[22.75px] text-ink-variant">{service.description}</p> : null}
                    <p className="mt-auto flex items-center gap-2 pt-3 text-[10px] font-semibold uppercase leading-[15px] tracking-[0.05em] text-ink-subtle">
                      <Clock className="h-2.5 w-2.5" aria-hidden="true" /> {formatDuration(service.duration)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nenhum serviço publicado ainda" description="Fale com a unidade pelos contatos acima." />
          )}
        </section>

        <section className="flex flex-col gap-8" aria-labelledby="barbers-title">
          <h2 id="barbers-title" className="text-[30px] leading-9 tracking-[-0.05em] text-ink">
            Artesãos
          </h2>
          {barbers.length ? (
            <ul className="flex flex-col gap-4">
              {barbers.map((barber) => (
                <li key={barber.id}>
                  <Link
                    to={bookingPath(shop.slug, { branchId: branch.id, barberId: barber.id })}
                    className="flex items-center gap-4 rounded-xl bg-surface-high p-4 transition hover:bg-surface-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                    aria-label={`Agendar com ${barber.display_name ?? 'este barbeiro'}`}
                  >
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover grayscale" />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-highest text-lg font-bold text-primary-600" aria-hidden="true">
                        {initials(barber.display_name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-base leading-6 text-ink">{barber.display_name}</p>
                      {barber.bio ? <p className="line-clamp-2 text-xs leading-4 text-ink-variant">{barber.bio}</p> : null}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-variant" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-surface-low p-6 text-sm text-ink-variant">A equipe desta unidade será exibida em breve.</p>
          )}
          <blockquote className="rounded-xl border border-primary-600/10 bg-primary-600/5 p-6 text-center text-sm italic text-ink-variant">
            “A precisão não é um ato, é um hábito na BarberOS.”
          </blockquote>
        </section>
      </div>

      {/* CTA fixo (desktop e mobile, como no Figma) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center p-4 sm:p-8">
        <ButtonLink
          to={booking}
          size="lg"
          className="pointer-events-auto h-14 w-full rounded-xl px-12 text-lg shadow-primary sm:h-[68px] sm:w-auto"
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
        >
          Agendar Agora
        </ButtonLink>
      </div>
    </div>
  );
};

export default BranchPage;
