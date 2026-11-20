# Inventário de telas — Figma → rotas

Figma `vdkMpT94nWPXWhLoJhG8TZ` (todos os frames 1280 px de largura). Coluna **Grupo** = pacote de implementação
(ver `IMPLEMENTATION_PLAN.md`). Telas sem frame no Figma reutilizam os padrões visuais (ver `DESIGN_SYSTEM.md`).

## Público

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:252 | Landing Page | `/` | `pages/public/LandingPage.tsx` | A |
| 1:714 | Resultados de Busca | `/filiais` | `pages/public/SearchPage.tsx` | A |
| 1:521 | Página da Barbearia | `/b/:slug` | `pages/public/BarbershopPage.tsx` | A |
| 1:949 | Página da Filial | `/b/:slug/:branchId` | `pages/public/BranchPage.tsx` | A |
| — | (sem frame) Para barbearias | `/para-barbearias` | `pages/public/ForBarbershopsPage.tsx` | A |
| — | (sem frame) Termos / Privacidade | `/termos`, `/privacidade` | `pages/public/LegalPage.tsx` | A |
| — | (sem frame) 404 | `*` | `pages/public/NotFoundPage.tsx` | A |

## Agendamento e autenticação

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:1881 | Fluxo de Agendamento | `/b/:slug/agendar` (passo serviço) | `pages/public/BookingPage.tsx` | B |
| 1:1736 | Agendamento - Seleção de Barbeiro | idem (passo barbeiro) | idem | B |
| 1:1253 | Agendamento - Seleção de Horário | idem (passo horário) | idem | B |
| 1:2060 | Agendamento - Pagamento | idem (passo confirmação; só "Pagar no local" ativo) | idem | B |
| 1:5950 | Background (painel lateral do fluxo) | — | idem | B |
| 1:470 | Login | `/login` | `pages/auth/LoginPage.tsx` | B |
| 1:892 | Cadastro | `/signup` | `pages/auth/SignupPage.tsx` | B |
| 1:2 | Recuperação de Senha | `/recuperar-senha` | `pages/auth/PasswordRecoveryPage.tsx` | B |
| 1:427 | Verificação de Email | `/verify-email` | `pages/auth/VerifyEmailPage.tsx` | B |
| — | (sem frame) Cadastro de barbearia | `/cadastro-barbearia` | `pages/auth/OwnerSignupPage.tsx` | B |
| — | (sem frame) Aceitar convite / confirmar troca de e-mail | `/convite/:token`, `/confirmar-email` | `pages/auth/*` | B |

## Cliente

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:2209 | Home do Cliente | `/cliente` | `pages/customer/CustomerHomePage.tsx` | C |
| 1:1112 | Meus Agendamentos | `/cliente/agendamentos` | `pages/customer/CustomerAppointmentsPage.tsx` | C |
| 1:1659 | Detalhes do Agendamento | `/cliente/agendamentos/:id` | `pages/customer/AppointmentDetailsPage.tsx` | C |
| 1:1477 | Perfil & Notificações | `/conta` | `pages/account/AccountPage.tsx` | C |

## Dono / gerente

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:3879 | Dashboard do Dono | `/dashboard` | `pages/owner/OwnerDashboardPage.tsx` | D |
| 1:2662 | Financeiro | `/dashboard/financeiro` | `pages/owner/FinancialPage.tsx` | D |
| 1:3498 | Rendimentos da Filial | `/dashboard/rendimentos` | `pages/owner/BranchEarningsPage.tsx` | D |
| 1:4201 | Agenda da Filial | `/dashboard/agenda` | `pages/owner/AgendaPage.tsx` | D |
| 1:3360 | Base de Clientes | `/dashboard/clientes` (+ `/:clientId`) | `pages/owner/ClientsPage.tsx`, `ClientDetailPage.tsx` | D |
| — | (sem frame) Novo agendamento (balcão) | `/dashboard/agendamentos/novo`, `/atendimento/agendamentos/novo` | `pages/owner/NewAppointmentPage.tsx` | D |
| — | (sem frame) Onboarding da barbearia | `/nova-barbearia` | `pages/owner/OnboardingPage.tsx` | D |
| 1:2858 | Gestão de Filiais (lista) | `/dashboard/filiais` | `pages/owner/BranchesPage.tsx` | E |
| 1:3012 | Gestão de Filiais (formulário/detalhe) | `/dashboard/filiais/nova`, `/:branchId` | `pages/owner/BranchFormPage.tsx` | E |
| 1:4407 | Barbeiros da Filial (Desktop) | `/dashboard/filiais/:branchId/barbeiros` | `pages/owner/BranchBarbersPage.tsx` | E |
| 1:3748 | Gestão de Barbeiros (Tabela) | `/dashboard/barbeiros` | `pages/owner/BarbersPage.tsx` | E |
| 1:2444 | Gestão de Barbeiros | `/dashboard/barbeiros/:barberId` (detalhe/edição) | `pages/owner/BarberDetailPage.tsx` | E |
| 1:3209 | Gestão de Serviços | `/dashboard/servicos` | `pages/owner/ServicesPage.tsx` | E |
| 1:44 | Página de Assinatura | `/dashboard/assinatura` | `pages/owner/SubscriptionPage.tsx` | E |
| 1:4085 | Checkout de Assinatura | `/dashboard/assinatura/checkout` (redireciona ao AbacatePay) | `pages/owner/CheckoutPage.tsx` | E |
| — | (sem frame) Equipe (gerentes e recepcionistas) | `/dashboard/equipe` | `pages/owner/ManagersPage.tsx` | E |
| — | (sem frame) Configurações da barbearia | `/dashboard/configuracoes` | `pages/owner/SettingsPage.tsx` | E |

## Barbeiro

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:5027 | Dashboard do Barbeiro | `/barbeiro` | `pages/barber/BarberDashboardPage.tsx` | F |
| 1:4578 | Agendamentos do Barbeiro | `/barbeiro/agendamentos` | `pages/barber/BarberAppointmentsPage.tsx` | F |
| 1:4820 | Rendimentos do Barbeiro | `/barbeiro/rendimentos` | `pages/barber/BarberEarningsPage.tsx` | F |
| 1:5175 | Clientes do Barbeiro | `/barbeiro/clientes` | `pages/barber/BarberClientsPage.tsx` | F |
| — | (sem frame) Folgas e bloqueios | `/barbeiro/folgas` | `pages/barber/BarberTimeOffPage.tsx` | F |

## Atendimento (recepção / front desk) e admin

| Nó | Frame | Rota | Arquivo | Grupo |
|---|---|---|---|---|
| 1:5522 | Dashboard - Atendimento | `/atendimento` | `pages/frontdesk/FrontDeskDashboardPage.tsx` | G |
| 1:5337 | Agenda - Atendimento | `/atendimento/agenda` | `pages/frontdesk/FrontDeskAgendaPage.tsx` | G |
| 1:5856 | Cadastro de Cliente - Atendimento | `/atendimento/clientes/novo` (+ lista `/atendimento/clientes`) | `pages/frontdesk/FrontDeskClientFormPage.tsx`, `FrontDeskClientsPage.tsx` | G |
| 1:5661 | Pagamento de Serviço - Atendimento | `/atendimento/pagamentos` | `pages/frontdesk/FrontDeskPaymentsPage.tsx` | G |
| — | (sem frame) Admin da plataforma | `/admin`, `/admin/barbearias`, `/admin/usuarios` | `pages/admin/*` | G |

## Assets fora de telas

| Nó | Nome | Uso |
|---|---|---|
| 1:520 | WhatsApp Image 2026-04-20 (1399×763) | Arte original do logo; recorte = `assets/figma/brand/logo.png` |
