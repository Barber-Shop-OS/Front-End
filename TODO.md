# TODO - Melhorias de Navegação

## Páginas de agendamento (rotas prontas, serão criadas depois)
- [x] Criar página placeholder `/agendar`
- [x] Criar página placeholder `/b/:slug/agendar`
- [x] Registrar as rotas no `publicRoutes.tsx`

## Conversão de `<a>` para `<Link>` (SPA)
- [x] `src/layouts/LandingLayout.tsx`
- [x] `src/layouts/AppLayout.tsx`

## CTAs sem link (apontar para /signup)
- [x] `src/features/landing/components/LandingHero.tsx`
- [x] `src/features/landing/components/CtaBanner.tsx`
- [x] `src/features/landing/components/PricingSection.tsx`

## Links de autenticação
- [x] `src/features/auth/components/LoginForm.tsx` (Esqueci minha senha → /recuperar-senha)
- [x] `src/features/auth/components/LoginAccessPanel.tsx` (Criar conta → /signup)
- [x] `src/pages/PasswordRecoveryPage.tsx` (Voltar ao login → /login)

## Área administrativa
- [ ] `src/features/admin/components/AdminLayout.tsx` (Sair → logout, Configurações)
- [ ] `src/layouts/DashboardBarberLayout.tsx` (nav items válidos, Sair → logout)
- [ ] `src/pages/BarbersManagementPage.tsx` (Adicionar barbeiro → /dashboard/barbeiros/novo)
- [ ] `src/pages/ClientsPage.tsx` (Novo Agendamento → /dashboard/agendamentos/novo)

## Área do cliente
- [ ] `src/features/barbershops/components/BarbershopCard.tsx` (Ver serviços → /b/:slug, card clicável)
- [ ] `src/features/barbershops/components/ResultsGrid.tsx` (fix /mapa → /filiais)
- [ ] `src/pages/CustomerHomePage.tsx` (cards clicáveis, Novo agendamento)
- [ ] `src/pages/CustomerAppointmentsPage.tsx` (Novo agendamento)
- [ ] `src/pages/CustomerProfilePage.tsx` (Sair da Conta → logout)

## Validação
- [x] Rodar `npm run typecheck`
