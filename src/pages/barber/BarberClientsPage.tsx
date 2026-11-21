// Figma 1:5175 "Clientes do Barbeiro": clientes atendidos pelo barbeiro (GET /dashboard/barber/clients) com
// busca, ordenação, selo "Frequente", última visita e total gasto; atalho de WhatsApp.
import { useEffect, useState } from 'react';
import { MessageCircle, Search, Star, UsersRound } from 'lucide-react';

import { Badge, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination, Select } from '@/components/ui';
import { useListBarberOwnClientsQuery } from '@/features/barber/api';
import { BarberProfileSelect, Initials } from '@/features/barber/components';
import { isFrequentClient } from '@/features/barber/helpers';
import type { BarberClientFilters } from '@/features/barber/types';
import { useBarberProfile } from '@/features/barber/useBarberProfile';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatDate } from '@/utils/date';
import { formatBRL, formatPhone, whatsappLink } from '@/utils/format';

type Sort = NonNullable<BarberClientFilters['sortBy']>;

const BarberClientsPage = () => {
  usePageTitle('Meus clientes');
  const ctx = useBarberProfile();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<Sort>('last_visit');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const h = window.setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(h);
  }, [input]);
  const { data, isLoading, isFetching, error, refetch } = useListBarberOwnClientsQuery({ search: search || undefined, sortBy, page, pageSize: 20 });
  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader title="Meus clientes" description={`${data?.total ?? 0} clientes atendidos por você`} action={<BarberProfileSelect ctx={ctx} />} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar cliente</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Buscar por nome ou telefone" className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </label>
        <Select aria-label="Ordenar" containerClassName="sm:w-52" className="bg-white shadow-card" value={sortBy} onChange={(e) => setSortBy(e.target.value as Sort)}>
          <option value="last_visit">Última visita</option>
          <option value="visits">Mais visitas</option>
          <option value="total_spent">Maior gasto</option>
          <option value="name">Nome (A–Z)</option>
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon={<UsersRound className="h-8 w-8" aria-hidden="true" />} title={search ? 'Nenhum cliente encontrado' : 'Você ainda não atendeu clientes'} />
      ) : (
        <div className={isFetching ? 'opacity-70' : ''}>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((c, index) => {
              const name = c.name || 'Cliente';
              const wa = whatsappLink(c.phone, `Olá, ${name.split(' ')[0]}!`);
              return (
                <li key={`${c.client_id ?? 'u'}-${c.user_id ?? index}`} className="flex flex-col rounded-xl bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <Initials name={name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{name}</p>
                      <p className="text-xs text-ink-variant">{formatPhone(c.phone) || 'Sem telefone'}</p>
                    </div>
                    {isFrequentClient(c.visits) ? (
                      <Badge tone="orange" className="gap-1">
                        <Star className="h-3 w-3" aria-hidden="true" /> Frequente
                      </Badge>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-surface-low p-3 text-center">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-label text-ink-variant">Visitas</dt>
                      <dd className="font-black text-ink">{c.visits}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-label text-ink-variant">Última</dt>
                      <dd className="text-sm font-bold text-ink">{c.last_visit ? formatDate(c.last_visit) : '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-label text-ink-variant">Gasto</dt>
                      <dd className="text-sm font-bold text-ink">{formatBRL(c.total_spent)}</dd>
                    </div>
                  </dl>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-success-700 hover:bg-success-50">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chamar no WhatsApp
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default BarberClientsPage;
