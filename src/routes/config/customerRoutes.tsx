import CustomerHomePage from "@/pages/CustomerHomePage";
import CustomerAppointmentsPage from "@/pages/CustomerAppointmentsPage";
import AppointmentDetailsPage from "@/pages/AppointmentDetailsPage";
import CustomerProfilePage from "@/pages/CustomerProfilePage";
import type { RouteGroup } from "./types";

/**
 * Rotas do CLIENTE FINAL (usuário comum).
 * Exigem autenticação + role "customer".
 */
const customerRoutes: RouteGroup = {
  name: "customer",
  routes: [
    { path: "/cliente", element: <CustomerHomePage /> },
    { path: "/cliente/agendamentos", element: <CustomerAppointmentsPage /> },
    {
      path: "/cliente/agendamentos/:appointmentId",
      element: <AppointmentDetailsPage />,
    },
    { path: "/cliente/perfil", element: <CustomerProfilePage /> },
  ],
};

export default customerRoutes;
