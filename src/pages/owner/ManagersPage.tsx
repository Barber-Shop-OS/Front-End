// Equipe (sem frame no Figma; segue o padrão de tabela do painel): gerentes (plano Rede) e
// recepcionistas/atendimento (BE-49, todos os planos). Dono gerencia tudo; gerente só o atendimento das filiais dele.
import { useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Lock, Pencil, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

import { Alert, Avatar, Badge, Button, ButtonLink, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, Select, useToast } from '@/components/ui';
import { useOwnerAddMemberMutation, useOwnerListMembersQuery, useOwnerRemoveMemberMutation, useOwnerUpdateMemberMutation } from '@/features/owner-admin/api';
import type { MemberRole, TeamMember } from '@/features/owner-admin/types';
import { MEMBER_ROLE_LABEL } from '@/features/owner-admin/utils';
import { useGetSubscriptionQuery } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Branch } from '@/types/api';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { formatDay } from '@/utils/date';

const MemberModal = ({
  open,
  onClose,
  member,
  branches,
  barbershopId,
  canManagers,
}: {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
  branches: Branch[];
  barbershopId: number;
  canManagers: boolean;
}) => {
  const toast = useToast();
  const [add, { isLoading: adding }] = useOwnerAddMemberMutation();
  const [update, { isLoading: updating }] = useOwnerUpdateMemberMutation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('receptionist');
  const [allBranches, setAllBranches] = useState(true);
  const [branchIds, setBranchIds] = useState<number[]>([]);
  const [branchId, setBranchId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setEmail('');
    setRole(member?.role ?? 'receptionist');
    setAllBranches(member ? member.branch_ids === null : true);
    setBranchIds(member?.branch_ids ?? []);
    setBranchId(member?.branch_id ?? branches[0]?.id ?? '');
  }, [open, member, branches]);

  const submit = async () => {
    setError(null);
    if (!member && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Informe um e-mail válido.');
    if (role === 'receptionist' && !branchId) return setError('Escolha a filial do atendimento.');
    if (role === 'manager' && !allBranches && branchIds.length === 0) return setError('Escolha ao menos uma filial.');
    const scope = role === 'receptionist' ? { branch_id: Number(branchId) } : { branch_ids: allBranches ? null : branchIds };
    try {
      if (member) await update({ barbershopId, memberId: member.id, ...scope }).unwrap();
      else await add({ barbershopId, email: email.trim().toLowerCase(), role, ...scope }).unwrap();
      toast.success(member ? 'Acesso atualizado.' : `${MEMBER_ROLE_LABEL[role]} adicionado à equipe.`);
      onClose();
    } catch (err) {
      const code = errorCode(err);
      setError(
        code === 'USER_NOT_FOUND'
          ? 'Nenhuma conta com este e-mail. Peça para a pessoa criar uma conta no BarberOS e tente de novo.'
          : code === 'FEATURE_NOT_IN_PLAN'
            ? 'Gerentes de filial estão disponíveis no plano Rede.'
            : apiErrorMessage(err)
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={member ? `Editar acesso — ${member.user.name ?? member.user.email}` : 'Adicionar à equipe'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={adding || updating}>
            {member ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!member ? (
          <>
            <Input label="E-mail da conta" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} hint="A pessoa precisa ter uma conta no BarberOS." />
            <Select label="Função" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
              <option value="receptionist">Atendimento (recepção)</option>
              <option value="manager" disabled={!canManagers}>
                Gerente{canManagers ? '' : ' — plano Rede'}
              </option>
            </Select>
            <p className="text-xs text-ink-variant">
              {role === 'receptionist'
                ? 'Atendimento agenda, cadastra clientes, conclui atendimentos e registra pagamentos no balcão. Não vê o financeiro.'
                : 'Gerente usa o painel da barbearia restrito às filiais escolhidas (sem assinatura e configurações).'}
            </p>
          </>
        ) : null}
        {role === 'receptionist' ? (
          <Select label="Filial" value={branchId} onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : '')}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        ) : (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-label text-ink-variant">Filiais</legend>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={allBranches} onChange={(e) => setAllBranches(e.target.checked)} />
              Todas as filiais (inclusive futuras)
            </label>
            {!allBranches
              ? branches.map((b) => (
                  <label key={b.id} className="ml-6 flex items-center gap-2 text-sm text-ink-variant">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary-600"
                      checked={branchIds.includes(b.id)}
                      onChange={(e) => setBranchIds((cur) => (e.target.checked ? [...cur, b.id] : cur.filter((id) => id !== b.id)))}
                    />
                    {b.name}
                  </label>
                ))
              : null}
          </fieldset>
        )}
      </div>
    </Modal>
  );
};

const ManagersPage = () => {
  usePageTitle('Equipe');
  const toast = useToast();
  const { barbershop, branches, isOwner } = useActiveContext();
  const { data = [], isLoading, error, refetch } = useOwnerListMembersQuery(barbershop?.id ?? 0, { skip: !barbershop });
  const { data: subscription } = useGetSubscriptionQuery(barbershop && isOwner ? barbershop.id : skipToken);
  const [remove, { isLoading: removing }] = useOwnerRemoveMemberMutation();
  const [modal, setModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [toRemove, setToRemove] = useState<TeamMember | null>(null);

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" />;
  const canManagers = isOwner && Boolean(subscription?.features?.includes('branch_managers'));
  const branchLabel = (m: TeamMember) => {
    if (m.role === 'receptionist') return branches.find((b) => b.id === m.branch_id)?.name ?? '—';
    if (m.branch_ids === null) return 'Todas as filiais';
    return m.branch_ids.map((id) => branches.find((b) => b.id === id)?.name ?? `#${id}`).join(', ');
  };

  return (
    <div>
      <PageHeader
        title="Equipe"
        description={isOwner ? 'Gerentes e atendentes que ajudam a administrar a barbearia.' : 'Atendentes das suas filiais.'}
        action={
          <Button icon={<UserPlus className="h-4 w-4" aria-hidden="true" />} onClick={() => setModal({ open: true, member: null })} disabled={branches.length === 0}>
            Adicionar
          </Button>
        }
      />

      {isOwner && subscription && !canManagers ? (
        <Alert tone="info" className="mb-6" title="Gerentes por filial no plano Rede" action={<ButtonLink to="/dashboard/assinatura" size="sm" variant="secondary">Ver planos</ButtonLink>}>
          No seu plano você pode adicionar atendentes (recepção). Faça upgrade para delegar filiais a gerentes.
        </Alert>
      ) : null}

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-8 w-8" aria-hidden="true" />}
          title="Ninguém na equipe ainda"
          description="Adicione atendentes para agendar e receber no balcão sem dar acesso ao financeiro."
          action={<Button onClick={() => setModal({ open: true, member: null })}>Adicionar pessoa</Button>}
        />
      ) : (
        <ul className="divide-y divide-surface-low rounded-xl bg-white shadow-card">
          {data.map((member) => {
            const editable = isOwner || member.role === 'receptionist';
            return (
              <li key={member.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={member.user.name ?? member.user.email} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{member.user.name ?? member.user.email}</p>
                    <p className="truncate text-xs text-ink-variant">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:w-72">
                  <Badge tone={member.role === 'manager' ? 'blue' : 'orange'}>{MEMBER_ROLE_LABEL[member.role]}</Badge>
                  <span className="truncate text-sm text-ink-variant">{branchLabel(member)}</span>
                </div>
                <span className="hidden text-xs text-ink-subtle lg:block lg:w-28">desde {formatDay(member.created_at)}</span>
                <div className="flex gap-1">
                  {editable ? (
                    <>
                      <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low hover:text-primary-600" aria-label="Editar acesso" onClick={() => setModal({ open: true, member })}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-danger-50 hover:text-danger-600" aria-label="Remover da equipe" onClick={() => setToRemove(member)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <Lock className="m-2 h-4 w-4 text-ink-subtle" aria-label="Somente o dono altera" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <MemberModal
        open={modal.open}
        member={modal.member}
        onClose={() => setModal({ open: false, member: null })}
        branches={branches.filter((b) => b.active)}
        barbershopId={barbershop.id}
        canManagers={canManagers}
      />
      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remover da equipe?"
        description={`${toRemove?.user.name ?? toRemove?.user.email ?? ''} perde o acesso ao painel imediatamente. A conta continua existindo.`}
        tone="danger"
        confirmLabel="Remover"
        loading={removing}
        onCancel={() => setToRemove(null)}
        onConfirm={async () => {
          if (!toRemove) return;
          try {
            await remove({ barbershopId: barbershop.id, memberId: toRemove.id }).unwrap();
            toast.success('Removido da equipe.');
            setToRemove(null);
          } catch (err) {
            toast.error(apiErrorMessage(err));
          }
        }}
      />
    </div>
  );
};

export default ManagersPage;
