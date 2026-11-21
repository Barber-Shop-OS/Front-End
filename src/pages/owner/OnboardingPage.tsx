// Onboarding da barbearia (sem frame no Figma; padrão de formulário do cadastro): cria a barbearia e a
// primeira filial (com endereço via CEP). Ao concluir começa o teste grátis de 14 dias (A4).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { Gift, MapPin, Store } from 'lucide-react';

import { Alert, Button, Card, Input, Select, useToast } from '@/components/ui';
import { refreshMe } from '@/features/auth/authSlice';
import { useAuth } from '@/features/auth/hooks';
import { lookupCep, maskCep } from '@/features/owner-admin/utils';
import { UFS, onboardingSchema, type OnboardingValues } from '@/features/owner-ops/schemas';
import { useCreateBarbershopMutation, useCreateBranchMutation } from '@/features/workspace/api';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage } from '@/utils/apiErrors';

const OnboardingPage = () => {
  usePageTitle('Cadastrar barbearia');
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [createShop] = useCreateBarbershopMutation();
  const [createBranch] = useCreateBranchMutation();
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingValues>({ resolver: zodResolver(onboardingSchema), defaultValues: { branchName: 'Matriz' } });

  const owned = (user?.barbershops ?? []).filter((s) => s.membership === 'owner');
  if (owned.length && !saving && !shopId) return <Navigate to="/dashboard" replace />;

  const onCep = async (value: string) => {
    setCepLoading(true);
    const address = await lookupCep(value);
    setCepLoading(false);
    if (!address) return;
    setValue('street', address.street);
    setValue('neighborhood', address.neighborhood);
    setValue('city', address.city, { shouldValidate: true });
    if ((UFS as readonly string[]).includes(address.state)) setValue('state', address.state as OnboardingValues['state'], { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      let id = shopId;
      if (!id) {
        const created = await createShop({ name: values.shopName }).unwrap();
        id = created.barbershop?.id ?? created.id;
        setShopId(id);
      }
      await createBranch({
        barbershop_id: id,
        name: values.branchName,
        phone: values.phone || null,
        cep: values.cep,
        street: values.street || null,
        number: values.number,
        complement: values.complement || null,
        neighborhood: values.neighborhood || null,
        city: values.city,
        state: values.state,
      }).unwrap();
      await dispatch(refreshMe());
      toast.success('Barbearia criada! Seu teste grátis de 14 dias começou.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível concluir o cadastro.'));
      setSaving(false);
    }
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <Store className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">Cadastre sua barbearia</h1>
        <p className="mt-2 text-ink-variant">Em 2 minutos sua agenda online está no ar.</p>
      </div>

      <Alert tone="success" className="mb-6" title="14 dias grátis, sem cartão">
        <span className="inline-flex items-center gap-1">
          <Gift className="h-4 w-4" aria-hidden="true" /> Você usa todos os recursos do plano Profissional durante o teste.
        </span>
      </Alert>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Sua barbearia</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome da barbearia" required containerClassName="sm:col-span-2" placeholder="Ex.: Barbearia do Zé" disabled={Boolean(shopId)} error={errors.shopName?.message} {...register('shopName')} />
            <Input label="Nome da primeira filial" required error={errors.branchName?.message} {...register('branchName')} />
            <Input label="Telefone" inputMode="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
            <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" /> Endereço da filial
          </h2>
          <div className="grid gap-4 sm:grid-cols-6">
            <Input
              label="CEP"
              required
              inputMode="numeric"
              containerClassName="sm:col-span-2"
              placeholder="00000-000"
              hint={cepLoading ? 'Buscando endereço…' : undefined}
              error={errors.cep?.message}
              {...register('cep', {
                onChange: (e) => {
                  const masked = maskCep(e.target.value);
                  setValue('cep', masked);
                  if (masked.length === 9) void onCep(masked);
                },
              })}
            />
            <Input label="Rua" containerClassName="sm:col-span-4" error={errors.street?.message} {...register('street')} />
            <Input label="Número" required inputMode="numeric" containerClassName="sm:col-span-2" error={errors.number?.message} {...register('number')} />
            <Input label="Complemento" containerClassName="sm:col-span-4" error={errors.complement?.message} {...register('complement')} />
            <Input label="Bairro" containerClassName="sm:col-span-2" error={errors.neighborhood?.message} {...register('neighborhood')} />
            <Input label="Cidade" required containerClassName="sm:col-span-3" error={errors.city?.message} {...register('city')} />
            <Select label="UF" required containerClassName="sm:col-span-1" error={errors.state?.message} {...register('state')}>
              <option value="">—</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </div>
        </Card>
        <Button type="submit" size="lg" block loading={saving}>
          Criar barbearia e começar o teste
        </Button>
        <p className="text-center text-xs text-ink-variant">Depois você configura serviços, barbeiros e horários no painel.</p>
      </form>
    </div>
  );
};

export default OnboardingPage;
