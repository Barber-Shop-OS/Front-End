// Figma 1:2858 "Gestão de Filiais" — lista de filiais em cartões com status, endereço, contato e ações
// (editar, barbeiros, ativar/desativar). Uso do plano (filiais/limite) no topo para o dono.
import { useState } from 'react';
import { MapPin, Pencil, Phone, Plus, Power, Store, Users } from 'lucide-react';

import { Alert, Badge, Button, ButtonLink, Card, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, useToast } from '@/components/ui';
import { useGetSubscriptionQuery, useListBranchesQuery, useUpdateBranchMutation } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Branch } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { formatPhone } from '@/utils/format';
import { skipToken } from '@reduxjs/toolkit/query';

const addressLine = (branch: Branch): string | null => {
  const a = branch.Address;
  if (!a) return null;
  const street = [a.street, a.number].filter(Boolean).join(', ');
  return [street, a.neighborhood, `${a.city}/${a.state}`].filter(Boolean).join(' · ');
};

const BranchesPage = () => {
  usePageTitle('Gestão de Filiais');
  const toast = useToast();
  const { barbershop, isOwner } = useActiveContext();
  const { data, isLoading, error, refetch } = useListBranchesQuery(barbershop ? { barbershop_id: barbershop.id, include_inactive: true } : skipToken);
  const { data: subscription } = useGetSubscriptionQuery(barbershop && isOwner ? barbershop.id : skipToken);
  const [updateBranch, { isLoading: toggling }] = useUpdateBranchMutation();
  const [toToggle, setToToggle] = useState<Branch | null>(null);

  const scope = barbershop?.branch_ids;
  const branches = (data?.items ?? []).filter((branch) => !scope || scope.includes(branch.id));
  const limit = subscription?.limits?.branches;
  const atLimit = typeof limit === 'number' && (subscription?.usage.branches ?? 0) >= limit;

  const confirmToggle = async () => {
    if (!toToggle) return;
    try {
      await updateBranch({ id: toToggle.id, name: toToggle.name, active: !toToggle.active }).unwrap();
      toast.success(toToggle.active ? 'Filial desativada.' : 'Filial ativada.');
      setToToggle(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" description="Crie ou selecione uma barbearia para gerenciar as filiais." />;

  return (
    <div>
      <PageHeader
        title="Gestão de Filiais"
        description="Gerencie as unidades da sua barbearia, horários e equipes."
        action={
          isOwner ? (
            atLimit ? (
              <Button icon={<Plus className="h-4 w-4" aria-hidden="true" />} disabled title="Limite de filiais do plano atingido">
                Nova Filial
              </Button>
            ) : (
              <ButtonLink to="/dashboard/filiais/nova" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                Nova Filial
              </ButtonLink>
            )
          ) : null
        }
      />

      {isOwner && subscription ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Filiais no plano</p>
            <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">
              {subscription.usage.branches}
              <span className="text-base font-semibold text-ink-variant"> / {limit ?? '∞'}</span>
            </p>
          </Card>
          <Card className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Barbeiros no plano</p>
            <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">
              {subscription.usage.barbers}
              <span className="text-base font-semibold text-ink-variant"> / {subscription.limits?.barbers ?? '∞'}</span>
            </p>
          </Card>
        </div>
      ) : null}

      {atLimit ? (
        <Alert tone="warning" className="mb-6" title="Limite de filiais atingido" action={<ButtonLink to="/dashboard/assinatura" size="sm" variant="secondary">Ver planos</ButtonLink>}>
          Faça upgrade do plano para abrir novas unidades.
        </Alert>
      ) : null}

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : branches.length === 0 ? (
        <EmptyState
          icon={<Store className="h-8 w-8" aria-hidden="true" />}
          title="Nenhuma filial cadastrada"
          description="Cadastre a primeira unidade para começar a receber agendamentos."
          action={isOwner ? <ButtonLink to="/dashboard/filiais/nova">Cadastrar filial</ButtonLink> : undefined}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {branches.map((branch) => {
            const address = addressLine(branch);
            return (
              <Card key={branch.id} className={branch.active ? '' : 'opacity-80'}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Store className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold tracking-[-0.025em] text-ink">{branch.name}</h2>
                      <Badge tone={branch.active ? 'green' : 'gray'} className="mt-1">
                        {branch.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm text-ink-variant">
                  <div className="flex items-start gap-2">
                    <dt className="sr-only">Endereço</dt>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <dd>{address ?? 'Endereço não informado'}</dd>
                  </div>
                  {branch.phone || branch.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Telefone</dt>
                      <Phone className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                      <dd>{formatPhone(branch.phone || branch.whatsapp)}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-surface-low pt-4">
                  <ButtonLink to={`/dashboard/filiais/${branch.id}`} variant="secondary" size="sm" icon={<Pencil className="h-4 w-4" aria-hidden="true" />}>
                    Editar
                  </ButtonLink>
                  <ButtonLink to={`/dashboard/filiais/${branch.id}/barbeiros`} variant="outline" size="sm" icon={<Users className="h-4 w-4" aria-hidden="true" />}>
                    Barbeiros
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={branch.active ? 'hover:text-danger-600' : 'text-primary-600'}
                    icon={<Power className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => setToToggle(branch)}
                  >
                    {branch.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toToggle)}
        title={toToggle?.active ? 'Desativar filial?' : 'Ativar filial?'}
        description={
          toToggle?.active
            ? `"${toToggle.name}" deixará de aparecer na busca e não receberá novos agendamentos online. O histórico é preservado.`
            : `"${toToggle?.name}" voltará a aparecer para os clientes.`
        }
        confirmLabel={toToggle?.active ? 'Desativar' : 'Ativar'}
        tone={toToggle?.active ? 'danger' : 'primary'}
        loading={toggling}
        onConfirm={() => void confirmToggle()}
        onCancel={() => setToToggle(null)}
      />
    </div>
  );
};

export default BranchesPage;
