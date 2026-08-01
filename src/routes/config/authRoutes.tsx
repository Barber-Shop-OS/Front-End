import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import PasswordRecoveryPage from "@/pages/PasswordRecoveryPage";
import type { RouteGroup } from "./types";

/**
 * Rotas públicas de autenticação - acessíveis apenas para usuários
 * NÃO autenticados (guard PublicOnlyRoute redireciona quem já está logado).
 */
const authRoutes: RouteGroup = {
  name: "auth",
  routes: [
    { path: "/login", element: <LoginPage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/verify-email", element: <VerifyEmailPage /> },
    { path: "/recuperar-senha", element: <PasswordRecoveryPage /> },
  ],
};

export default authRoutes;
