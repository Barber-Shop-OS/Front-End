// FE-18: busca de barbearias/filiais (texto, cidade e "perto de mim").
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LocateFixed, MapPin, Search, Store } from 'lucide-react';

import { Avatar, Button, Card, EmptyState, ErrorState, Input, ListSkeleton, Pagination, useToast } from '@/components/ui';
import { useSearchBranchesQuery } from '@/features/public/api';
import { usePageTitle } from '@/hooks/usePageTitle';

const SearchPage = () => {
  usePageTitle('Encontre uma barbearia', 'Busque barbearias perto de você e agende online no BarberOS.');
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const q = params.get('q') ?? '';
  const city = params.get('city') ?? '';
  const lat = params.get('lat') ? Number(params.get('lat')) : undefined;
  const lng = params.get('lng') ? Number(params.get('lng')) : undefined;
  const page = Number(params.get('page') || 1);
  const [draft, setDraft] = useState({ q, city });
  const { data, isLoading, isFetching, error, refetch } = useSearchBranchesQuery({ q: q || undefined, city: city || undefined, lat, lng, page, pageSize: 12 });

  const update = (next: Record<string, string | undefined>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => (value ? merged.set(key, value) : merged.delete(key)));
    if (!('page' in next)) merged.delete('page');
    setParams(merged);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    update({ q: draft.q.trim() || undefined, city: draft.city.trim() || undefined });
  };

  const nearMe = () => {
    if (!navigator.geolocation) return toast.error('Seu navegador não permite localização.');
    navigator.geolocation.getCurrentPosition(
      (position) => update({ lat: position.coords.latitude.toFixed(5), lng: position.coords.longitude.toFixed(5) }),
      () => toast.error('Não foi possível obter sua localização.')
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Encontre uma barbearia</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-[1fr_220px_auto_auto]">
        <Input aria-label="Nome da barbearia ou serviço" placeholder="Barbearia, filial ou serviço" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
        <Input aria-label="Cidade" placeholder="Cidade" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
        <Button type="submit" icon={<Search className="h-4 w-4" />}>
          Buscar
        </Button>
        <Button variant="outline" onClick={nearMe} icon={<LocateFixed className="h-4 w-4" />}>
          Perto de mim
        </Button>
      </form>
      {lat !== undefined ? (
        <p className="mt-3 text-sm text-muted">
          Ordenado pela distância da sua localização.{' '}
          <button type="button" className="font-semibold text-primary-700 underline" onClick={() => update({ lat: undefined, lng: undefined })}>
            Limpar
          </button>
        </p>
      ) : null}

      <div className="mt-8">
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState icon={<Store className="h-10 w-10" />} title="Nenhuma barbearia encontrada" description="Tente outro nome, outra cidade ou limpe os filtros." />
        ) : (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.items.map((branch) => (
                <Link key={branch.id} to={`/b/${branch.barbershop.slug}/${branch.id}`} className="group">
                  <Card className="h-full transition group-hover:border-primary-300 group-hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={branch.barbershop.name} src={branch.barbershop.logo_url} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">{branch.barbershop.name}</p>
                        <p className="truncate text-sm text-muted">{branch.name}</p>
                      </div>
                    </div>
                    {branch.address ? (
                      <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                          {[branch.address.street, branch.address.number].filter(Boolean).join(', ')}
                          {branch.address.neighborhood ? ` — ${branch.address.neighborhood}` : ''}, {branch.address.city}/{branch.address.state}
                        </span>
                      </p>
                    ) : null}
                    {typeof branch.distance_km === 'number' ? <p className="mt-2 text-xs font-semibold text-primary-700">{branch.distance_km.toFixed(1)} km de você</p> : null}
                    <span className="mt-4 inline-block text-sm font-semibold text-primary-700">Ver horários →</span>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => update({ page: String(next) })} />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
