// FE-01: guards de rota. Sem fallback permissivo: sem sessão → /login (guardando a página de origem);
// sem acesso à área → página inicial do próprio perfil.
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ButtonLink, EmptyState, FullScreenLoader } from '@/components/ui';
import { homePathFor, useAuth, type Area } from '@/features/auth/hooks';

export const RequireAuth = ({ areas }: { areas?: Area[] }) => {
  const { status, user, areas: userAreas } = useAuth();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;
  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (areas && !areas.some((area) => userAreas.includes(area))) {
    return <Navigate to={homePathFor(user)} replace />;
  }
  return <Outlet />;
};

/** SEC-27: a API barra /api/admin sem 2FA (TWO_FACTOR_SETUP_REQUIRED); a tela leva direto à ativação. */
export const RequireAdminTwoFactor = () => {
  const { user } = useAuth();
  if (user?.role === 'admin' && user.two_factor_enabled === false) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <EmptyState
          title="Ative a verificação em duas etapas"
          description="Por segurança, a administração da plataforma só abre com a verificação em duas etapas ativa na sua conta."
          action={<ButtonLink to="/conta#seguranca">Ativar agora</ButtonLink>}
        />
      </div>
    );
  }
  return <Outlet />;
};

/** Login/cadastro: quem já está logado vai para a própria área. */
export const PublicOnly = () => {
  const { status, user } = useAuth();
  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
};
