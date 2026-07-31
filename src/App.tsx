import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

// Importando hooks e páginas
import { useAppSelector } from "@/hooks/redux";
import DashboardPage from "@/pages/AdminDashboardPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LandingPage from "@/pages/LandingPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import BarbershopPage from "@/pages/BarbershopPage";
import BranchPage from "./pages/BranchPage";
import DashboardBarberPage from "./pages/BarbersManagementPage";
import CustomerHomePage from "./pages/CustomerHomePage";
import CustomerAppointmentsPage from "./pages/CustomerAppointmentsPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import AdminFinancialPage from "@/pages/AdminFinancialPage";
import BranchesManagementPage from "@/pages/BranchesManagementPage";
import ServicesManagementPage from "@/pages/ServicesManagementPage";
import ClientsPage from "@/pages/ClientsPage";
import SignatureCheckoutPage from "@/pages/SignatureCheckoutPage";
import PasswordRecoveryPage from "@/pages/PasswordRecoveryPage";
import BranchSchedulePage from "@/pages/BranchSchedulePage";
import BranchRevenuePage from "@/pages/BranchRevenuePage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import NewBranchPage from "@/pages/NewBranchPage";
import EditBranchPage from "@/pages/EditBranchPage";
import NewBarberPage from "@/pages/NewBarberPage";

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
          <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
        </Route>

        {/*
          TODO: mover para dentro do guard de cliente autenticado
          (ver comentário do "TODO" acima, próximo ao ProtectedRoute).
          Por enquanto ficou fora de qualquer guard pra não quebrar o fluxo,
          mas ela representa a home de um usuário JÁ logado, então soa
          estranho estar acessível sem autenticação nenhuma.
        */}
        <Route path="/user-home" element={<Navigate to="/cliente" replace />} />
        <Route path="/cliente" element={<CustomerHomePage />} />
        <Route
          path="/cliente/agendamentos"
          element={<CustomerAppointmentsPage />}
        />
        <Route
          path="/cliente/agendamentos/:appointmentId"
          element={<AppointmentDetailsPage />}
        />
        <Route path="/cliente/perfil" element={<CustomerProfilePage />} />
        <Route path="/assinatura" element={<SignatureCheckoutPage />} />

        {/* Rotas protegidas - área administrativa do dono/gestor da barbearia */}
        <Route element={<ProtectedRoute />}></Route>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/financeiro" element={<AdminFinancialPage />} />
        <Route path="/dashboard/filiais" element={<BranchesManagementPage />} />
        <Route path="/dashboard/filiais/nova" element={<NewBranchPage />} />
        <Route
          path="/dashboard/filiais/:branchId/editar"
          element={<EditBranchPage />}
        />
        <Route path="/dashboard/barber" element={<DashboardBarberPage />} />
        <Route path="/dashboard/barbeiros" element={<DashboardBarberPage />} />
        <Route path="/dashboard/barbeiros/novo" element={<NewBarberPage />} />
        <Route
          path="/dashboard/servicos"
          element={<ServicesManagementPage />}
        />
        <Route path="/dashboard/clientes" element={<ClientsPage />} />
        <Route
          path="/dashboard/agenda-da-filial"
          element={<BranchSchedulePage />}
        />
        <Route
          path="/dashboard/agendamentos/novo"
          element={<NewAppointmentPage />}
        />
        <Route path="/dashboard/rendimentos" element={<BranchRevenuePage />} />
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
