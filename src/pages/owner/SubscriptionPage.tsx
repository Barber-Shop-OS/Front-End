// Figma 1:44 "Página de Assinatura" — situação da assinatura (trial de 14 dias, período, uso do plano) e os
// 3 planos de /plans. Sem assinatura paga → checkout hospedado (AbacatePay); com assinatura paga → troca de plano.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { CalendarClock, CreditCard, ExternalLink, Store, Users } from 'lucide-react';

import { Alert, Badge, Button, ButtonLink, Card, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, Skeleton, useToast } from '@/components/ui';
import { useOwnerBillingPortalMutation, useOwnerCancelSubscriptionMutation, useOwnerChangePlanMutation, useOwnerResumeSubscriptionMutation } from '@/features/owner-admin/api';
import { OwnerOnlyNotice, PlanCard } from '@/features/owner-admin/components';
import { SUBSCRIPTION_STATUS, daysUntil } from '@/features/owner-admin/utils';
import { useGetSubscriptionQuery, useListPlansQuery } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Plan } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { formatDate } from '@/utils/date';

const Usage = ({ icon, label, used, limit }: { icon: React.ReactNode; label: string; used: number; limit: number | null }) => {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 font-semibold text-ink">
          {icon}
          {label}
        </span>
        <span className="text-ink-variant">
          {used} / {limit ?? '∞'}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-danger-600' : 'bg-primary-600'}`} style={{ width: `${limit ? pct : 8}%` }} />
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  usePageTitle('Assinatura');
  const toast = useToast();
  const [params] = useSearchParams();
  const { barbershop, isOwner } = useActiveContext();
  const { data: sub, isLoading, error, refetch } = useGetSubscriptionQuery(barbershop && isOwner ? barbershop.id : skipToken);
  const { data: plans = [], isLoading: plansLoading } = useListPlansQuery();
  const [changePlan, { isLoading: changing }] = useOwnerChangePlanMutation();
  const [cancel, { isLoading: canceling }] = useOwnerCancelSubscriptionMutation();
  const [resume, { isLoading: resuming }] = useOwnerResumeSubscriptionMutation();
  const [portal, { isLoading: openingPortal }] = useOwnerBillingPortalMutation();
  const [toPlan, setToPlan] = useState<Plan | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" />;
  if (!isOwner) return <OwnerOnlyNotice />;

  const returned = params.get('status');
  const paying = sub ? ['active', 'past_due'].includes(sub.status) : false;
  const trialDays = sub?.status === 'trialing' ? daysUntil(sub.trial_ends_at) : 0;
  const currentCode = sub?.effective_plan_code ?? sub?.plan_code;

  const doChange = async () => {
    if (!toPlan || !sub) return;
    try {
      const result = await changePlan({ barbershop_id: barbershop.id, plan_code: toPlan.code }).unwrap();
      toast.success(result.effective_at ? `Troca agendada para ${formatDate(result.effective_at)}.` : `Plano alterado para ${toPlan.name}.`);
      setToPlan(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Assinatura" description="Escolha o plano ideal para o tamanho da sua barbearia." />

      {returned === 'processando' ? (
        <Alert tone="success" className="mb-6" title="Pagamento em processamento">
          Assim que a AbacatePay confirmar o pagamento, sua assinatura será ativada automaticamente.
        </Alert>
      ) : returned === 'cancelado' ? (
        <Alert tone="warning" className="mb-6" title="Pagamento não concluído">
          Você saiu do checkout antes de pagar. Nada foi cobrado.
        </Alert>
      ) : null}

      {isLoading ? (
        <Skeleton className="mb-8 h-48 w-full" />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} className="mb-8" />
      ) : sub ? (
        <Card className="mb-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">Plano {plans.find((p) => p.code === currentCode)?.name ?? currentCode}</h2>
                <Badge tone={SUBSCRIPTION_STATUS[sub.status].tone}>{SUBSCRIPTION_STATUS[sub.status].label}</Badge>
                {sub.cancel_at_period_end ? <Badge tone="red">Cancelamento agendado</Badge> : null}
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-variant">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                {sub.status === 'trialing'
                  ? `Teste grátis: ${trialDays} dia${trialDays === 1 ? '' : 's'} restante${trialDays === 1 ? '' : 's'} (até ${sub.trial_ends_at ? formatDate(sub.trial_ends_at) : '—'}).`
                  : sub.current_period_end
                    ? `${sub.cancel_at_period_end ? 'Acesso até' : 'Próxima renovação em'} ${formatDate(sub.current_period_end)}.`
                    : sub.status === 'pending'
                      ? 'Aguardando a confirmação do pagamento.'
                      : 'Sem período ativo.'}
              </p>
              {sub.status === 'trialing' ? (
                <p className="mt-3 text-sm text-ink-variant">Durante o teste você usa tudo do plano Profissional. Assine quando quiser — o teste não é cobrado.</p>
              ) : null}
              {['expired', 'canceled'].includes(sub.status) ? (
                <Alert tone="error" className="mt-4" title="Painel em modo leitura">
                  Seus dados estão preservados. Assine um plano para voltar a criar agendamentos e editar o cadastro.
                </Alert>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
                {paying ? (
                  <Button
                    variant="secondary"
                    icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
                    loading={openingPortal}
                    onClick={async () => {
                      try {
                        const { portal_url } = await portal({ barbershop_id: barbershop.id }).unwrap();
                        window.location.assign(portal_url);
                      } catch (err) {
                        toast.error(apiErrorMessage(err));
                      }
                    }}
                  >
                    Gerenciar pagamento
                  </Button>
                ) : null}
                {sub.cancel_at_period_end ? (
                  <Button
                    loading={resuming}
                    onClick={async () => {
                      try {
                        await resume({ barbershop_id: barbershop.id }).unwrap();
                        toast.success('Assinatura mantida.');
                      } catch (err) {
                        toast.error(apiErrorMessage(err));
                      }
                    }}
                  >
                    Manter assinatura
                  </Button>
                ) : ['trialing', 'active', 'past_due', 'pending'].includes(sub.status) ? (
                  <Button variant="ghost" className="hover:text-danger-600" onClick={() => setConfirmCancel(true)}>
                    Cancelar assinatura
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="space-y-5 rounded-xl bg-surface-low p-5">
              <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Uso do plano</p>
              <Usage icon={<Store className="h-4 w-4 text-primary-600" aria-hidden="true" />} label="Filiais" used={sub.usage.branches} limit={sub.limits.branches} />
              <Usage icon={<Users className="h-4 w-4 text-primary-600" aria-hidden="true" />} label="Barbeiros" used={sub.usage.barbers} limit={sub.limits.barbers} />
            </div>
          </div>
        </Card>
      ) : null}

      <h2 className="mb-8 text-center text-2xl font-bold tracking-[-0.025em] text-ink">Planos</h2>
      {plansLoading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="grid items-stretch gap-6 pt-3 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => {
            const current = Boolean(sub && plan.code === currentCode && sub.status !== 'trialing' && !['expired', 'canceled'].includes(sub.status));
            const highlighted = plan.code === 'profissional';
            return (
              <PlanCard
                key={plan.code}
                plan={plan}
                highlighted={highlighted}
                current={current}
                badge={highlighted ? 'Mais popular' : undefined}
                action={
                  current ? (
                    <Button block variant={highlighted ? 'white' : 'secondary'} disabled>
                      Plano atual
                    </Button>
                  ) : paying ? (
                    <Button block variant={highlighted ? 'white' : 'primary'} icon={<CreditCard className="h-4 w-4" aria-hidden="true" />} onClick={() => setToPlan(plan)}>
                      Trocar para {plan.name}
                    </Button>
                  ) : (
                    <ButtonLink block variant={highlighted ? 'white' : 'primary'} to={`/dashboard/assinatura/checkout?plano=${plan.code}`}>
                      Assinar {plan.name}
                    </ButtonLink>
                  )
                }
              />
            );
          })}
        </div>
      )}
      <p className="mt-8 text-center text-xs text-ink-variant">Pagamento processado com segurança pela AbacatePay (Pix ou cartão). Cancele quando quiser.</p>

      <ConfirmDialog
        open={Boolean(toPlan)}
        title={`Trocar para o plano ${toPlan?.name ?? ''}?`}
        description="Upgrades valem imediatamente. Downgrades passam a valer na próxima renovação, desde que o uso caiba no novo plano."
        confirmLabel="Confirmar troca"
        loading={changing}
        onConfirm={() => void doChange()}
        onCancel={() => setToPlan(null)}
      />
      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar assinatura?"
        tone="danger"
        confirmLabel="Cancelar assinatura"
        cancelLabel="Manter"
        loading={canceling}
        description={
          sub?.status === 'trialing'
            ? 'O teste grátis será encerrado e o painel ficará em modo leitura.'
            : 'Você mantém o acesso até o fim do período já pago. Depois o painel fica em modo leitura, com os dados preservados.'
        }
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          try {
            await cancel({ barbershop_id: barbershop.id }).unwrap();
            toast.success('Cancelamento registrado.');
            setConfirmCancel(false);
          } catch (err) {
            toast.error(apiErrorMessage(err));
          }
        }}
      />
    </div>
  );
};

export default SubscriptionPage;
