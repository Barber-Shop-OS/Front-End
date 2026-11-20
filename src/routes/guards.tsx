// FE-01: guards de rota. Sem fallback permissivo: sem sessão → /login (guardando a página de origem);
// sem acesso à área → página inicial do próprio perfil.
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullScreenLoader } from '@/components/ui';
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

/** Login/cadastro: quem já está logado vai para a própria área. */
export const PublicOnly = () => {
  const { status, user } = useAuth();
  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
};
