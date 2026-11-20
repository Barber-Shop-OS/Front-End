// Layout das telas de entrada. Login/cadastro (Figma 1:470, 1:892) usam o layout dividido com a imagem editorial;
// recuperação de senha e verificação de e-mail (1:2, 1:427) usam o cartão centralizado.
import { Outlet, useLocation } from 'react-router-dom';

import { CenteredAuthShell, SplitAuthShell } from '@/features/auth-screens/AuthUI';

const CENTERED_ROUTES = ['/recuperar-senha', '/verify-email', '/confirmar-email'];

export const AuthLayout = () => {
  const { pathname } = useLocation();
  const Shell = CENTERED_ROUTES.includes(pathname) || pathname.startsWith('/convite/') ? CenteredAuthShell : SplitAuthShell;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
};

export default AuthLayout;
