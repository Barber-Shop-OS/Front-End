// Figma 1:4407 "Barbeiros da Filial" — equipe de uma filial específica, com convites pendentes.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

import { Button, EmptyState, ErrorState, ListSkeleton, PageHeader } from '@/components/ui';
import { useOwnerListBarbersQuery } from '@/features/owner-admin/api';
import { AddBarberModal, BarbersTable, BranchInvitations, useReactivateBarber } from '@/features/owner-admin/barbers';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const BranchBarbersPage = () => {
  const branchId = Number(useParams().branchId);
  const { branches, branchesLoading } = useActiveContext();
  const branch = branches.find((b) => b.id === branchId);
  usePageTitle(branch ? `Barbeiros — ${branch.name}` : 'Barbeiros da filial');
  const { data = [], isLoading, error, refetch } = useOwnerListBarbersQuery([branchId], { skip: !branch });
  const reactivate = useReactivateBarber();
  const [adding, setAdding] = useState(false);

  if (branchesLoading) return <ListSkeleton rows={4} />;
  if (!branch) return <EmptyState title="Filial não encontrada" description="Ela pode ter sido removida ou você não tem acesso." action={<Link to="/dashboard/filiais" className="font-semibold text-primary-600">Voltar às filiais</Link>} />;

  return (
    <div>
      <PageHeader
        back={
          <Link to="/dashboard/filiais" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Filiais
          </Link>
        }
        title={`Barbeiros — ${branch.name}`}
        description="Profissionais que atendem nesta unidade."
        action={
          <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={() => setAdding(true)} disabled={!branch.active}>
            Adicionar barbeiro
          </Button>
        }
      />
      {isLoading ? <ListSkeleton rows={4} /> : error ? <ErrorState error={error} onRetry={refetch} /> : <BarbersTable barbers={data} onReactivate={(b) => void reactivate(b)} />}
      <BranchInvitations branchId={branch.id} />
      <AddBarberModal open={adding} onClose={() => setAdding(false)} branches={branches} defaultBranchId={branch.id} />
    </div>
  );
};

export default BranchBarbersPage;
