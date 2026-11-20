// FE-08: cadastro do dono (sem frame — mesmo layout do Cadastro 1:892). Conta + barbearia + trial de 14 dias,
// sem cobrança no cadastro (POST /api/auth/register-owner). Depois segue para o painel, que conduz o onboarding.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Alert, Checkbox, Input, Spinner } from '@/components/ui';
import { APP_URL, TERMS_VERSION } from '@/config/env';
import { AuthFooterLink, AuthHeader, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { ownerSignupSchema, slugify } from '@/features/auth-screens/schemas';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { loginWithGoogle, startSession } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { authHttp } from '@/services/http';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';

type FormValues = z.infer<typeof ownerSignupSchema>;

const PERKS = ['14 dias grátis — nenhuma cobrança no cadastro', 'Página de agendamento online pronta', 'Escolha um plano só quando quiser continuar'];

const OwnerSignupPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState, watch, getValues, setError: setFieldError } = useForm<FormValues>({
    resolver: zodResolver(ownerSignupSchema),
    defaultValues: { slug: '' },
  });
  usePageTitle('Cadastre sua barbearia');
  const shopName = watch('shopName') || '';
  const slug = watch('slug') || slugify(shopName);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { data } = await authHttp.post<{ token: string }>('/register-owner', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        terms_version: TERMS_VERSION,
        barbershop: { name: values.shopName, ...(values.slug ? { slug: values.slug } : {}) },
      });
      await dispatch(startSession(data.token)).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const fields = fieldErrors(err);
      if (fields['barbershop.slug']) setFieldError('slug', { message: fields['barbershop.slug'] });
      if (fields['barbershop.name']) setFieldError('shopName', { message: fields['barbershop.name'] });
      (['name', 'email', 'phone', 'password'] as const).forEach((field) => fields[field] && setFieldError(field, { message: fields[field] }));
      setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    const values = getValues();
    if (!values.shopName?.trim() || !values.phone?.trim()) {
      setError('Preencha o nome da barbearia e o celular antes de continuar com o Google.');
      return;
    }
    setError(null);
    try {
      await dispatch(loginWithGoogle({ id_token: idToken, intent: 'signup-owner', phone: values.phone, barbershop: { name: values.shopName } })).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader title="Cadastre sua barbearia" subtitle="Comece hoje o seu teste grátis de 14 dias." />
      <ul className="flex flex-col gap-2 rounded-xl bg-surface-low p-4 text-sm text-ink-variant">
        {PERKS.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" /> {item}
          </li>
        ))}
      </ul>
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input label="Nome da barbearia" placeholder="Ex: Barbearia Clássica" error={formState.errors.shopName?.message} {...register('shopName')} />
        <Input
          label="Endereço da sua página"
          placeholder={slugify(shopName) || 'minha-barbearia'}
          hint={`${APP_URL.replace(/^https?:\/\//, '')}/b/${slug || 'minha-barbearia'}`}
          error={formState.errors.slug?.message}
          autoCapitalize="off"
          {...register('slug')}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Seu nome" autoComplete="name" placeholder="Ex: João da Silva" error={formState.errors.name?.message} {...register('name')} />
          <Input label="Celular (WhatsApp)" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" error={formState.errors.phone?.message} {...register('phone')} />
        </div>
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" placeholder="contato@barbearia.com" error={formState.errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="new-password" placeholder="••••••••" hint="Pelo menos 8 caracteres." error={formState.errors.password?.message} {...register('password')} />
        <Checkbox
          error={formState.errors.terms?.message}
          label={
            <>
              Li e aceito os{' '}
              <Link to="/termos" target="_blank" className="font-semibold text-primary-600 underline">
                termos de uso
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" target="_blank" className="font-semibold text-primary-600 underline">
                política de privacidade
              </Link>
              .
            </>
          }
          {...register('terms')}
        />
        <button type="submit" className={authPrimaryButton('mt-2')} disabled={formState.isSubmitting} aria-busy={formState.isSubmitting || undefined}>
          {formState.isSubmitting ? <Spinner className="h-4 w-4" /> : null}
          Começar teste grátis
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <p className="text-center text-xs text-ink-variant">Sem cartão de crédito. Ao fim do teste, você escolhe o plano no painel.</p>
      </form>
      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <AuthFooterLink text="Já tem conta?" to="/login" label="Entrar agora" />
    </div>
  );
};

export default OwnerSignupPage;
