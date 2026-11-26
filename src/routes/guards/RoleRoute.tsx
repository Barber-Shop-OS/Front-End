import { Navigate, Outlet } from "react-router-dom";

import FullScreenLoader from "@/components/FullScreenLoader";
import { selectAuthRole, selectAuthStatus } from "@/features/auth/selectors";
import { useAppSelector } from "@/hooks/redux";
import type { UserRole } from "@/types";
import { DEFAULT_HOME, ROLE_HOME } from "./constants";

interface RoleRouteProps {
  /** Roles com permissão de acesso à rota */
  allowedRoles: UserRole[];
  /** Rota de fallback caso o usuário não tenha role permitida */
  fallbackPath?: string;
}

/**
 * Guard de autenticação + role.
 * - Durante o bootstrap de sessão (idle/loading), exibe loader.
 * - Usuário não autenticado -> /login
 * - Usuário autenticado sem role reconhecida -> redireciona (nega acesso).
 * - Usuário com role não permitida -> redireciona para a home do seu perfil.
 */
const RoleRoute = ({
  allowedRoles,
  fallbackPath,
}: RoleRouteProps): JSX.Element => {
  const status = useAppSelector(selectAuthStatus);
  const userRole = useAppSelector(selectAuthRole);

  if (status === "idle" || status === "loading") {
    return <FullScreenLoader />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  // Sem role reconhecida não há permissão: nunca liberar por padrão.
  if (!userRole) {
    return <Navigate to={fallbackPath ?? "/"} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    const homePath = ROLE_HOME[userRole] ?? fallbackPath ?? DEFAULT_HOME;
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
