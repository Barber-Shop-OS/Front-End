import DashboardPage from "@/pages/AdminDashboardPage";
import AdminFinancialPage from "@/pages/AdminFinancialPage";
import BranchesManagementPage from "@/pages/BranchesManagementPage";
import NewBranchPage from "@/pages/NewBranchPage";
import EditBranchPage from "@/pages/EditBranchPage";
import BarbersManagementPage from "@/pages/BarbersManagementPage";
import NewBarberPage from "@/pages/NewBarberPage";
import ServicesManagementPage from "@/pages/ServicesManagementPage";
import ClientsPage from "@/pages/ClientsPage";
import BranchSchedulePage from "@/pages/BranchSchedulePage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import BranchRevenuePage from "@/pages/BranchRevenuePage";
import type { RouteGroup } from "./types";

/**
 * Rotas do DONO/GESTOR da barbearia (área administrativa).
 * Exigem autenticação + role "owner".
 */
const ownerRoutes: RouteGroup = {
  name: "owner",
  routes: [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/dashboard/financeiro", element: <AdminFinancialPage /> },
    { path: "/dashboard/filiais", element: <BranchesManagementPage /> },
    { path: "/dashboard/filiais/nova", element: <NewBranchPage /> },
    {
      path: "/dashboard/filiais/:branchId/editar",
      element: <EditBranchPage />,
    },
    { path: "/dashboard/barbeiros", element: <BarbersManagementPage /> },
    { path: "/dashboard/barbeiros/novo", element: <NewBarberPage /> },
    { path: "/dashboard/servicos", element: <ServicesManagementPage /> },
    { path: "/dashboard/clientes", element: <ClientsPage /> },
    { path: "/dashboard/agenda-da-filial", element: <BranchSchedulePage /> },
    { path: "/dashboard/agendamentos/novo", element: <NewAppointmentPage /> },
    { path: "/dashboard/rendimentos", element: <BranchRevenuePage /> },
  ],
};

export default ownerRoutes;
