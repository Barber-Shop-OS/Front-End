// FE-28: aceitar convite de barbeiro (/convite/:token).
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Alert, Button, Card, ErrorState, Input, ListSkeleton } from '@/components/ui';
import { login, refreshMe } from '@/features/auth/authSlice';
import { useAuth } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import http from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

interface Preview {
  barbershop: { name: string; slug: string };
  branch: { id: number; name: string };
  email: string;
  has_account: boolean;
}

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  password: z.string().min(8, 'Mínimo de 8 caracteres').max(72),
});

const AcceptInvitationPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  useEffect(() => {
    http
      .get<Preview>(`/invitations/${encodeURIComponent(token)}`)
      .then((response) => setPreview(response.data))
      .catch(setLoadError);
  }, [token]);

  const acceptLoggedIn = async () => {
    setAccepting(true);
    setError(null);
    try {
      await http.post(`/invitations/${encodeURIComponent(token)}/accept`, {});
      await dispatch(refreshMe());
      navigate('/barbeiro', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setAccepting(false);
    }
  };

  const acceptNewAccount = form.handleSubmit(async ({ name, password }) => {
    setError(null);
    try {
      await http.post(`/invitations/${encodeURIComponent(token)}/accept`, { name, password });
      // Login normal para abrir a sessão com refresh token.
      await dispatch(login({ email: preview?.email ?? '', password })).unwrap();
      navigate('/barbeiro', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      {loadError ? (
        <ErrorState error={loadError} title="Convite indisponível" />
      ) : !preview ? (
        <ListSkeleton rows={3} />
      ) : (
        <Card>
          <h1 className="text-2xl font-black text-slate-900">Convite para a equipe</h1>
          <p className="mt-2 text-slate-600">
            <strong>{preview.barbershop.name}</strong> convidou <strong>{preview.email}</strong> para atender na filial <strong>{preview.branch.name}</strong>.
          </p>
          {error ? (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          ) : null}
          {isAuthenticated ? (
            user?.email === preview.email ? (
              <Button className="mt-6" size="lg" block onClick={acceptLoggedIn} loading={accepting}>
                Aceitar convite
              </Button>
            ) : (
              <Alert tone="warning" className="mt-6">
                Você está logado como {user?.email}. Saia e entre com {preview.email} para aceitar.
              </Alert>
            )
          ) : preview.has_account ? (
            <div className="mt-6">
              <p className="text-sm text-slate-600">Você já tem conta com este e-mail. Entre para aceitar o convite.</p>
              <Link to="/login" state={{ from: `/convite/${token}` }} className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-600 font-semibold text-white hover:bg-primary-700">
                Entrar e aceitar
              </Link>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={acceptNewAccount} noValidate>
              <Input label="Seu nome" autoComplete="name" error={form.formState.errors.name?.message} {...form.register('name')} />
              <Input label="Crie uma senha" type="password" autoComplete="new-password" error={form.formState.errors.password?.message} {...form.register('password')} />
              <Button type="submit" size="lg" block loading={form.formState.isSubmitting}>
                Criar conta e aceitar
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
};

export default AcceptInvitationPage;
