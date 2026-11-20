// Cadastro de cliente (FE-41: aceite dos termos com versão; FE-27: Google).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { TERMS_VERSION } from '@/config/env';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { login, loginWithGoogle } from '@/features/auth/authSlice';
import { homePathFor } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { authHttp } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Aceite os termos para continuar' }) }),
});
type FormValues = z.infer<typeof schema>;

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError(null);
    try {
      await authHttp.post('/register', { name, email, password, terms_version: TERMS_VERSION });
      const me = await dispatch(login({ email, password })).unwrap();
      navigate(from || homePathFor(me), { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    try {
      const { me } = await dispatch(loginWithGoogle({ id_token: idToken, intent: 'signup-client' })).unwrap();
      navigate(from || homePathFor(me), { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Criar conta</h1>
      <p className="mt-2 text-sm text-muted">Agende em segundos e acompanhe seus horários.</p>
      {error ? (
        <Alert tone="error" className="mt-6">
          {error}
        </Alert>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Nome" autoComplete="name" error={formState.errors.name?.message} {...register('name')} />
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" error={formState.errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="new-password" hint="Pelo menos 8 caracteres." error={formState.errors.password?.message} {...register('password')} />
        <Checkbox
          error={formState.errors.terms?.message}
          label={
            <>
              Li e aceito os{' '}
              <Link to="/termos" target="_blank" className="font-semibold text-primary-700 underline">
                termos de uso
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" target="_blank" className="font-semibold text-primary-700 underline">
                política de privacidade
              </Link>
              .
            </>
          }
          {...register('terms')}
        />
        <Button type="submit" size="lg" block loading={formState.isSubmitting}>
          Criar conta
        </Button>
      </form>
      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-primary-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
