// Confirmação da troca de e-mail (link enviado ao novo endereço — BE-29).
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailWarning } from 'lucide-react';

import { Card, Spinner } from '@/components/ui';
import { sessionExpired } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import { authHttp, setAccessToken } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

const ConfirmEmailChangePage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const dispatch = useAppDispatch();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Link incompleto.');
  const started = useRef(false);

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
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card className="text-center">
        {state === 'loading' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-slate-600">
            <Spinner className="h-8 w-8 text-primary-600" /> Confirmando…
          </div>
        ) : state === 'ok' ? (
          <div className="py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">E-mail alterado</h1>
            <p className="mt-2 text-slate-600">Entre novamente usando o novo e-mail.</p>
            <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-600 px-6 font-semibold text-white hover:bg-primary-700">
              Entrar
            </Link>
          </div>
        ) : (
          <div className="py-4">
            <MailWarning className="mx-auto h-12 w-12 text-warning-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">Não foi possível alterar</h1>
            <p className="mt-2 text-slate-600">{message}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConfirmEmailChangePage;
