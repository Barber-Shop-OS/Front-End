// Figma 1:714 "Resultados de Busca" (/filiais): busca por texto, filtros suportados pela API (cidade, serviço,
// "perto de mim" com lat/lng), contagem, grade de cards e paginação. Estado da busca fica na URL.
// O mapa (Leaflet) é tarefa futura: o bloco "Encontre no mapa" do Figma vira o atalho de geolocalização.
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocateFixed, Navigation, Search, SlidersHorizontal, Store, X } from 'lucide-react';

import mapIllustration from '@/assets/figma/public/map-illustration.png';
import { Badge, Button, ButtonLink, EmptyState, ErrorState, Input, Pagination, useToast } from '@/components/ui';
import { useSearchBranchesQuery } from '@/features/public/api';
import { ShopCard, ShopCardSkeleton, mapsLink } from '@/features/public/components';
import { fallbackCover, formatDistance } from '@/features/public/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 12;
const SERVICE_CHIPS = ['Corte', 'Barba', 'Sobrancelha'];
const NEAR_KM = 2;

const chipClass = (active: boolean) =>
  cn(
    'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
    active ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-surface-high text-secondary-on hover:bg-surface-highest'
  );

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const q = params.get('q') ?? '';
  const city = params.get('city') ?? '';
  const service = params.get('service') ?? '';
  const latParam = params.get('lat');
  const lngParam = params.get('lng');
  const lat = latParam !== null && latParam !== '' && Number.isFinite(Number(latParam)) ? Number(latParam) : undefined;
  const lng = lngParam !== null && lngParam !== '' && Number.isFinite(Number(lngParam)) ? Number(lngParam) : undefined;
  const located = lat !== undefined && lng !== undefined;
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [term, setTerm] = useState(q);
  const [cityDraft, setCityDraft] = useState(city);
  const [filtersOpen, setFiltersOpen] = useState(Boolean(city));
  const [locating, setLocating] = useState(false);

  useEffect(() => setTerm(q), [q]);
  useEffect(() => setCityDraft(city), [city]);

  const heading = city || q || (located ? 'Perto de você' : 'Barbearias');
  usePageTitle(q || city ? `Barbearias: ${q || city}` : 'Encontre uma barbearia', 'Busque barbearias perto de você e agende online no BarberOS.');

  const { data, isLoading, isFetching, error, refetch } = useSearchBranchesQuery({
    q: q || undefined,
    city: city || undefined,
    service: service || undefined,
    lat: located ? lat : undefined,
    lng: located ? lng : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const update = (next: Record<string, string | undefined>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => (value ? merged.set(key, value) : merged.delete(key)));
    if (!('page' in next)) merged.delete('page');
    setParams(merged);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    update({ q: term.trim() || undefined, city: cityDraft.trim() || undefined });
  };

  const nearMe = () => {
    if (located) return update({ lat: undefined, lng: undefined });
    if (!navigator.geolocation) return toast.error('Seu navegador não permite localização.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        update({ lat: position.coords.latitude.toFixed(5), lng: position.coords.longitude.toFixed(5) });
      },
      () => {
        setLocating(false);
        toast.error('Não foi possível obter sua localização. Verifique a permissão do navegador.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const hasFilters = Boolean(q || city || service || located);
  const clearAll = () => setParams(new URLSearchParams());
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pb-32">
      {/* Busca e filtros */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <form onSubmit={onSubmit} role="search" className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar barbearias</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
              <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={city ? `Buscar barbearias em ${city}...` : 'Buscar barbearia, filial ou serviço...'}
                maxLength={100}
                className="h-14 w-full rounded-lg bg-surface-low pl-12 pr-4 text-base text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </label>
            <Button type="submit" size="lg" className="h-14 px-4 sm:px-6" aria-label="Buscar">
              <Search className="h-5 w-5 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
          </div>
          {filtersOpen ? (
            <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-card sm:flex-row sm:items-end">
              <Input
                label="Cidade"
                placeholder="Ex.: São Paulo"
                value={cityDraft}
                onChange={(event) => setCityDraft(event.target.value)}
                maxLength={100}
                containerClassName="flex-1"
              />
              <Button type="submit" variant="secondary" size="lg">
                Aplicar
              </Button>
            </div>
          ) : null}
        </form>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtros">
          <button type="button" className={chipClass(true)} onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtros
          </button>
          <button type="button" className={chipClass(located)} onClick={nearMe} aria-pressed={located} disabled={locating}>
            <LocateFixed className={cn('h-4 w-4', locating && 'animate-pulse')} aria-hidden="true" />
            {locating ? 'Localizando…' : 'Perto de mim'}
          </button>
          {SERVICE_CHIPS.map((chip) => {
            const active = service.toLowerCase() === chip.toLowerCase();
            return (
              <button key={chip} type="button" className={chipClass(active)} aria-pressed={active} onClick={() => update({ service: active ? undefined : chip })}>
                {chip}
              </button>
            );
          })}
          {hasFilters ? (
            <button type="button" className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-ink-variant hover:bg-surface-low" onClick={clearAll}>
              <X className="h-4 w-4" aria-hidden="true" /> Limpar
            </button>
          ) : null}
        </div>
      </div>

      {/* Cabeçalho dos resultados */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-[30px] font-bold leading-9 tracking-[-0.02em] text-ink">{heading}</h1>
          <p className="text-sm uppercase leading-5 tracking-[0.05em] text-ink-subtle" aria-live="polite">
            {isLoading ? 'Buscando…' : error ? '' : `${total} ${total === 1 ? 'unidade encontrada' : 'unidades encontradas'}`}
            {located && !isLoading ? ' · por distância' : ''}
          </p>
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando resultados">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShopCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} title="Não foi possível buscar as barbearias" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={<Store className="h-10 w-10" />}
          title="Nenhuma barbearia encontrada"
          description="Tente outro nome, outra cidade ou remova os filtros."
          action={hasFilters ? <Button variant="secondary" onClick={clearAll}>Limpar filtros</Button> : undefined}
        />
      ) : (
        <>
          <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', isFetching && 'opacity-60 transition-opacity')} aria-busy={isFetching}>
            {data.items.map((branch) => {
              const distance = formatDistance(branch.distance_km);
              const place = [branch.address?.neighborhood || branch.address?.city, distance].filter(Boolean).join(' • ');
              const directions = mapsLink(branch.address);
              const showBranchName = branch.name && branch.name !== branch.barbershop.name;
              return (
                <ShopCard
                  key={branch.id}
                  to={`/b/${branch.barbershop.slug}/${branch.id}`}
                  name={branch.barbershop.name}
                  subtitle={showBranchName ? branch.name : null}
                  location={place}
                  cover={fallbackCover(branch.id)}
                  logo={branch.barbershop.logo_url}
                  badge={typeof branch.distance_km === 'number' && branch.distance_km <= NEAR_KM ? <Badge tone="blue" className="rounded uppercase">Próximo</Badge> : null}
                  actions={
                    <>
                      <ButtonLink to={`/b/${branch.barbershop.slug}/${branch.id}`} size="lg" className="flex-1">
                        Ver serviços
                      </ButtonLink>
                      {directions ? (
                        <a
                          href={directions}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-low text-primary-600 transition hover:bg-surface-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                          aria-label={`Como chegar em ${branch.barbershop.name} — ${branch.name}`}
                          title="Como chegar"
                        >
                          <Navigation className="h-5 w-5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </>
                  }
                />
              );
            })}
            {!located && data.page === 1 ? (
              <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-primary-500 p-6 sm:col-span-2 sm:flex-row sm:items-center sm:p-8">
                <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-xl bg-surface-container opacity-20 blur-[20px]" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-xl bg-primary-600 opacity-50 blur-[32px]" aria-hidden="true" />
                <div className="relative flex flex-col gap-4 sm:max-w-sm">
                  <h2 className="text-[30px] font-bold leading-[37.5px] text-surface-container">Encontre perto de você</h2>
                  <p className="text-base text-primary-200">Explore as barbearias mais próximas da sua localização atual.</p>
                  <button type="button" onClick={nearMe} disabled={locating} className={cn('self-start', 'inline-flex h-12 items-center rounded-lg bg-white px-8 text-xs font-bold uppercase tracking-label text-primary-600 shadow-elevated hover:bg-surface-low disabled:opacity-60')}>
                    {locating ? 'Localizando…' : 'Usar minha localização'}
                  </button>
                </div>
                <div className="relative hidden flex-1 overflow-hidden rounded-lg border-4 border-white/10 p-1 shadow-elevated sm:block">
                  <img src={mapIllustration} alt="" className="h-56 w-full rounded object-cover" />
                </div>
              </div>
            ) : null}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => update({ page: String(next) })} />
        </>
      )}
    </div>
  );
};

export default SearchPage;
