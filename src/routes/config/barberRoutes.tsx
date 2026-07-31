import DashboardBarberPage from "@/pages/DashboardBarberPage";
import type { RouteGroup } from "./types";

/**
 * Rotas do BARBEIRO (profissional autenticado).
 * Exigem autenticação + role "barber".
 */
const barberRoutes: RouteGroup = {
  name: "barber",
  routes: [{ path: "/dashboard/barber", element: <DashboardBarberPage /> }],
};

export default barberRoutes;
