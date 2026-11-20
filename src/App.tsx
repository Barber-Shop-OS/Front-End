// Rotas do BarberOS (FE-01/FE-07): grupos por perfil, cada página carregada sob demanda.
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { FullScreenLoader } from '@/components/ui';
import { bootstrapSession } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';
import WorkspaceLayout from '@/layouts/WorkspaceLayout';
import { PublicOnly, RequireAuth } from '@/routes/guards';
import { ScrollToTop } from '@/routes/ScrollToTop';

const page = (loader: () => Promise<{ default: React.ComponentType }>) => lazy(loader);

// Públicas
const LandingPage = page(() => import('@/pages/public/LandingPage'));
const ForBarbershopsPage = page(() => import('@/pages/public/ForBarbershopsPage'));
const SearchPage = page(() => import('@/pages/public/SearchPage'));
const BarbershopPage = page(() => import('@/pages/public/BarbershopPage'));
const BranchPage = page(() => import('@/pages/public/BranchPage'));
const BookingPage = page(() => import('@/pages/public/BookingPage'));
const LegalPage = page(() => import('@/pages/public/LegalPage'));
const NotFoundPage = page(() => import('@/pages/public/NotFoundPage'));
const VerifyEmailPage = page(() => import('@/pages/auth/VerifyEmailPage'));
const ConfirmEmailChangePage = page(() => import('@/pages/auth/ConfirmEmailChangePage'));
const PasswordRecoveryPage = page(() => import('@/pages/auth/PasswordRecoveryPage'));
const AcceptInvitationPage = page(() => import('@/pages/auth/AcceptInvitationPage'));

// Autenticação
const LoginPage = page(() => import('@/pages/auth/LoginPage'));
const SignupPage = page(() => import('@/pages/auth/SignupPage'));
const OwnerSignupPage = page(() => import('@/pages/auth/OwnerSignupPage'));

// Cliente / conta
const CustomerHomePage = page(() => import('@/pages/customer/CustomerHomePage'));
const CustomerAppointmentsPage = page(() => import('@/pages/customer/CustomerAppointmentsPage'));
const AppointmentDetailsPage = page(() => import('@/pages/customer/AppointmentDetailsPage'));
const AccountPage = page(() => import('@/pages/account/AccountPage'));

// Dono / gerente
const OwnerDashboardPage = page(() => import('@/pages/owner/OwnerDashboardPage'));
const OnboardingPage = page(() => import('@/pages/owner/OnboardingPage'));
const AgendaPage = page(() => import('@/pages/owner/AgendaPage'));
const NewAppointmentPage = page(() => import('@/pages/owner/NewAppointmentPage'));
const ClientsPage = page(() => import('@/pages/owner/ClientsPage'));
const ClientDetailPage = page(() => import('@/pages/owner/ClientDetailPage'));
const FinancialPage = page(() => import('@/pages/owner/FinancialPage'));
const BranchesPage = page(() => import('@/pages/owner/BranchesPage'));
const BranchFormPage = page(() => import('@/pages/owner/BranchFormPage'));
const BarbersPage = page(() => import('@/pages/owner/BarbersPage'));
const BarberDetailPage = page(() => import('@/pages/owner/BarberDetailPage'));
const ServicesPage = page(() => import('@/pages/owner/ServicesPage'));
const ManagersPage = page(() => import('@/pages/owner/ManagersPage'));
const SubscriptionPage = page(() => import('@/pages/owner/SubscriptionPage'));
const SettingsPage = page(() => import('@/pages/owner/SettingsPage'));

// Barbeiro
const BarberAgendaPage = page(() => import('@/pages/barber/BarberAgendaPage'));
const BarberStatsPage = page(() => import('@/pages/barber/BarberStatsPage'));
const BarberTimeOffPage = page(() => import('@/pages/barber/BarberTimeOffPage'));

// Admin da plataforma
const AdminPage = page(() => import('@/pages/admin/AdminPage'));

const OwnerHome = () => <OwnerDashboardPage />;

const App = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/para-barbearias" element={<ForBarbershopsPage />} />
            <Route path="/filiais" element={<SearchPage />} />
            <Route path="/b/:slug" element={<BarbershopPage />} />
            <Route path="/b/:slug/agendar" element={<BookingPage />} />
            <Route path="/b/:slug/:branchId" element={<BranchPage />} />
            <Route path="/termos" element={<LegalPage kind="terms" />} />
            <Route path="/privacidade" element={<LegalPage kind="privacy" />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/confirmar-email" element={<ConfirmEmailChangePage />} />
            <Route path="/convite/:token" element={<AcceptInvitationPage />} />

            <Route element={<RequireAuth />}>
              <Route path="/cliente" element={<CustomerHomePage />} />
              <Route path="/cliente/agendamentos" element={<CustomerAppointmentsPage />} />
              <Route path="/cliente/agendamentos/:appointmentId" element={<AppointmentDetailsPage />} />
              <Route path="/conta" element={<AccountPage />} />
              <Route path="/nova-barbearia" element={<OnboardingPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/cadastro-barbearia" element={<OwnerSignupPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth areas={['owner']} />}>
            <Route element={<WorkspaceLayout area="owner" />}>
              <Route path="/dashboard" element={<OwnerHome />} />
              <Route path="/dashboard/agenda" element={<AgendaPage />} />
              <Route path="/dashboard/agendamentos/novo" element={<NewAppointmentPage />} />
              <Route path="/dashboard/clientes" element={<ClientsPage />} />
              <Route path="/dashboard/clientes/:clientId" element={<ClientDetailPage />} />
              <Route path="/dashboard/financeiro" element={<FinancialPage />} />
              <Route path="/dashboard/filiais" element={<BranchesPage />} />
              <Route path="/dashboard/filiais/nova" element={<BranchFormPage />} />
              <Route path="/dashboard/filiais/:branchId" element={<BranchFormPage />} />
              <Route path="/dashboard/barbeiros" element={<BarbersPage />} />
              <Route path="/dashboard/barbeiros/:barberId" element={<BarberDetailPage />} />
              <Route path="/dashboard/servicos" element={<ServicesPage />} />
              <Route path="/dashboard/equipe" element={<ManagersPage />} />
              <Route path="/dashboard/assinatura" element={<SubscriptionPage />} />
              <Route path="/dashboard/configuracoes" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth areas={['barber']} />}>
            <Route element={<WorkspaceLayout area="barber" />}>
              <Route path="/barbeiro" element={<BarberAgendaPage />} />
              <Route path="/barbeiro/desempenho" element={<BarberStatsPage />} />
              <Route path="/barbeiro/folgas" element={<BarberTimeOffPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth areas={['admin']} />}>
            <Route element={<PublicLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Endereços antigos */}
          <Route path="/user-home" element={<Navigate to="/cliente" replace />} />
          <Route path="/dashboard/barber" element={<Navigate to="/barbeiro" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
