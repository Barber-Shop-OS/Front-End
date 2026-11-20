// Login (FE-01: volta para a página de origem; FE-27: Google).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert, Button, Input } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { login, loginWithGoogle } from '@/features/auth/authSlice';
import { homePathFor } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { apiErrorMessage } from '@/utils/apiErrors';

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
});
type FormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Entrar</h1>
      <p className="mt-2 text-sm text-muted">Acesse sua conta para agendar ou gerenciar sua barbearia.</p>
      {error ? (
        <Alert tone="error" className="mt-6">
          {error}
        </Alert>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" error={formState.errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register('password')} />
        <div className="flex justify-end">
          <Link to="/recuperar-senha" className="text-sm font-semibold text-primary-700 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" size="lg" block loading={formState.isSubmitting}>
          Entrar
        </Button>
      </form>
      <GoogleButton onCredential={onGoogle} text="signin_with" />
      <div className="mt-8 space-y-2 text-center text-sm text-muted">
        <p>
          Novo por aqui?{' '}
          <Link to="/signup" state={location.state} className="font-semibold text-primary-700 hover:underline">
            Criar conta de cliente
          </Link>
        </p>
        <p>
          Tem uma barbearia?{' '}
          <Link to="/cadastro-barbearia" className="font-semibold text-primary-700 hover:underline">
            Teste grátis por 14 dias
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
