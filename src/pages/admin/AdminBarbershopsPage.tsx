// Admin — barbearias: busca, filtros por status/assinatura, suspender/reativar e estender o trial.
import { useEffect, useState } from 'react';
import { ExternalLink, Gift, Pause, Play, Search } from 'lucide-react';

import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, Pagination, Select, useToast } from '@/components/ui';
import { useAdminBarbershopsQuery, useAdminExtendTrialMutation, useAdminReactivateMutation, useAdminSuspendMutation, type AdminBarbershop } from '@/features/admin/api';
import { SUBSCRIPTION_STATUS } from '@/features/owner-admin/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { SubscriptionStatus } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { formatDate } from '@/utils/date';

const SHOP_STATUS: Record<AdminBarbershop['status'], { label: string; tone: 'green' | 'red' | 'gray' }> = {
  active: { label: 'Ativa', tone: 'green' },
  suspended: { label: 'Suspensa', tone: 'red' },
  deleted: { label: 'Excluída', tone: 'gray' },
};

const AdminBarbershopsPage = () => {
  usePageTitle('Barbearias — Admin');
  const toast = useToast();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<AdminBarbershop['status'] | ''>('');
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | ''>('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const h = window.setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(h);
  }, [input]);
  const { data, isLoading, error, refetch } = useAdminBarbershopsQuery({ q: q || undefined, status: status || undefined, subscription_status: subStatus || undefined, page, pageSize: 20 });
  const [suspend, { isLoading: suspending }] = useAdminSuspendMutation();
  const [reactivate] = useAdminReactivateMutation();
  const [extend, { isLoading: extending }] = useAdminExtendTrialMutation();
  const [toSuspend, setToSuspend] = useState<AdminBarbershop | null>(null);
  const [reason, setReason] = useState('');
  const [toExtend, setToExtend] = useState<AdminBarbershop | null>(null);
  const [days, setDays] = useState(7);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Barbearias" description={`${data?.total ?? 0} cadastradas`} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nome ou endereço da página" className="h-12 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </label>
        <Select aria-label="Status" containerClassName="md:w-44" className="bg-white shadow-card" value={status} onChange={(e) => setStatus(e.target.value as AdminBarbershop['status'] | '')}>
          <option value="">Todas</option>
          <option value="active">Ativas</option>
          <option value="suspended">Suspensas</option>
        </Select>
        <Select aria-label="Assinatura" containerClassName="md:w-56" className="bg-white shadow-card" value={subStatus} onChange={(e) => setSubStatus(e.target.value as SubscriptionStatus | '')}>
          <option value="">Qualquer assinatura</option>
          {(Object.keys(SUBSCRIPTION_STATUS) as SubscriptionStatus[]).map((s) => (
            <option key={s} value={s}>
              {SUBSCRIPTION_STATUS[s].label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState title="Nenhuma barbearia encontrada" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-low text-xs font-semibold uppercase tracking-label text-ink-variant">
                <tr>
                  <th className="px-4 py-3">Barbearia</th>
                  <th className="px-4 py-3">Dono</th>
                  <th className="px-4 py-3">Assinatura</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-low">
                {data.items.map((shop) => (
                  <tr key={shop.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{shop.name}</p>
                      <a href={`/b/${shop.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600">
                        /b/{shop.slug} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-variant">
                      <p>{shop.owner?.name ?? '—'}</p>
                      <p className="text-xs">{shop.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {shop.subscription ? (
                        <>
                          <Badge tone={SUBSCRIPTION_STATUS[shop.subscription.status].tone}>{SUBSCRIPTION_STATUS[shop.subscription.status].label}</Badge>
                          <p className="mt-1 text-xs capitalize text-ink-variant">
                            {shop.subscription.plan_code}
                            {shop.subscription.status === 'trialing' && shop.subscription.trial_ends_at ? ` · até ${formatDate(shop.subscription.trial_ends_at)}` : ''}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-ink-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={SHOP_STATUS[shop.status].tone}>{SHOP_STATUS[shop.status].label}</Badge>
                      <p className="mt-1 text-xs text-ink-subtle">desde {formatDate(shop.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {shop.subscription && ['trialing', 'expired'].includes(shop.subscription.status) ? (
                          <Button size="sm" variant="ghost" icon={<Gift className="h-4 w-4" aria-hidden="true" />} onClick={() => setToExtend(shop)}>
                            Trial
                          </Button>
                        ) : null}
                        {shop.status === 'suspended' ? (
                          <Button size="sm" variant="secondary" icon={<Play className="h-4 w-4" aria-hidden="true" />} onClick={() => void run(() => reactivate(shop.id).unwrap(), 'Barbearia reativada.')}>
                            Reativar
                          </Button>
                        ) : shop.status === 'active' ? (
                          <Button size="sm" variant="ghost" className="hover:text-danger-600" icon={<Pause className="h-4 w-4" aria-hidden="true" />} onClick={() => setToSuspend(shop)}>
                            Suspender
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toSuspend)}
        title={`Suspender ${toSuspend?.name ?? ''}?`}
        description="A barbearia sai da busca, a página pública e o agendamento online ficam indisponíveis."
        tone="danger"
        confirmLabel="Suspender"
        loading={suspending}
        onCancel={() => setToSuspend(null)}
        onConfirm={() =>
          void run(async () => {
            await suspend({ id: toSuspend!.id, reason: reason.trim() || undefined }).unwrap();
            setToSuspend(null);
            setReason('');
          }, 'Barbearia suspensa.')
        }
      >
        <Input label="Motivo" containerClassName="mt-3" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} />
      </ConfirmDialog>
      <Modal
        open={Boolean(toExtend)}
        onClose={() => setToExtend(null)}
        title={`Estender trial — ${toExtend?.name ?? ''}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToExtend(null)}>
              Cancelar
            </Button>
            <Button
              loading={extending}
              onClick={() =>
                void run(async () => {
                  await extend({ id: toExtend!.id, days }).unwrap();
                  setToExtend(null);
                }, `Trial estendido em ${days} dia(s).`)
              }
            >
              Estender
            </Button>
          </>
        }
      >
        <Input label="Dias adicionais" type="number" min={1} max={90} value={days} onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))} hint="Entre 1 e 90 dias. Trials expirados voltam a ficar ativos." />
      </Modal>
    </div>
  );
};

export default AdminBarbershopsPage;
