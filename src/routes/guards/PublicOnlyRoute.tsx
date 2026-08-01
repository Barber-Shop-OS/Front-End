import { Navigate, Outlet } from "react-router-dom";

import FullScreenLoader from "@/components/FullScreenLoader";
import { selectAuthRole, selectAuthStatus } from "@/features/auth/selectors";
import { useAppSelector } from "@/hooks/redux";
import { DEFAULT_HOME, ROLE_HOME } from "./constants";

/**
 * Guard para rotas exclusivas de usuários NÃO autenticados
 * (ex: /login, /signup, /verify-email, /recuperar-senha).
 * - Durante o bootstrap de sessão (idle/loading), exibe loader.
 * - Se já estiver autenticado, redireciona para a home do seu perfil.
 */
const PublicOnlyRoute = (): JSX.Element => {
  const status = useAppSelector(selectAuthStatus);
  const userRole = useAppSelector(selectAuthRole);

  if (status === "idle" || status === "loading") {
    return <FullScreenLoader />;
  }

  if (status !== "authenticated") {
    return <Outlet />;
  }

  const homePath = userRole ? ROLE_HOME[userRole] : DEFAULT_HOME;
  return <Navigate to={homePath} replace />;
};

export default PublicOnlyRoute;
