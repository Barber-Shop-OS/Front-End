// Cadastro de cliente (Figma 1:892). FE-41: aceite dos termos com versão; FE-27: Google.
// Preserva state.from: quem vem do agendamento volta para finalizar a reserva.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Alert, Checkbox, Input, Spinner } from '@/components/ui';
import { TERMS_VERSION } from '@/config/env';
import { AuthFooterLink, AuthHeader, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { signupSchema } from '@/features/auth-screens/schemas';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { login, loginWithGoogle } from '@/features/auth/authSlice';
import { homePathFor } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { authHttp } from '@/services/http';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';

type FormValues = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState, setError: setFieldError } = useForm<FormValues>({ resolver: zodResolver(signupSchema) });
  usePageTitle('Criar conta');

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError(null);
    try {
      await authHttp.post('/register', { name, email, password, terms_version: TERMS_VERSION });
      const me = await dispatch(login({ email, password })).unwrap();
      navigate(from || homePathFor(me), { replace: true });
    } catch (err) {
      const fields = fieldErrors(err);
      (['name', 'email', 'password'] as const).forEach((field) => fields[field] && setFieldError(field, { message: fields[field] }));
      setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    setError(null);
    try {
      const { me } = await dispatch(loginWithGoogle({ id_token: idToken, intent: 'signup-client' })).unwrap();
      navigate(from || homePathFor(me), { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader
        title="Criar Conta"
        subtitle={from?.includes('/agendar') ? 'Cadastro rápido para finalizar o seu agendamento.' : 'O primeiro passo para a precisão digital.'}
      />
      <form className="flex flex-col gap-5 pt-6" onSubmit={onSubmit} noValidate>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input label="Nome completo" autoComplete="name" placeholder="Ex: João da Silva" error={formState.errors.name?.message} {...register('name')} />
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" placeholder="seu@email.com.br" error={formState.errors.email?.message} {...register('email')} />
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
          Criar Conta
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <AuthFooterLink text="Já tem uma conta?" to="/login" label="Entrar agora" state={location.state} />
    </div>
  );
};

export default SignupPage;
