// Confirmação da troca de e-mail (link enviado ao novo endereço — BE-29). Sem frame: cartão das telas de entrada.
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailWarning } from 'lucide-react';

import { Spinner } from '@/components/ui';
import { AuthCard, authPrimaryButton } from '@/features/auth-screens/AuthUI';
import { sessionExpired } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { authHttp, setAccessToken } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

const ConfirmEmailChangePage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const dispatch = useAppDispatch();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Link incompleto. Abra novamente o link enviado para o novo e-mail.');
  const started = useRef(false);
  usePageTitle('Confirmar novo e-mail');

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authHttp
      .post('/confirm-email-change', { token })
      .then(() => {
        setState('ok');
        // A troca derruba todas as sessões: entra de novo com o e-mail novo.
        setAccessToken(null);
        dispatch(sessionExpired());
      })
      .catch((error) => {
        setState('error');
        setMessage(apiErrorMessage(error));
      });
  }, [token, dispatch]);

  return (
    <div className="mx-auto w-full max-w-[448px] px-4 py-12 sm:py-16">
      {state === 'loading' ? (
        <AuthCard icon={<Spinner className="h-8 w-8" />} title="Confirmando seu novo e-mail…" description="Só um instante." />
      ) : state === 'ok' ? (
        <AuthCard icon={<CheckCircle2 className="h-8 w-8" />} tone="success" title="E-mail alterado" description="Por segurança, encerramos suas sessões. Entre novamente usando o novo e-mail.">
          <Link to="/login" className={authPrimaryButton()}>
            Entrar
          </Link>
        </AuthCard>
      ) : (
        <AuthCard icon={<MailWarning className="h-8 w-8" />} tone="danger" title="Não foi possível alterar" description={message}>
          <Link to="/conta" className="block text-center text-sm font-semibold text-primary-600 hover:underline">
            Voltar para minha conta
          </Link>
        </AuthCard>
      )}
    </div>
  );
};

export default ConfirmEmailChangePage;
