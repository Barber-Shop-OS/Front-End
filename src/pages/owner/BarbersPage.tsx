// Figma 1:3748 "Gestão de Barbeiros (Tabela)" — todos os barbeiros da barbearia (ou das filiais do gerente),
// com busca, filtro por filial/status, uso do plano e adicionar/convidar.
import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Plus, Search } from 'lucide-react';

import { Alert, Button, ButtonLink, Card, EmptyState, ErrorState, ListSkeleton, PageHeader, Select } from '@/components/ui';
import { useOwnerListBarbersQuery } from '@/features/owner-admin/api';
import { AddBarberModal, BarbersTable, BranchInvitations, useReactivateBarber } from '@/features/owner-admin/barbers';
import { barberName } from '@/features/owner-admin/utils';
import { useGetSubscriptionQuery } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

type StatusFilter = 'all' | 'active' | 'inactive';

const BarbersPage = () => {
  usePageTitle('Gestão de Barbeiros');
  const { barbershop, branches, isOwner, branchesLoading } = useActiveContext();
  const branchIds = useMemo(() => branches.map((b) => b.id), [branches]);
  const { data = [], isLoading, error, refetch } = useOwnerListBarbersQuery(branchIds.length ? branchIds : skipToken);
  const { data: subscription } = useGetSubscriptionQuery(barbershop && isOwner ? barbershop.id : skipToken);
  const reactivate = useReactivateBarber();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<number | ''>('');
  const [status, setStatus] = useState<StatusFilter>('active');
  const [adding, setAdding] = useState(false);

  const branchName = (id: number) => branches.find((b) => b.id === id)?.name;
  const term = search.trim().toLowerCase();
  const filtered = data.filter(
    (barber) =>
      (!branchFilter || barber.branch_id === branchFilter) &&
      (status === 'all' || (status === 'active' ? barber.active : !barber.active)) &&
      (!term || barberName(barber).toLowerCase().includes(term) || barber.services.some((s) => s.name.toLowerCase().includes(term)))
  );
  const activeCount = data.filter((b) => b.active).length;
  const limit = subscription?.limits?.barbers;
  const atLimit = typeof limit === 'number' && (subscription?.usage.barbers ?? 0) >= limit;

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" description="Crie ou selecione uma barbearia para gerenciar a equipe." />;

  return (
    <div>
      <PageHeader
        title="Gestão de Barbeiros"
        description="Gerencie os profissionais, serviços que realizam e jornadas de trabalho."
        action={
          <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={() => setAdding(true)} disabled={atLimit || branches.length === 0} title={atLimit ? 'Limite de barbeiros do plano atingido' : undefined}>
            Novo Barbeiro
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Barbeiros ativos</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">
            {activeCount}
            {subscription ? <span className="text-base font-semibold text-ink-variant"> / {limit ?? '∞'} no plano</span> : null}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Inativos</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{data.length - activeCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Filiais</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{branches.filter((b) => b.active).length}</p>
        </Card>
      </div>

      {atLimit ? (
        <Alert tone="warning" className="mb-6" title="Limite de barbeiros atingido" action={<ButtonLink to="/dashboard/assinatura" size="sm" variant="secondary">Ver planos</ButtonLink>}>
          Seu plano permite até {limit} barbeiros ativos. Faça upgrade para crescer a equipe.
        </Alert>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
        <label className="relative flex-1">
          <span className="sr-only">Buscar barbeiro</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou serviço…"
            className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </label>
        {branches.length > 1 ? (
          <Select aria-label="Filial" containerClassName="md:w-56" className="bg-white shadow-card" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todas as filiais</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        ) : null}
        <Select aria-label="Status" containerClassName="md:w-44" className="bg-white shadow-card" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </Select>
      </div>

      {isLoading || branchesLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : branches.length === 0 ? (
        <EmptyState title="Cadastre uma filial primeiro" description="Os barbeiros são vinculados a uma filial." action={isOwner ? <ButtonLink to="/dashboard/filiais/nova">Cadastrar filial</ButtonLink> : undefined} />
      ) : (
        <BarbersTable barbers={filtered} branchName={branches.length > 1 ? branchName : undefined} onReactivate={(b) => void reactivate(b)} />
      )}

      {(branchFilter ? branches.filter((b) => b.id === branchFilter) : branches).map((branch) => (
        <BranchInvitations key={branch.id} branchId={branch.id} title={branches.length > 1 ? `Convites pendentes — ${branch.name}` : undefined} />
      ))}

      <AddBarberModal open={adding} onClose={() => setAdding(false)} branches={branches} defaultBranchId={branchFilter || undefined} />
    </div>
  );
};

export default BarbersPage;
