// Figma 1:5522 "Dashboard - Atendimento": KPIs do dia (total, atendidos, pendentes), ações rápidas e a fila
// de próximos clientes; tocar em um item abre o detalhe com concluir / não compareceu / pagamento.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowRight, CalendarCheck, CalendarPlus, CheckCircle2, Clock, UserPlus, Wallet } from 'lucide-react';

import { Avatar, Card, CardTitle, ErrorState, ListSkeleton, PageHeader, Skeleton, Stat, StatusBadge } from '@/components/ui';
import { useGetAppointmentQuery } from '@/features/appointments/api';
import { useFrontDeskSummaryQuery } from '@/features/frontdesk/api';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { AppointmentDetailModal } from '@/features/owner-ops/staff';
import { useActiveContext, type ActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatLocalDateLong } from '@/utils/date';
import { formatBRL } from '@/utils/format';

const DetailById = ({ id, onClose }: { id: number | null; onClose: () => void }) => {
  const { data } = useGetAppointmentQuery(id ?? skipToken);
  return <AppointmentDetailModal appointment={id && data ? data : null} onClose={onClose} />;
};

const QUICK = [
  { to: '/atendimento/agendamentos/novo', label: 'Novo agendamento', icon: CalendarPlus },
  { to: '/atendimento/clientes/novo', label: 'Cadastrar cliente', icon: UserPlus },
  { to: '/atendimento/pagamentos', label: 'Receber pagamento', icon: Wallet },
  { to: '/atendimento/agenda', label: 'Ver agenda', icon: CalendarCheck },
];

const Content = ({ ctx }: { ctx: ActiveContext }) => {
  const { data, isLoading, error, refetch } = useFrontDeskSummaryQuery({ branch_id: ctx.branch!.id }, { pollingInterval: 60000 });
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div>
      <PageHeader title="Atendimento" description={data ? `${data.branch.name} · ${formatLocalDateLong(data.date)}` : ctx.branch?.name} />
      {error ? <ErrorState error={error} onRetry={refetch} className="mb-6" /> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Agendamentos hoje" value={data ? data.total_today : <Skeleton className="h-9 w-12" />} icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />} hint={data?.cancelled ? `${data.cancelled} cancelado(s)` : undefined} />
        <Stat label="Atendidos" value={data ? data.attended : <Skeleton className="h-9 w-12" />} icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} hint={data?.no_show ? `${data.no_show} falta(s)` : undefined} />
        <Stat label="Aguardando" value={data ? data.pending : <Skeleton className="h-9 w-12" />} icon={<Clock className="h-5 w-5" aria-hidden="true" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardTitle
            action={
              <Link to="/atendimento/agenda" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                Agenda completa <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          >
            Próximos clientes
          </CardTitle>
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : !data?.upcoming.length ? (
            <p className="py-10 text-center text-sm text-ink-variant">Ninguém aguardando no momento.</p>
          ) : (
            <ul className="divide-y divide-surface-low">
              {data.upcoming.map((item, index) => {
                const price = item.services.reduce((sum, s) => sum + Number(s.price), 0);
                return (
                  <li key={item.id}>
                    <button type="button" onClick={() => setOpenId(item.id)} className={`flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left hover:bg-surface-low ${index === 0 ? 'bg-primary-50' : ''}`}>
                      <span className="w-14 text-lg font-black text-primary-600">{item.time}</span>
                      <Avatar name={item.client?.name ?? 'Cliente'} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">{item.client?.name ?? 'Cliente'}</span>
                        <span className="block truncate text-xs text-ink-variant">
                          {item.services.map((s) => s.name).join(', ')} · {item.barber?.name ?? 'Barbeiro'}
                        </span>
                      </span>
                      <span className="hidden text-sm font-semibold text-ink sm:block">{formatBRL(price)}</span>
                      <StatusBadge status={item.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Ações rápidas</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            {QUICK.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-xl bg-surface-low p-4 text-center text-sm font-semibold text-ink transition hover:bg-primary-50 hover:text-primary-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600 shadow-card">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <DetailById id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

const FrontDeskDashboardPage = () => {
  usePageTitle('Atendimento');
  const ctx = useActiveContext('frontdesk');
  return (
    <WorkspaceGate ctx={ctx}>
      <Content ctx={ctx} />
    </WorkspaceGate>
  );
};

export default FrontDeskDashboardPage;
