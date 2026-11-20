// FE-25: recuperação de senha — passo 1 (e-mail, resposta neutra) e passo 2 (?token= → nova senha).
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Alert, Button, Input } from '@/components/ui';
import { authHttp } from '@/services/http';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';

const emailSchema = z.object({ email: z.string().trim().email('Informe um e-mail válido') });
const resetSchema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres').max(72),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, { message: 'As senhas não conferem', path: ['confirm'] });

const RequestStep = () => {
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null);
    try {
      const { data } = await authHttp.post<{ message: string }>('/forgot-password', { email });
      setSent(data.message);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Esqueci minha senha</h1>
      <p className="mt-2 text-sm text-muted">Informe o e-mail da conta. Se ela existir, enviaremos um link para criar uma nova senha.</p>
      {sent ? (
        <Alert tone="success" className="mt-6">
          {sent}
        </Alert>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input label="E-mail" type="email" autoComplete="email" inputMode="email" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Button type="submit" size="lg" block loading={form.formState.isSubmitting}>
            Enviar link
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
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
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Nova senha</h1>
      {done ? (
        <Alert tone="success" className="mt-6">
          Senha redefinida! Redirecionando para o login…
        </Alert>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {error ? (
            <Alert tone="error" action={error.gone ? <Link to="/recuperar-senha" className="text-sm font-semibold underline">Pedir novo link</Link> : null}>
              {error.message}
            </Alert>
          ) : null}
          <Input label="Nova senha" type="password" autoComplete="new-password" error={form.formState.errors.password?.message} {...form.register('password')} />
          <Input label="Confirme a nova senha" type="password" autoComplete="new-password" error={form.formState.errors.confirm?.message} {...form.register('confirm')} />
          <Button type="submit" size="lg" block loading={form.formState.isSubmitting}>
            Salvar nova senha
          </Button>
        </form>
      )}
    </div>
  );
};

const PasswordRecoveryPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <ResetStep token={token} /> : <RequestStep />;
};

export default PasswordRecoveryPage;
