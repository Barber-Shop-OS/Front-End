import LandingPage from "@/pages/LandingPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import BarbershopPage from "@/pages/BarbershopPage";
import BranchPage from "@/pages/BranchPage";
import SignatureCheckoutPage from "@/pages/SignatureCheckoutPage";
import AppointmentFlowPage from "@/pages/AppointmentFlowPage";
import NotFoundPage from "@/pages/NotFoundPage";
import type { RouteGroup } from "./types";

/**
 * Rotas públicas - não exigem autenticação.
 * Inclui landing, busca de barbearias, perfil público da barbearia/filial,
 * fluxo de agendamento, checkout de assinatura e a rota 404.
 */
const publicRoutes: RouteGroup = {
  name: "public",
  routes: [
    { path: "/", element: <LandingPage /> },
    { path: "/filiais", element: <SearchResultsPage /> },
    { path: "/b/:slug", element: <BarbershopPage /> },
    { path: "/b/:slug/:branchId", element: <BranchPage /> },
    { path: "/agendar", element: <AppointmentFlowPage /> },
    { path: "/b/:slug/agendar", element: <AppointmentFlowPage /> },
    { path: "/assinatura", element: <SignatureCheckoutPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
};

export default publicRoutes;
