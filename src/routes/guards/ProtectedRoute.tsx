import { Navigate, Outlet } from "react-router-dom";

import FullScreenLoader from "@/components/FullScreenLoader";
import { selectAuthStatus } from "@/features/auth/selectors";
import { useAppSelector } from "@/hooks/redux";

/**
 * Guard genérico de autenticação.
 * - Durante o bootstrap de sessão (idle/loading), exibe loader.
 * - Usuário autenticado: libera o acesso.
 * - Caso contrário, redireciona para /login.
 */
const ProtectedRoute = (): JSX.Element => {
  const status = useAppSelector(selectAuthStatus);

  if (status === "idle" || status === "loading") {
    return <FullScreenLoader />;
  }

  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
