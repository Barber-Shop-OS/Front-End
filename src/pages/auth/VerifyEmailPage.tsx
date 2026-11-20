// FE-26: confirmação de e-mail (/verify-email?token=). Acessível logado ou não.
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailWarning } from 'lucide-react';

import { Button, Card, Spinner, useToast } from '@/components/ui';
import { refreshMe } from '@/features/auth/authSlice';
import { homePathFor, useAuth } from '@/features/auth/hooks';
import { useAppDispatch } from '@/hooks/redux';
import { authHttp } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Link de confirmação incompleto.');
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
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

  const resend = async () => {
    try {
      await authHttp.post('/resend-verification');
      toast.success('Enviamos um novo link para o seu e-mail.');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card className="text-center">
        {state === 'loading' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-slate-600">
            <Spinner className="h-8 w-8 text-primary-600" /> Confirmando seu e-mail…
          </div>
        ) : state === 'ok' ? (
          <div className="py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">E-mail confirmado!</h1>
            <p className="mt-2 text-slate-600">Tudo certo com a sua conta.</p>
            <Link to={isAuthenticated ? homePathFor(user) : '/login'} className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-600 px-6 font-semibold text-white hover:bg-primary-700">
              {isAuthenticated ? 'Continuar' : 'Entrar'}
            </Link>
          </div>
        ) : (
          <div className="py-4">
            <MailWarning className="mx-auto h-12 w-12 text-warning-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black text-slate-900">Não foi possível confirmar</h1>
            <p className="mt-2 text-slate-600">{message}</p>
            {isAuthenticated ? (
              <Button className="mt-6" onClick={resend}>
                Enviar novo link
              </Button>
            ) : (
              <p className="mt-6 text-sm text-muted">
                <Link to="/login" state={{ from: '/conta' }} className="font-semibold text-primary-700 underline">
                  Entre
                </Link>{' '}
                para pedir um novo link.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
