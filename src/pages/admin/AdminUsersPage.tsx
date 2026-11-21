// Admin — usuários: busca por nome/e-mail, filtro por papel e troca de papel (com confirmação).
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Avatar, Badge, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination, Select, useToast } from '@/components/ui';
import { useAdminChangeRoleMutation, useAdminUsersQuery } from '@/features/admin/api';
import { useAuth } from '@/features/auth/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { BackendRole, User } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { formatDay } from '@/utils/date';

const ROLE_LABEL: Record<BackendRole, string> = { cliente: 'Cliente', barbeiro: 'Barbeiro', owner: 'Dono', admin: 'Admin' };
const ROLES = Object.keys(ROLE_LABEL) as BackendRole[];

const AdminUsersPage = () => {
  usePageTitle('Usuários — Admin');
  const toast = useToast();
  const { user: me } = useAuth();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState<BackendRole | ''>('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ user: User; role: BackendRole } | null>(null);
  useEffect(() => {
    const h = window.setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(h);
  }, [input]);
  const { data, isLoading, error, refetch } = useAdminUsersQuery({ q: q || undefined, role: role || undefined, page, pageSize: 20 });
  const [changeRole, { isLoading: changing }] = useAdminChangeRoleMutation();

  return (
    <div>
      <PageHeader title="Usuários" description={`${data?.total ?? 0} contas`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nome ou e-mail" className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </label>
        <Select aria-label="Papel" containerClassName="sm:w-44" className="bg-white shadow-card" value={role} onChange={(e) => setRole(e.target.value as BackendRole | '')}>
          <option value="">Todos os papéis</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState title="Nenhum usuário encontrado" />
      ) : (
        <>
          <ul className="divide-y divide-surface-low rounded-xl bg-white shadow-card">
            {data.items.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{u.name}</p>
                    <p className="truncate text-xs text-ink-variant">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.email_verified_at ? <Badge tone="green">Verificado</Badge> : <Badge tone="yellow">Não verificado</Badge>}
                  {u.created_at ? <span className="hidden text-xs text-ink-subtle md:inline">desde {formatDay(u.created_at)}</span> : null}
                </div>
                <Select
                  aria-label={`Papel de ${u.name}`}
                  containerClassName="sm:w-36"
                  className="h-10"
                  value={u.role}
                  disabled={u.id === me?.id}
                  onChange={(e) => setPending({ user: u, role: e.target.value as BackendRole })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </Select>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Alterar papel?"
        description={pending ? `${pending.user.name} passará de ${ROLE_LABEL[pending.user.role]} para ${ROLE_LABEL[pending.role]}.` : ''}
        confirmLabel="Alterar"
        tone={pending?.role === 'admin' ? 'danger' : 'primary'}
        loading={changing}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          try {
            await changeRole({ id: pending.user.id, role: pending.role }).unwrap();
            toast.success('Papel atualizado.');
            setPending(null);
          } catch (err) {
            toast.error(apiErrorMessage(err));
          }
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
