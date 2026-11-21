// Figma 1:3360 "Base de Clientes" (e lista do atendimento): busca por nome/telefone/e-mail, ordenação e
// indicadores de CRM (visitas, faltas, última visita, total gasto — só nos planos com clients_crm).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Lock, Search, UserPlus, UsersRound } from 'lucide-react';

import { Alert, Avatar, Badge, ButtonLink, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination, Select } from '@/components/ui';
import { formatDay } from '@/utils/date';
import { formatBRL, formatPhone } from '@/utils/format';

import { useOwnerOpsClientsQuery, type ClientListParams } from './api';

type Sort = NonNullable<ClientListParams['sortBy']>;

export const ClientsScreen = ({
  barbershopId,
  title,
  newClientPath,
  newAppointmentPath,
  detailPath,
  onNewClient,
}: {
  barbershopId: number;
  title: string;
  newClientPath?: string;
  newAppointmentPath: string;
  detailPath?: (id: number) => string;
  onNewClient?: () => void;
}) => {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<Sort>('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const term = input.trim();
      setSearch(term.length >= 3 || term.length === 0 ? term : '');
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [input]);

  const { data, isLoading, isFetching, error, refetch } = useOwnerOpsClientsQuery({ barbershopId, search: search || undefined, sortBy, page, pageSize: 20 });
  const crm = data?.crm !== false;
  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title={title}
        description="Histórico e contatos de quem é atendido na sua barbearia."
        action={
          newClientPath ? (
            <ButtonLink to={newClientPath} icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}>
              Novo Cliente
            </ButtonLink>
          ) : onNewClient ? (
            <button type="button" onClick={onNewClient} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Novo Cliente
            </button>
          ) : null
        }
      />

      {!crm ? (
        <Alert tone="info" className="mb-6" title="Histórico de clientes no plano Profissional" action={detailPath ? <ButtonLink to="/dashboard/assinatura" size="sm" variant="secondary">Ver planos</ButtonLink> : undefined}>
          No seu plano a lista serve para encontrar e agendar clientes. Visitas, faltas e total gasto aparecem nos planos Profissional e Rede.
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar cliente</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nome, telefone ou e-mail (mín. 3 caracteres)"
            className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </label>
        {crm ? (
          <Select aria-label="Ordenar" containerClassName="sm:w-56" className="bg-white shadow-card" value={sortBy} onChange={(e) => setSortBy(e.target.value as Sort)}>
            <option value="name">Nome (A–Z)</option>
            <option value="last_visit">Última visita</option>
            <option value="visits">Mais visitas</option>
            <option value="total_spent">Maior gasto</option>
            <option value="created_at">Mais recentes</option>
          </Select>
        ) : null}
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-8 w-8" aria-hidden="true" />}
          title={search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          description={search ? 'Confira a grafia ou cadastre um novo cliente.' : 'Os clientes aparecem aqui ao agendar online ou quando você cadastra no balcão.'}
        />
      ) : (
        <div className={isFetching ? 'opacity-70 transition' : 'transition'}>
          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-card lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-low text-xs font-semibold uppercase tracking-label text-ink-variant">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Contato</th>
                  {crm ? (
                    <>
                      <th className="px-6 py-3 text-right">Visitas</th>
                      <th className="px-6 py-3">Última visita</th>
                      <th className="px-6 py-3 text-right">Total gasto</th>
                    </>
                  ) : null}
                  <th className="px-6 py-3 text-right">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-low">
                {items.map((client) => (
                  <tr key={client.id} className="hover:bg-surface-low/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.name} size="sm" />
                        <div className="min-w-0">
                          {detailPath && crm ? (
                            <Link to={detailPath(client.id)} className="font-semibold text-ink hover:text-primary-600">
                              {client.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-ink">{client.name}</span>
                          )}
                          <div className="mt-0.5 flex gap-1">
                            {client.has_account ? <Badge tone="blue">Com conta</Badge> : null}
                            {client.blocked ? <Badge tone="red">Bloqueado</Badge> : null}
                            {client.no_shows ? <Badge tone="red">{client.no_shows} falta(s)</Badge> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-variant">
                      <p>{formatPhone(client.phone) || '—'}</p>
                      {client.email ? <p className="text-xs">{client.email}</p> : null}
                    </td>
                    {crm ? (
                      <>
                        <td className="px-6 py-4 text-right font-semibold text-ink">{client.visits ?? 0}</td>
                        <td className="px-6 py-4 text-ink-variant">{client.last_visit ? formatDay(client.last_visit) : '—'}</td>
                        <td className="px-6 py-4 text-right font-semibold text-ink">{formatBRL(client.total_spent)}</td>
                      </>
                    ) : null}
                    <td className="px-6 py-4 text-right">
                      <Link to={`${newAppointmentPath}?cliente=${client.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50">
                        <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Agendar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {items.map((client) => (
              <li key={client.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    {detailPath && crm ? (
                      <Link to={detailPath(client.id)} className="font-semibold text-ink">
                        {client.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-ink">{client.name}</p>
                    )}
                    <p className="text-xs text-ink-variant">{formatPhone(client.phone)}</p>
                  </div>
                  <Link to={`${newAppointmentPath}?cliente=${client.id}`} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label={`Agendar para ${client.name}`}>
                    <CalendarPlus className="h-5 w-5" />
                  </Link>
                </div>
                {crm ? (
                  <p className="mt-2 text-xs text-ink-variant">
                    {client.visits ?? 0} visita(s) · última {client.last_visit ? formatDay(client.last_visit) : '—'} · {formatBRL(client.total_spent)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          {!crm && detailPath ? (
            <p className="mt-3 flex items-center gap-1 text-xs text-ink-subtle">
              <Lock className="h-3 w-3" aria-hidden="true" /> Detalhes e histórico disponíveis no plano Profissional.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};
