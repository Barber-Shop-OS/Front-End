// Admin — visão geral do SaaS (sem frame no Figma; usa os KPIs do painel): MRR, pagantes, trials, novas
// barbearias e churn de 30 dias, assinaturas por status e por plano.
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CreditCard, Gift, TrendingDown, Wallet } from 'lucide-react';

import { Card, CardTitle, ErrorState, ListSkeleton, PageHeader, Stat } from '@/components/ui';
import { useAdminMetricsQuery } from '@/features/admin/api';
import { SUBSCRIPTION_STATUS } from '@/features/owner-admin/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { SubscriptionStatus } from '@/types/api';
import { formatBRL } from '@/utils/format';

const PLAN_NAME: Record<string, string> = { essencial: 'Essencial', profissional: 'Profissional', rede: 'Rede' };

const Bars = ({ rows }: { rows: { label: string; value: number }[] }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold text-ink">{r.label}</span>
            <span className="text-ink-variant">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-high">
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const AdminDashboardPage = () => {
  usePageTitle('Admin');
  const { data, isLoading, error, refetch } = useAdminMetricsQuery();

  return (
    <div>
      <PageHeader title="Visão geral da plataforma" description="Receita recorrente, assinaturas e crescimento." />
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="MRR" value={formatBRL(data.mrr)} hint={`${data.paying} assinaturas pagantes`} icon={<Wallet className="h-5 w-5" aria-hidden="true" />} />
            <Stat label="Em teste grátis" value={data.trials} icon={<Gift className="h-5 w-5" aria-hidden="true" />} />
            <Stat label="Novas barbearias (30d)" value={data.new_barbershops_30d} icon={<Building2 className="h-5 w-5" aria-hidden="true" />} />
            <Stat label="Churn (30d)" value={`${(data.churn_rate_30d * 100).toFixed(1).replace('.', ',')}%`} hint={`${data.churned_30d} cancelamento(s)`} icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Assinaturas por status</CardTitle>
              <Bars rows={(Object.keys(SUBSCRIPTION_STATUS) as SubscriptionStatus[]).map((s) => ({ label: SUBSCRIPTION_STATUS[s].label, value: data.subscriptions_by_status[s] ?? 0 }))} />
            </Card>
            <Card>
              <CardTitle
                action={
                  <Link to="/admin/barbearias" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                    Barbearias <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
              >
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" aria-hidden="true" /> Pagantes por plano
                </span>
              </CardTitle>
              <Bars rows={['essencial', 'profissional', 'rede'].map((code) => ({ label: PLAN_NAME[code], value: data.paying_by_plan[code as keyof typeof data.paying_by_plan] ?? 0 }))} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
