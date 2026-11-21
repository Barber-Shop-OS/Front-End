// Figma 1:4085 "Checkout de Assinatura" — mantém o layout (resumo do pedido + dados de cobrança), mas o
// pagamento acontece no checkout hospedado da AbacatePay (decisão A3): sem campos de cartão no front.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowLeft, Check, CreditCard, Lock, QrCode, ShieldCheck } from 'lucide-react';

import { Alert, Button, Card, EmptyState, Input, ListSkeleton, PageHeader, useToast } from '@/components/ui';
import { useOwnerBillingCheckoutMutation } from '@/features/owner-admin/api';
import { OwnerOnlyNotice } from '@/features/owner-admin/components';
import { checkoutSchema, type CheckoutFormValues } from '@/features/owner-admin/schemas';
import { featureLabel, limitLabel, maskTaxId, onlyDigits } from '@/features/owner-admin/utils';
import { useGetSubscriptionQuery, useListPlansQuery } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { formatCents, formatPhone } from '@/utils/format';

const CheckoutPage = () => {
  usePageTitle('Checkout da assinatura');
  const toast = useToast();
  const [params] = useSearchParams();
  const { barbershop, isOwner } = useActiveContext();
  const { data: plans = [], isLoading } = useListPlansQuery();
  const { data: sub } = useGetSubscriptionQuery(barbershop && isOwner ? barbershop.id : skipToken);
  const [checkout, { isLoading: submitting }] = useOwnerBillingCheckoutMutation();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema), defaultValues: { tax_id: '', cellphone: '' } });

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" />;
  if (!isOwner) return <OwnerOnlyNotice />;
  if (isLoading) return <ListSkeleton rows={3} />;
  const plan = plans.find((p) => p.code === params.get('plano'));
  if (!plan) return <Navigate to="/dashboard/assinatura" replace />;
  if (sub && ['active', 'past_due'].includes(sub.status)) return <Navigate to="/dashboard/assinatura" replace />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await checkout({
        barbershop_id: barbershop.id,
        plan_code: plan.code,
        tax_id: onlyDigits(values.tax_id),
        cellphone: values.cellphone ? onlyDigits(values.cellphone) : undefined,
      }).unwrap();
      window.location.assign(result.checkout_url);
    } catch (err) {
      if (errorCode(err) === 'INVALID_TAX_ID') setError('tax_id', { message: 'CPF ou CNPJ inválido' });
      toast.error(
        errorCode(err) === 'BILLING_UNAVAILABLE' ? 'O pagamento está indisponível no momento. Tente novamente em alguns minutos.' : apiErrorMessage(err, 'Não foi possível iniciar o pagamento.')
      );
    }
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        back={
          <Link to="/dashboard/assinatura" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Planos
          </Link>
        }
        title="Finalizar assinatura"
        description={`Assinatura do plano ${plan.name} para ${barbershop.name}.`}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">Dados de cobrança</h2>
          <p className="mt-1 text-sm text-ink-variant">Usados na nota e no cadastro do pagador na AbacatePay.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Input
              label="CPF ou CNPJ"
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              error={errors.tax_id?.message}
              {...register('tax_id', { onChange: (e) => setValue('tax_id', maskTaxId(e.target.value)) })}
            />
            <Input
              label="Celular"
              inputMode="tel"
              placeholder="(11) 99999-9999"
              error={errors.cellphone?.message}
              {...register('cellphone', { onBlur: (e) => setValue('cellphone', formatPhone(e.target.value)) })}
            />
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-label text-ink-variant">Forma de pagamento</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-outline-variant/40 p-4">
                  <QrCode className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  <span className="text-sm font-semibold text-ink">Pix</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-outline-variant/40 p-4">
                  <CreditCard className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  <span className="text-sm font-semibold text-ink">Cartão de crédito</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-variant">Você escolhe a forma de pagamento na página segura da AbacatePay.</p>
            </fieldset>
            <Alert tone="info">Ao continuar, você será redirecionado para concluir o pagamento. Os dados do cartão nunca passam pelo BarberOS.</Alert>
            <Button type="submit" size="lg" block loading={submitting} icon={<Lock className="h-4 w-4" aria-hidden="true" />}>
              Ir para o pagamento
            </Button>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Resumo do pedido</p>
            <div className="mt-3 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-ink">Plano {plan.name}</h2>
              <p className="text-sm text-ink-variant">mensal</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-ink-variant">
              {[limitLabel(plan.limits.branches, 'filial', 'filiais', true), limitLabel(plan.limits.barbers, 'barbeiro', 'barbeiros'), ...plan.features.slice(0, 4).map(featureLabel)].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 border-t border-surface-low pt-4 text-sm">
              <div className="flex justify-between text-ink-variant">
                <span>Subtotal</span>
                <span>{formatCents(plan.price_cents)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ink">
                <span>Total hoje</span>
                <span>{formatCents(plan.price_cents)}</span>
              </div>
              <p className="text-xs text-ink-variant">Renovação automática mensal. Cancele quando quiser.</p>
            </div>
          </Card>
          <div className="flex items-center gap-3 rounded-xl bg-surface-low p-4 text-xs text-ink-variant">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success-700" aria-hidden="true" />
            Pagamento seguro processado pela AbacatePay.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
