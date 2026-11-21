// Login (Figma 1:470). FE-01: volta para a página de origem (state.from — ex.: o agendamento); FE-27: Google;
// SEC-27: com 2FA ativo, segunda etapa com o código do app autenticador (ou um código de recuperação).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert, Input, Spinner } from '@/components/ui';
import { AuthFooterLink, AuthHeader, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { loginSchema } from '@/features/auth-screens/schemas';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { challengeTokenOf, login, loginWithGoogle, verifyTwoFactor } from '@/features/auth/authSlice';
import { homePathFor } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';

type FormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });
  usePageTitle('Entrar');

  const goHome = (me: Parameters<typeof homePathFor>[0]) => navigate(from || homePathFor(me), { replace: true });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      goHome(await dispatch(login(values)).unwrap());
    } catch (err) {
      const token = challengeTokenOf(err);
      if (token) setChallenge(token);
      else setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    setError(null);
    try {
      const { me } = await dispatch(loginWithGoogle({ id_token: idToken, intent: 'login' })).unwrap();
      goHome(me);
    } catch (err) {
      const token = challengeTokenOf(err);
      if (token) setChallenge(token);
      else setError(apiErrorMessage(err));
    }
  };

  if (challenge) {
    return (
      <TwoFactorStep
        challengeToken={challenge}
        onDone={goHome}
        onRestart={() => {
          setChallenge(null);
          setError('O tempo para digitar o código acabou. Entre de novo.');
        }}
        onCancel={() => setChallenge(null)}
      />
    );
  }

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

/** SEC-27: segunda etapa do login (desafio de 5 min). */
const TwoFactorStep = ({
  challengeToken,
  onDone,
  onRestart,
  onCancel,
}: {
  challengeToken: string;
  onDone: (me: Parameters<typeof homePathFor>[0]) => void;
  onRestart: () => void;
  onCancel: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [useRecovery, setUseRecovery] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  usePageTitle('Verificação em duas etapas');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = value.trim();
    if (!code) return setError(useRecovery ? 'Digite um código de recuperação.' : 'Digite o código de 6 dígitos.');
    setBusy(true);
    setError(null);
    try {
      const me = await dispatch(verifyTwoFactor(useRecovery ? { challenge_token: challengeToken, recovery_code: code } : { challenge_token: challengeToken, code })).unwrap();
      onDone(me);
    } catch (err) {
      if (errorCode(err) === 'TOKEN_INVALID_OR_EXPIRED') return onRestart();
      setError(apiErrorMessage(err));
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title="Verificação em duas etapas"
        subtitle={useRecovery ? 'Digite um dos códigos de recuperação que você guardou ao ativar a verificação.' : 'Abra o app autenticador e digite o código de 6 dígitos do BarberOS.'}
      />
      <form className="flex flex-col gap-6 pt-4" onSubmit={submit} noValidate>
        {error ? <Alert tone="error">{error}</Alert> : null}
        {useRecovery ? (
          <Input key="recovery" label="Código de recuperação" autoComplete="off" autoCapitalize="characters" placeholder="ABCDE-12345" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        ) : (
          <Input
            key="totp"
            label="Código"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoFocus
          />
        )}
        <button type="submit" className={authPrimaryButton()} disabled={busy} aria-busy={busy || undefined}>
          {busy ? <Spinner className="h-4 w-4" /> : null}
          Verificar e entrar
        </button>
      </form>
      <div className="flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          className="font-semibold text-primary-600 hover:underline"
          onClick={() => {
            setUseRecovery((v) => !v);
            setValue('');
            setError(null);
          }}
        >
          {useRecovery ? 'Usar o código do app autenticador' : 'Perdeu o celular? Use um código de recuperação'}
        </button>
        <button type="button" className="text-ink-variant hover:underline" onClick={onCancel}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
