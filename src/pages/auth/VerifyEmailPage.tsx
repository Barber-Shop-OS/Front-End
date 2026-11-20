// Verificação de e-mail (Figma 1:427). FE-26: com ?token= confirma; sem token mostra "verifique seu e-mail" e
// permite reenviar o link. A API trabalha com link (não com o código de 6 dígitos do Figma).
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, MailWarning } from 'lucide-react';

import { Spinner, useToast } from '@/components/ui';
import { AuthCard, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { refreshMe } from '@/features/auth/authSlice';
import { homePathFor, useAuth } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { authHttp } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

const ResendBlock = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await authHttp.post<{ already_verified?: boolean; message?: string }>('/resend-verification');
      if (data?.already_verified) {
        await dispatch(refreshMe());
        toast.success('Seu e-mail já está confirmado.');
      } else {
        toast.success(data?.message || 'Enviamos um novo link para o seu e-mail.');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-1 border-t border-surface-high pt-6 text-center text-sm">
      <span className="text-ink-variant">Não recebeu o e-mail?</span>
      {isAuthenticated ? (
        <button type="button" className="inline-flex min-h-[40px] items-center gap-2 font-semibold text-primary-600 hover:underline disabled:opacity-60" onClick={resend} disabled={sending}>
          {sending ? <Spinner className="h-4 w-4" /> : null} Reenviar link de confirmação
        </button>
      ) : (
        <Link to="/login" state={{ from: '/verify-email' }} className="inline-flex min-h-[40px] items-center font-semibold text-primary-600 hover:underline">
          Entre para pedir um novo link
        </Link>
      )}
    </div>
  );
};

const ConfirmToken = ({ token }: { token: string }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    authHttp
      .post('/verify-email', { token })
      .then(() => {
        setState('ok');
        if (isAuthenticated) dispatch(refreshMe());
      })
      .catch((error) => {
        setState('error');
        setMessage(apiErrorMessage(error));
      });
  }, [token, isAuthenticated, dispatch]);

  if (state === 'loading') {
    return (
      <AuthCard icon={<Spinner className="h-8 w-8" />} title="Confirmando seu e-mail…" description="Só um instante." />
    );
  }
  if (state === 'ok') {
    return (
      <AuthCard icon={<CheckCircle2 className="h-8 w-8" />} tone="success" title="E-mail confirmado!" description="Tudo certo com a sua conta. Você já pode agendar e receber os lembretes.">
        <Link to={isAuthenticated ? homePathFor(user) : '/login'} className={authPrimaryButton()}>
          {isAuthenticated ? 'Continuar' : 'Entrar'}
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard icon={<MailWarning className="h-8 w-8" />} tone="danger" title="Não foi possível confirmar" description={message}>
      <ResendBlock />
    </AuthCard>
  );
};

const CheckInbox = () => {
  const { isAuthenticated, user } = useAuth();
  const verified = !!user?.email_verified_at;
  return (
    <AuthCard
      icon={<MailCheck className="h-8 w-8" />}
      tone={verified ? 'success' : 'primary'}
      title={verified ? 'E-mail já confirmado' : 'Verifique seu e-mail'}
      description={
        verified ? (
          'Sua conta já está verificada.'
        ) : (
          <>
            Enviamos um link de confirmação para {user?.email ? <strong className="text-ink">{user.email}</strong> : 'o seu e-mail'}. Abra-o para ativar sua conta.
          </>
        )
      }
    >
      {isAuthenticated ? (
        <Link to={homePathFor(user)} className={authPrimaryButton()}>
          Continuar
        </Link>
      ) : null}
      {!verified ? <ResendBlock /> : null}
    </AuthCard>
  );
};

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  usePageTitle('Verificação de e-mail');
  return token ? <ConfirmToken token={token} /> : <CheckInbox />;
};

export default VerifyEmailPage;
