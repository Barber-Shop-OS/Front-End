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

// Rotas protegidas e públicas
const ProtectedRoute = (): JSX.Element => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === "authenticated",
  );
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Rotas públicas
const PublicOnlyRoute = (): JSX.Element => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === "authenticated",
  );
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// Componente principal do aplicativo
const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Rotas públicas */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Rotas protegidas */}
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
