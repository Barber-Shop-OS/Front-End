// Recuperação de senha (Figma 1:2). FE-25: passo 1 (e-mail, resposta neutra) e passo 2 (?token= → nova senha).
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';

import { Alert, Input, Spinner } from '@/components/ui';
import { AuthCard, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { forgotSchema, resetSchema } from '@/features/auth-screens/schemas';
import { usePageTitle } from '@/hooks/usePageTitle';
import { authHttp } from '@/services/http';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';

const BackToLogin = () => (
  <p className="mt-6 text-center">
    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar ao login
    </Link>
  </p>
);

const SubmitButton = ({ loading, children }: { loading: boolean; children: string }) => (
  <button type="submit" className={authPrimaryButton()} disabled={loading} aria-busy={loading || undefined}>
    {loading ? <Spinner className="h-4 w-4" /> : null}
    {children}
  </button>
);

const RequestStep = () => {
  const [sent, setSent] = useState<{ email: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null);
    try {
      const { data } = await authHttp.post<{ message: string }>('/forgot-password', { email });
      setSent({ email, message: data.message });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  if (sent) {
    return (
      <AuthCard
        icon={<MailCheck className="h-8 w-8" />}
        tone="success"
        title="Verifique seu e-mail"
        description={
          <>
            {sent.message || 'Se houver uma conta com este e-mail, enviaremos um link para criar uma nova senha.'} Confira também a caixa de spam de{' '}
            <strong className="text-ink">{sent.email}</strong>.
          </>
        }
      >
        <button type="button" className="w-full text-sm font-semibold text-primary-600 hover:underline" onClick={() => setSent(null)}>
          Usar outro e-mail
        </button>
        <BackToLogin />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={<KeyRound className="h-8 w-8" />}
      title="Esqueceu sua senha?"
      description="Informe o e-mail da sua conta. Enviaremos um link seguro para você criar uma nova senha."
    >
      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input label="E-mail registrado" type="email" autoComplete="email" inputMode="email" placeholder="seu@email.com.br" error={form.formState.errors.email?.message} {...form.register('email')} />
        <SubmitButton loading={form.formState.isSubmitting}>Enviar link de recuperação</SubmitButton>
      </form>
      <BackToLogin />
    </AuthCard>
  );
};

const ResetStep = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<{ message: string; gone: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const form = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  const onSubmit = form.handleSubmit(async ({ password }) => {
    setError(null);
    try {
      await authHttp.post('/reset-password', { token, password });
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError({ message: apiErrorMessage(err), gone: errorCode(err) === 'TOKEN_INVALID_OR_EXPIRED' });
    }
  });

  if (done) {
    return (
      <AuthCard icon={<ShieldCheck className="h-8 w-8" />} tone="success" title="Senha redefinida!" description="Redirecionando para o login…">
        <Link to="/login" replace className={authPrimaryButton()}>
          Entrar agora
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={<KeyRound className="h-8 w-8" />} title="Crie uma nova senha" description="Use pelo menos 8 caracteres, combinando letras e números.">
      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        {error ? (
          <Alert
            tone="error"
            action={
              error.gone ? (
                <Link to="/recuperar-senha" className="text-sm font-semibold underline">
                  Pedir novo link
                </Link>
              ) : null
            }
          >
            {error.message}
          </Alert>
        ) : null}
        <Input label="Nova senha" type="password" autoComplete="new-password" placeholder="••••••••" error={form.formState.errors.password?.message} {...form.register('password')} />
        <Input label="Confirme a nova senha" type="password" autoComplete="new-password" placeholder="••••••••" error={form.formState.errors.confirm?.message} {...form.register('confirm')} />
        <SubmitButton loading={form.formState.isSubmitting}>Salvar nova senha</SubmitButton>
      </form>
      <BackToLogin />
    </AuthCard>
  );
};

const PasswordRecoveryPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  usePageTitle(token ? 'Nova senha' : 'Recuperar senha');
  return token ? <ResetStep token={token} /> : <RequestStep />;
};

export default PasswordRecoveryPage;
