// Peças compartilhadas da gestão de barbeiros (lista geral, barbeiros da filial e detalhe):
// modal de adicionar/convidar, tabela de barbeiros e lista de convites pendentes.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MoreHorizontal, Power, RefreshCw, Scissors, UserPlus, X } from 'lucide-react';

import { Avatar, Badge, Button, ConfirmDialog, EmptyState, Input, Modal, Select, Textarea, useToast } from '@/components/ui';
import type { Branch } from '@/types/api';
import { apiErrorMessage, errorCode, fieldErrors } from '@/utils/apiErrors';
import { formatDay } from '@/utils/date';

import {
  useOwnerAddBarberToBranchMutation,
  useOwnerDeactivateBarberMutation,
  useOwnerListInvitationsQuery,
  useOwnerResendInvitationMutation,
  useOwnerRevokeInvitationMutation,
} from './api';
import type { Invitation, ManagedBarber } from './types';
import { INVITATION_STATUS, barberName } from './utils';

// ---------------------------------------------------------------------------------------------
// Adicionar barbeiro (vincula conta existente ou envia convite por e-mail)
// ---------------------------------------------------------------------------------------------

export const AddBarberModal = ({
  open,
  onClose,
  branches,
  defaultBranchId,
}: {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  defaultBranchId?: number | null;
}) => {
  const toast = useToast();
  const [addBarber, { isLoading }] = useOwnerAddBarberToBranchMutation();
  const activeBranches = branches.filter((b) => b.active);
  const [branchId, setBranchId] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setBranchId(defaultBranchId ?? activeBranches[0]?.id ?? '');
    setEmail('');
    setDisplayName('');
    setBio('');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultBranchId]);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!branchId) next.branch_id = 'Escolha a filial';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Informe um e-mail válido';
    if (displayName.trim().length > 80) next.display_name = 'Máximo de 80 caracteres';
    setErrors(next);
    if (Object.keys(next).length || !branchId) return;
    try {
      const result = await addBarber({
        branchId,
        email: email.trim().toLowerCase(),
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      }).unwrap();
      toast.success(result.invitation ? `Convite enviado para ${email.trim()}.` : 'Barbeiro adicionado à filial.');
      onClose();
    } catch (error) {
      const fields = fieldErrors(error);
      if (Object.keys(fields).length) setErrors(fields);
      const code = errorCode(error);
      toast.error(
        code === 'PLAN_LIMIT_REACHED' || code === 'PLAN_LIMIT_EXCEEDED'
          ? 'O limite de barbeiros do seu plano foi atingido. Faça upgrade para adicionar mais.'
          : apiErrorMessage(error, 'Não foi possível adicionar o barbeiro.')
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar barbeiro"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={isLoading} icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}>
            Adicionar
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <p className="text-sm text-ink-variant">
          Se o e-mail já tiver conta no BarberOS, o barbeiro é vinculado na hora. Caso contrário, enviamos um convite que vale por 7 dias.
        </p>
        <Select label="Filial" required value={branchId} onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : '')} error={errors.branch_id}>
          <option value="">Selecione…</option>
          {activeBranches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
        <Input label="E-mail do barbeiro" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="barbeiro@email.com" />
        <Input label="Nome de exibição" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.display_name} hint="Como o nome aparece para os clientes (opcional)." />
        <Textarea label="Bio" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} error={errors.bio} placeholder="Especialidades, experiência…" />
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------------------------
// Tabela de barbeiros
// ---------------------------------------------------------------------------------------------

export const BarbersTable = ({
  barbers,
  branchName,
  onReactivate,
}: {
  barbers: ManagedBarber[];
  branchName?: (branchId: number) => string | undefined;
  onReactivate?: (barber: ManagedBarber) => void;
}) => {
  const toast = useToast();
  const [deactivate, { isLoading }] = useOwnerDeactivateBarberMutation();
  const [target, setTarget] = useState<ManagedBarber | null>(null);
  const [needsForce, setNeedsForce] = useState(false);

  const confirm = async () => {
    if (!target) return;
    try {
      await deactivate({ id: target.id, force: needsForce }).unwrap();
      toast.success(`${barberName(target)} foi desativado.`);
      setTarget(null);
      setNeedsForce(false);
    } catch (error) {
      if (errorCode(error) === 'BARBER_HAS_FUTURE_APPOINTMENTS') {
        setNeedsForce(true);
        return;
      }
      toast.error(apiErrorMessage(error));
    }
  };

  if (barbers.length === 0) {
    return <EmptyState icon={<Scissors className="h-8 w-8" aria-hidden="true" />} title="Nenhum barbeiro encontrado" description="Adicione barbeiros para que eles recebam agendamentos." />;
  }

  return (
    <>
      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-low text-xs font-semibold uppercase tracking-label text-ink-variant">
            <tr>
              <th className="px-6 py-3">Barbeiro</th>
              {branchName ? <th className="px-6 py-3">Filial</th> : null}
              <th className="px-6 py-3">Serviços</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-low">
            {barbers.map((barber) => (
              <tr key={barber.id} className={barber.active ? '' : 'bg-surface-low/40'}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={barberName(barber)} src={barber.photo_url} />
                    <div className="min-w-0">
                      <Link to={`/dashboard/barbeiros/${barber.id}`} className="font-semibold text-ink hover:text-primary-600">
                        {barberName(barber)}
                      </Link>
                      {barber.bio ? <p className="line-clamp-1 max-w-xs text-xs text-ink-variant">{barber.bio}</p> : null}
                    </div>
                  </div>
                </td>
                {branchName ? <td className="px-6 py-4 text-ink-variant">{branchName(barber.branch_id) ?? '—'}</td> : null}
                <td className="px-6 py-4 text-ink-variant">
                  {barber.services.length ? (
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {barber.services.slice(0, 3).map((s) => (
                        <Badge key={s.id} tone="blue">
                          {s.name}
                        </Badge>
                      ))}
                      {barber.services.length > 3 ? <Badge>+{barber.services.length - 3}</Badge> : null}
                    </div>
                  ) : (
                    <span className="text-xs text-ink-subtle">{barber.active ? 'Nenhum serviço' : '—'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={barber.active ? 'green' : 'gray'}>{barber.active ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link to={`/dashboard/barbeiros/${barber.id}`} className="rounded-lg p-2 text-ink-variant hover:bg-surface-low hover:text-primary-600" aria-label={`Gerenciar ${barberName(barber)}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                    {barber.active ? (
                      <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-danger-50 hover:text-danger-600" aria-label={`Desativar ${barberName(barber)}`} onClick={() => setTarget(barber)}>
                        <Power className="h-4 w-4" />
                      </button>
                    ) : onReactivate && barber.user_id ? (
                      <Button size="sm" variant="secondary" onClick={() => onReactivate(barber)}>
                        Reativar
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cartões */}
      <ul className="space-y-3 md:hidden">
        {barbers.map((barber) => (
          <li key={barber.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Avatar name={barberName(barber)} src={barber.photo_url} />
              <div className="min-w-0 flex-1">
                <Link to={`/dashboard/barbeiros/${barber.id}`} className="font-semibold text-ink">
                  {barberName(barber)}
                </Link>
                <p className="text-xs text-ink-variant">{branchName?.(barber.branch_id) ?? `${barber.services.length} serviço(s)`}</p>
              </div>
              <Badge tone={barber.active ? 'green' : 'gray'}>{barber.active ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/dashboard/barbeiros/${barber.id}`} className="text-sm font-semibold text-primary-600">
                Gerenciar
              </Link>
              {barber.active ? (
                <button type="button" className="ml-auto text-sm font-semibold text-danger-600" onClick={() => setTarget(barber)}>
                  Desativar
                </button>
              ) : onReactivate && barber.user_id ? (
                <button type="button" className="ml-auto text-sm font-semibold text-primary-600" onClick={() => onReactivate(barber)}>
                  Reativar
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(target)}
        title="Desativar barbeiro?"
        tone="danger"
        confirmLabel={needsForce ? 'Desativar e cancelar agendamentos' : 'Desativar'}
        loading={isLoading}
        description={
          needsForce
            ? `${target ? barberName(target) : ''} tem agendamentos futuros. Ao confirmar, eles serão cancelados e os clientes avisados.`
            : `${target ? barberName(target) : ''} deixará de receber agendamentos. O histórico é preservado e você pode reativá-lo depois.`
        }
        onConfirm={() => void confirm()}
        onCancel={() => {
          setTarget(null);
          setNeedsForce(false);
        }}
      />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Convites de uma filial
// ---------------------------------------------------------------------------------------------

export const BranchInvitations = ({ branchId, title }: { branchId: number; title?: string }) => {
  const toast = useToast();
  const { data = [] } = useOwnerListInvitationsQuery(branchId);
  const [resend, { isLoading: resending }] = useOwnerResendInvitationMutation();
  const [revoke, { isLoading: revoking }] = useOwnerRevokeInvitationMutation();
  const [toRevoke, setToRevoke] = useState<Invitation | null>(null);
  const pending = data.filter((invitation) => invitation.status === 'pending' || invitation.status === 'expired');
  if (pending.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-label text-ink-variant">{title ?? 'Convites pendentes'}</h3>
      <ul className="divide-y divide-surface-low rounded-xl bg-white shadow-card">
        {pending.map((invitation) => (
          <li key={invitation.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed text-tertiary">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{invitation.display_name || invitation.email}</p>
              <p className="truncate text-xs text-ink-variant">
                {invitation.email} · {invitation.status === 'expired' ? 'expirou' : 'expira'} em {formatDay(invitation.expires_at)}
              </p>
            </div>
            <Badge tone={INVITATION_STATUS[invitation.status].tone}>{INVITATION_STATUS[invitation.status].label}</Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
                disabled={resending}
                onClick={async () => {
                  try {
                    await resend({ branchId, invitationId: invitation.id }).unwrap();
                    toast.success('Convite reenviado.');
                  } catch (error) {
                    toast.error(apiErrorMessage(error));
                  }
                }}
              >
                Reenviar
              </Button>
              <Button size="sm" variant="ghost" className="hover:text-danger-600" icon={<X className="h-4 w-4" aria-hidden="true" />} onClick={() => setToRevoke(invitation)}>
                Cancelar
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={Boolean(toRevoke)}
        title="Cancelar convite?"
        description={`O link enviado para ${toRevoke?.email ?? ''} deixará de funcionar.`}
        tone="danger"
        confirmLabel="Cancelar convite"
        loading={revoking}
        onCancel={() => setToRevoke(null)}
        onConfirm={async () => {
          if (!toRevoke) return;
          try {
            await revoke({ branchId, invitationId: toRevoke.id }).unwrap();
            toast.success('Convite cancelado.');
            setToRevoke(null);
          } catch (error) {
            toast.error(apiErrorMessage(error));
          }
        }}
      />
    </section>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReactivateBarber = () => {
  const toast = useToast();
  const [addBarber] = useOwnerAddBarberToBranchMutation();
  return async (barber: ManagedBarber) => {
    if (!barber.user_id) return;
    try {
      await addBarber({ branchId: barber.branch_id, user_id: barber.user_id }).unwrap();
      toast.success(`${barberName(barber)} foi reativado.`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível reativar o barbeiro.'));
    }
  };
};
