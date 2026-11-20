// FE-28: aceitar convite (/convite/:token → GET /invitations/{token} + POST /invitations/{token}/accept).
// Sem frame: mesmo cartão das telas de entrada. Serve para barbeiro e para novos papéis de membro (o preview pode
// trazer `role`; sem ele, é convite de barbeiro — contrato atual da API).
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { MailWarning, UserPlus } from 'lucide-react';

import { Alert, Input, Skeleton, Spinner } from '@/components/ui';
import { AuthCard, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { invitationAccountSchema } from '@/features/auth-screens/schemas';
import { login, logout, refreshMe } from '@/features/auth/authSlice';
import { homePathFor, useAuth } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import http from '@/services/http';
import type { Me } from '@/types/api';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';

type InvitationRole = 'barber' | 'manager' | 'receptionist';

interface Preview {
  barbershop: { name: string; slug: string };
  branch: { id: number; name: string } | null;
  email: string;
  has_account: boolean;
  role?: InvitationRole;
  expires_at?: string;
}

const ROLE_TEXT: Record<InvitationRole, string> = {
  barber: 'atender como barbeiro',
  manager: 'gerenciar a barbearia',
  receptionist: 'trabalhar no atendimento',
};

const destinationFor = (role: InvitationRole, me: Me | null) => {
  if (role === 'barber') return '/barbeiro';
  if (role === 'receptionist') return '/atendimento';
  return homePathFor(me);
};

const Shell = ({ children }: { children: React.ReactNode }) => <div className="mx-auto w-full max-w-[448px] px-4 py-12 sm:py-16">{children}</div>;

const AcceptInvitationPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [error, setError] = useState<{ message: string; loginRequired: boolean } | null>(null);
  const [accepting, setAccepting] = useState(false);
  const form = useForm<z.infer<typeof invitationAccountSchema>>({ resolver: zodResolver(invitationAccountSchema) });
  usePageTitle('Convite para a equipe');

  useEffect(() => {
    let active = true;
    http
      .get<Preview>(`/invitations/${encodeURIComponent(token)}`)
      .then((response) => active && setPreview(response.data))
      .catch((err) => active && setLoadError(err));
    return () => {
      active = false;
    };
  }, [token]);

  const role: InvitationRole = preview?.role ?? 'barber';
  const fail = (err: unknown) => setError({ message: apiErrorMessage(err), loginRequired: errorCode(err) === 'LOGIN_REQUIRED' });

  const acceptLoggedIn = async () => {
    setAccepting(true);
    setError(null);
    try {
      await http.post(`/invitations/${encodeURIComponent(token)}/accept`, {});
      const me = await dispatch(refreshMe()).unwrap();
      navigate(destinationFor(role, me), { replace: true });
    } catch (err) {
      fail(err);
    } finally {
      setAccepting(false);
    }
  };

  const acceptNewAccount = form.handleSubmit(async ({ name, password }) => {
    setError(null);
    try {
      await http.post(`/invitations/${encodeURIComponent(token)}/accept`, { name, password });
      // Login normal para abrir a sessão com refresh token (cookie httpOnly).
      const me = await dispatch(login({ email: preview?.email ?? '', password })).unwrap();
      navigate(destinationFor(role, me), { replace: true });
    } catch (err) {
      fail(err);
    }
  });

  if (loadError) {
    return (
      <Shell>
        <AuthCard icon={<MailWarning className="h-8 w-8" />} tone="danger" title="Convite indisponível" description={apiErrorMessage(loadError, 'Este convite expirou, foi cancelado ou já foi usado.')}>
          <p className="text-center text-sm text-ink-variant">Peça para a barbearia enviar um novo convite.</p>
        </AuthCard>
      </Shell>
    );
  }

  if (!preview) {
    return (
      <Shell>
        <div className="rounded-xl bg-surface-lowest p-10 shadow-soft" aria-busy="true" aria-label="Carregando convite">
          <Skeleton className="mx-auto h-16 w-16" />
          <Skeleton className="mx-auto mt-6 h-7 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-8 h-12 w-full" />
        </div>
      </Shell>
    );
  }

  const loginLink = (
    <Link to="/login" state={{ from: `/convite/${token}` }} className={authPrimaryButton()}>
      Entrar e aceitar
    </Link>
  );

  return (
    <Shell>
      <AuthCard
        icon={<UserPlus className="h-8 w-8" />}
        title="Convite para a equipe"
        description={
          <>
            <strong className="text-ink">{preview.barbershop.name}</strong> convidou <strong className="text-ink">{preview.email}</strong> para {ROLE_TEXT[role]}
            {preview.branch ? (
              <>
                {' '}
                na unidade <strong className="text-ink">{preview.branch.name}</strong>
              </>
            ) : null}
            .
          </>
        }
      >
        <div className="flex flex-col gap-6">
          {error ? (
            <Alert tone="error" action={error.loginRequired && !isAuthenticated ? <Link to="/login" state={{ from: `/convite/${token}` }} className="text-sm font-semibold underline">Entrar</Link> : null}>
              {error.message}
            </Alert>
          ) : null}
          {isAuthenticated ? (
            user?.email?.toLowerCase() === preview.email.toLowerCase() ? (
              <button type="button" className={authPrimaryButton()} onClick={acceptLoggedIn} disabled={accepting} aria-busy={accepting || undefined}>
                {accepting ? <Spinner className="h-4 w-4" /> : null}
                Aceitar convite
              </button>
            ) : (
              <>
                <Alert tone="warning">
                  Você está conectado como <strong>{user?.email}</strong>. Saia e entre com {preview.email} para aceitar.
                </Alert>
                <button type="button" className={authPrimaryButton()} onClick={() => dispatch(logout())}>
                  Sair desta conta
                </button>
              </>
            )
          ) : preview.has_account ? (
            <>
              <p className="text-center text-sm text-ink-variant">Você já tem conta com este e-mail. Entre para aceitar o convite.</p>
              {loginLink}
            </>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={acceptNewAccount} noValidate>
              <Input label="E-mail" value={preview.email} readOnly disabled />
              <Input label="Seu nome" autoComplete="name" placeholder="Ex: João da Silva" error={form.formState.errors.name?.message} {...form.register('name')} />
              <Input label="Crie uma senha" type="password" autoComplete="new-password" placeholder="••••••••" hint="Pelo menos 8 caracteres." error={form.formState.errors.password?.message} {...form.register('password')} />
              <button type="submit" className={authPrimaryButton()} disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting || undefined}>
                {form.formState.isSubmitting ? <Spinner className="h-4 w-4" /> : null}
                Criar conta e aceitar
              </button>
            </form>
          )}
        </div>
      </AuthCard>
    </Shell>
  );
};

export default AcceptInvitationPage;
