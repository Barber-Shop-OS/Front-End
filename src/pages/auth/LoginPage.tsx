// Login (Figma 1:470). FE-01: volta para a página de origem (state.from — ex.: o agendamento); FE-27: Google.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert, Input, Spinner } from '@/components/ui';
import { AuthFooterLink, AuthHeader, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { loginSchema } from '@/features/auth-screens/schemas';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { login, loginWithGoogle } from '@/features/auth/authSlice';
import { homePathFor } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage } from '@/utils/apiErrors';

type FormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });
  usePageTitle('Entrar');

  const goHome = (me: Parameters<typeof homePathFor>[0]) => navigate(from || homePathFor(me), { replace: true });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      goHome(await dispatch(login(values)).unwrap());
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    setError(null);
    try {
      const { me } = await dispatch(loginWithGoogle({ id_token: idToken, intent: 'login' })).unwrap();
      goHome(me);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title="Bem-vindo de volta"
        subtitle={from?.includes('/agendar') ? 'Entre para finalizar o seu agendamento. Sua escolha foi guardada.' : 'Acesse sua conta para continuar.'}
      />
      <form className="flex flex-col gap-6 pt-4" onSubmit={onSubmit} noValidate>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" placeholder="seu@email.com.br" error={formState.errors.email?.message} {...register('email')} />
        <div className="relative pb-2">
          <Input label="Senha" type="password" autoComplete="current-password" placeholder="••••••••" error={formState.errors.password?.message} {...register('password')} />
          <Link to="/recuperar-senha" className="absolute right-0 top-0 text-sm font-semibold leading-4 text-primary-600 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <button type="submit" className={authPrimaryButton()} disabled={formState.isSubmitting} aria-busy={formState.isSubmitting || undefined}>
          {formState.isSubmitting ? <Spinner className="h-4 w-4" /> : null}
          Entrar na Plataforma
        </button>
      </form>
      <GoogleButton onCredential={onGoogle} text="signin_with" />
      <div className="flex flex-col gap-2">
        <AuthFooterLink text="Ainda não possui acesso?" to="/signup" label="Criar conta" state={location.state} />
        <AuthFooterLink text="Tem uma barbearia?" to="/cadastro-barbearia" label="Teste grátis por 14 dias" />
      </div>
    </div>
  );
};

export default LoginPage;
