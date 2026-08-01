import { Navigate, Outlet } from "react-router-dom";

import FullScreenLoader from "@/components/FullScreenLoader";
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
 * - Usuário autenticado sem role definida -> libera acesso (fallback atual,
 *   até o backend retornar a role).
 * - Usuário com role não permitida -> redireciona para a home do seu perfil.
 */
const RoleRoute = ({
  allowedRoles,
  fallbackPath,
}: RoleRouteProps): JSX.Element => {
  const status = useAppSelector((state) => state.auth.status);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  if (status === "idle" || status === "loading") {
    return <FullScreenLoader />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  // TODO: quando o backend passar a retornar auth.user.role, remover este
  // fallback genérico para que o acesso seja restrito às roles permitidas.
  if (!userRole) {
    return <Outlet />;
  }

  if (!allowedRoles.includes(userRole)) {
    const homePath = ROLE_HOME[userRole] ?? fallbackPath ?? DEFAULT_HOME;
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
