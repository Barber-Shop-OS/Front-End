// Importando bibliotecas
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

// Importando hooks e páginas
import { useAppSelector } from "@/hooks/redux";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LandingPage from "@/pages/LandingPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import BarbershopPage from "@/pages/BarbershopPage";
import UserHomePage from "./pages/UserHomePage";
import BranchPage from "./pages/BranchPage";

// Rota protegida - usada pelo DONO/GESTOR da barbearia (área administrativa)
// TODO: quando o auth slice diferenciar "role" (dono vs cliente final),
// trocar essa checagem genérica por algo como state.auth.role === "owner"
const ProtectedRoute = (): JSX.Element => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === "authenticated",
  );
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Rotas públicas (login/signup) - se já autenticado, redireciona pro dashboard
const PublicOnlyRoute = (): JSX.Element => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === "authenticated",
  );
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// TODO: criar um segundo guard equivalente ao ProtectedRoute, mas pro
// CLIENTE FINAL autenticado (ex: ProtectedCustomerRoute), assim que existir
// diferenciação de role no auth slice. UserHomePage provavelmente deveria
// usar esse guard em vez de ficar dentro de PublicOnlyRoute (que redireciona
// justamente quem já está autenticado, então nunca alcançaria essa página).

// Componente principal do aplicativo
const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page institucional do BarberOS (venda do SaaS pro dono da barbearia) */}
        <Route path="/" element={<LandingPage />} />

        {/* Busca/listagem de barbearias - pública, não exige login */}
        <Route path="/filiais" element={<SearchResultsPage />} />

        {/*
          Páginas públicas da barbearia (cliente final) - fluxo como convidado,
          sem exigir login pra visualizar ou agendar (decisão alinhada:
          login só é oferecido depois de confirmar o agendamento, pra guardar
          histórico - não é barreira de entrada).

          Rota da filial fica aninhada em /b/:slug/:branchId pra manter o
          contexto de qual barbearia é dona daquela filial na própria URL
          (antes estava solta em /filiais/:branchId, sem o slug da barbearia).
        */}
        <Route path="/b/:slug" element={<BarbershopPage />} />
        <Route path="/b/:slug/:branchId" element={<BranchPage />} />

        {/* Rotas públicas de autenticação */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/*
          TODO: mover para dentro do guard de cliente autenticado
          (ver comentário do "TODO" acima, próximo ao ProtectedRoute).
          Por enquanto ficou fora de qualquer guard pra não quebrar o fluxo,
          mas ela representa a home de um usuário JÁ logado, então soa
          estranho estar acessível sem autenticação nenhuma.
        */}
        <Route path="/user-home" element={<UserHomePage />} />

        {/* Rotas protegidas - área administrativa do dono/gestor da barbearia */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;