# Backlog — Front-End BarberOS (Web)

> Documento vivo. Escrito para ser executado por um agente de IA (vibecoding) — cada tarefa é autocontida, aponta arquivos reais e tem critério de aceite verificável.
> Última revisão: 2026-11-07 (estado do código reconfirmado: nenhum commit no front desde `adae0cf`, 2026-08-06).
> Backlogs irmãos: Back-End `../../Back-End/docs/BACKLOG.md` (`BE-xx`) · Segurança `../../Back-End/docs/SECURITY_BACKLOG.md` (`SEC-xx`) · Mobile `../../Mobile/docs/BACKLOG.md` (`MOB-xx`).
> **Um commit por tarefa:** `feat(FE-21): wizard de agendamento`.

---

## 0. Como usar este backlog (leia antes de qualquer tarefa)

### Ordem
- Tarefas numeradas na **ordem de execução** (`FE-01` primeiro). Fases: **P0** (base/segurança) → **P1** (produto funcionando ponta a ponta) → **P2** (completa o produto) → **P3** (qualidade e polimento).
- Cada tarefa lista **Depende de**. Se depender de um `BE-xx` ainda não feito, **faça o BE primeiro** (o mesmo agente desenvolve os dois) — não crie mock novo para contornar.
- **[DECISÃO PENDENTE]** = pedir "ok" ao responsável antes de implementar; a recomendação já está escrita.

### Decisões de produto registradas (detalhes em `Back-End/docs/BACKLOG.md`)
- **2026-10-23 — Não haverá app iOS por enquanto.** Usuários de iPhone usam **esta versão web**. Por isso o web precisa ser **mobile-first e responsivo de verdade**, desde a primeira tela de cada tarefa (não deixar para FE-31). Teste obrigatório em 375 px e no Safari iOS.
- **2026-10-23 — Dono se cadastra pelo fluxo próprio** (`POST /api/auth/register-owner`) — ver FE-08.
- **2026-10-23 — Confirmação automática:** o agendamento nasce `confirmado`. Não existe tela de "aprovar agendamento".
- **2026-10-23 — O cliente cancela/reagenda até 24 h antes.** Depois disso, a UI esconde/desabilita as ações e mostra "fale com a barbearia" (com link de WhatsApp/telefone).
- **2026-11-07 — Planos definidos: R$ 99, R$ 199 e R$ 399/mês; gateway AbacatePay (API v2).** Limites/nomes recomendados em `Back-End/docs/BACKLOG.md` → BE-31 (Essencial / Profissional / Rede). FE-29 desbloqueado. Preços **sempre** vêm de `GET /api/plans` — nunca fixos no código.
- **2026-11-21 — App mobile cancelado.** O produto é só web (mobile-first); `MOB-xx` e dependências de app (App Links, push do Expo) deixam de valer.
- ~~**2026-11-07 — App mobile terá backlog próprio**~~ (`Mobile/docs/BACKLOG.md`, Android primeiro). O web continua sendo o canal principal de lançamento e o único lugar onde o dono assina plano e faz configuração pesada.

### Estado atual confirmado (lido do código em 2026-10-23)
- Stack: React 18 + Vite 7 + TypeScript + Tailwind 3 + Redux Toolkit + Redux-Saga + redux-persist + Axios + React Router 6. Ícones: `lucide-react` **e** `react-icons` (duas libs). Deploy: Cloudflare (`wrangler.json`, assets em `dist`).
- Rotas por perfil em `src/routes/config/*` com guards em `src/routes/guards/*`:
  - Públicas: `/`, `/filiais`, `/b/:slug`, `/b/:slug/:branchId`, `/agendar`, `/b/:slug/agendar`, `/assinatura`, `*`.
  - Auth (só deslogado): `/login`, `/signup`, `/verify-email`, `/recuperar-senha`.
  - Cliente (`customer`): `/cliente`, `/cliente/agendamentos`, `/cliente/agendamentos/:appointmentId`, `/cliente/perfil`.
  - Barbeiro (`barber`): `/dashboard/barber`.
  - Dono (`owner`): `/dashboard`, `/dashboard/{financeiro,filiais,filiais/nova,filiais/:branchId/editar,barbeiros,barbeiros/novo,servicos,clientes,agenda-da-filial,agendamentos/novo,rendimentos}`.
- HTTP: `src/services/http.ts` (Axios, `baseURL = VITE_API_BASE_URL + /api`, injeta Bearer, normaliza erro em `{status, message}`, callback de 401). `src/services/api.ts` re-exporta por compatibilidade.
- Roles: backend `cliente|barbeiro|owner|admin` → front `customer|barber|owner` via `mapRole` em `src/services/authService.ts` (**`admin` vira `owner`**).
- Estado global: só `auth` (slice + saga). As demais páginas fazem `api.get` direto com `useState`.
- **Integradas com a API de verdade:** login, cadastro, `/auth/me`, `BranchesManagementPage`, `NewBranchPage` (com `barbershop_id: 1` fixo!), `EditBranchPage`, `BranchSchedulePage`, `NewAppointmentPage`.
- **Com dados fixos (mock) no código:** `AdminDashboardPage`, `AdminFinancialPage`, `BarbersManagementPage`, `BarbershopPage`, `BranchPage`, `BranchRevenuePage`, `ClientsPage`, `CustomerAppointmentsPage`, `CustomerHomePage`, `CustomerProfilePage`, `DashboardBarberPage`, `SelectBarberPage`, `ServicesManagementPage`, `SignatureCheckoutPage`, componentes de `features/landing`, `features/barbershops`, `features/barbershop-profile`, `features/branch-profile`, `features/booking`.
- **Placeholders/sem lógica:** `AppointmentFlowPage` (placeholder declarado), `NewBarberPage` (inputs sem estado/submit), `AppointmentDetailsPage`, `VerifyEmailPage`, `PasswordRecoveryPage`.
- `PricingSection.tsx` ainda mostra **R$ 49 / R$ 99 / R$ 179** fixos → corrigido em FE-29/FE-30.
- Existem arquivos locais não versionados `*-my-pc.*` (`src/pages/*-my-pc.tsx`, `src/store/index-my-pc.ts`, `.env-my-pc.example`, `docs/state-management-my-pc.md`): padrão de **cópias de conflito do OneDrive** (o repo está dentro de uma pasta OneDrive). Além disso, o git não consegue ler `src/features/booking/components/{BarberCard,BookingSidebar,BookingSummaryBar}.tsx` ("read error … Invalid argument"). Antes de FE-01: tirar o repositório da pasta sincronizada pelo OneDrive (ou pausar a sincronização), comparar cada `*-my-pc.*` com o original, manter a versão correta e apagar as cópias; adicionar `*-my-pc.*` ao `.gitignore` (FE-04).
- Pendências de navegação já listadas em `TODO.md` (logout, cards clicáveis, botões sem link) — absorvidas pelas tarefas abaixo; após FE-01/FE-07 o `TODO.md` pode ser apagado.

### Convenções obrigatórias ao implementar
1. **Estrutura:** código de domínio em `src/features/<dominio>/{api,components,hooks,types.ts}`. `src/pages/*` só compõe layout + componentes de feature (sem chamada HTTP direta após FE-05).
2. **Dados do servidor:** via RTK Query (decisão em FE-05). Redux-Saga fica restrito ao fluxo de auth existente. Não criar novos slices para dados que vêm da API.
3. **Tipos:** tipos de entidades do backend em `src/types/api.ts` (gerados do OpenAPI quando BE-43 existir). Nunca `any`.
4. **UI:** usar os componentes de `src/components/ui/*` criados em FE-06; cores pelos tokens do Tailwind (nada de `#0b4bd8` literal).
5. **Datas:** sempre via utilitários de `src/utils/date.ts` (FE-05) — API em UTC, exibição em `pt-BR` no fuso da filial.
6. **Estados obrigatórios** em toda tela que busca dados: carregando, vazio, erro (com "tentar novamente") e sucesso.
7. **Formulários:** validação no cliente espelhando o backend; mostrar erro do backend (`message`/`code`) no campo ou em toast.
8. Rodar `npm run typecheck` e `npm run lint` (após FE-04) e testes (após FE-04) antes de concluir.

### Definição de pronto (DoD)
- [ ] Nenhum dado fixo restante na tela tocada (exceto textos de marketing da landing).
- [ ] Estados de loading/vazio/erro implementados.
- [ ] Funciona em 375 px (mobile) e ≥ 1280 px.
- [ ] typecheck + lint + testes verdes.
- [ ] Título da tarefa marcado `[x]` neste arquivo.

---

## Fase P0 — Base, segurança e infraestrutura do código

### [ ] FE-01 — Corrigir guards de rota e sessão (logout, role ausente, admin)
- **Prioridade:** 1º
- **Depende de:** —
- **Descrição:**
  - `src/routes/guards/RoleRoute.tsx`: se o usuário está autenticado **sem role**, hoje o guard libera qualquer área (`if (!userRole) return <Outlet />`). O backend já retorna role → remover o fallback; sem role = logout + `/login`. Ajustar `DEFAULT_HOME` em `constants.ts`.
  - `admin` mapeado como `owner` em `authService.ts:mapRole`: admin entra no painel do dono sem ter barbearia e quebra telas. Adicionar `admin` ao tipo `UserRole`; por ora redirecionar admin para `/dashboard` com aviso "área admin em construção" (área admin própria é P3, FE-38).
  - Logout: `AdminLayout.tsx:66` e `DashboardBarberLayout.tsx:51` apontam para `/logout`, rota que não existe (cai no 404). Criar ação de logout única (`useLogout()` em `features/auth/hooks`) que: despacha `logout`, faz `persistor.purge()`, limpa cache do RTK Query (após FE-05) e navega para `/login`. Usar nos dois layouts e no "Sair da Conta" de `CustomerProfilePage`.
  - Confirmar em `App.tsx` que `setUnauthorizedHandler` dispara o mesmo fluxo de logout em 401 e que `bootstrapSessionRequest` valida o token persistido no carregamento.
  - Após login, redirecionar para a página que o usuário tentou acessar (`state.from`) — necessário para "agendar → login → voltar ao agendamento" (FE-21).
- **Impacto:** Crítico. Hoje o usuário não consegue sair da conta pelo painel e um usuário sem role acessa áreas indevidas.

### [ ] FE-02 — Remover IDs fixos e campos que o cliente não deve enviar
- **Prioridade:** 2º
- **Depende de:** BE-04, BE-20
- **Descrição:**
  - `src/pages/NewBranchPage.tsx:69` envia `barbershop_id: 1` fixo → usar a barbearia ativa do owner (FE-09; até lá, primeira de `GET /api/me/barbershops`).
  - `src/pages/NewAppointmentPage.tsx:98-105` envia `user_id` e `status` escolhidos no formulário → após BE-04, o owner seleciona um cliente real (FE-14) e `status` sai do formulário.
  - `NewAppointmentPage` e `BranchSchedulePage` buscam `pageSize=20` sem filtro → passar `branch_id` da filial ativa.
  - Varredura: `grep -rn "_id: [0-9]" src` deve retornar vazio ao final.
- **Impacto:** Alto. Com mais de uma barbearia cadastrada, filiais são criadas na barbearia errada.

### [ ] FE-03 — Configuração e segredos
- **Prioridade:** 3º
- **Depende de:** —
- **Descrição:**
  - `src/config/api.ts` tem fallback com um `GOOGLE_CLIENT_ID` real fixo no código → remover o fallback; se ausente, esconder botões Google.
  - Em produção (`import.meta.env.PROD`), falhar no build/boot se `VITE_API_BASE_URL` não estiver definido (hoje cai em `http://localhost:3000` silenciosamente).
  - `VITE_USE_MOCK_AUTH` não pode ser `true` em produção: logar erro e ignorar.
  - Atualizar `.env.example` com todas as variáveis e descrição.
- **Impacto:** Médio. Evita build de produção apontando para localhost e IDs de terceiros acoplados ao código.

### [ ] FE-04 — Tooling: lint, testes, limpeza de artefatos e CI
- **Prioridade:** 4º
- **Depende de:** —
- **Descrição:**
  - `package.json` tem script `lint: eslint .` mas não existe `eslint.config.*` → o comando falha. Criar config flat ESLint 9 com `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`.
  - Adicionar Prettier (+ `prettier-plugin-tailwindcss`) e formatar o projeto em um commit isolado.
  - Remover artefatos versionados: `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo`, `vite.config.js`, `vite.config.d.ts` (gerados pelo `tsc -b`; manter só `vite.config.ts`) e adicioná-los ao `.gitignore`.
  - Configurar Vitest + Testing Library + `msw` (mock de API em teste, não em produção). Script `test`.
  - Unificar ícones: escolher `lucide-react` e remover `react-icons` (substituir usos).
  - Revisar `babel-plugin-react-compiler` beta: confirmar que está realmente ativo no `vite.config.ts`; se não estiver, remover a dependência.
  - GitHub Actions: `npm ci && npm run typecheck && npm run lint && npm test && npm run build` em PR.
- **Impacto:** Alto para vibecoding: lint + testes são o que pega regressão quando o agente altera muitos arquivos.

### [ ] FE-05 — Camada de dados: RTK Query, tipos de domínio e utilitários [DECISÃO PENDENTE — recomendação já assumida]
- **Prioridade:** 5º
- **Depende de:** FE-04
- **Descrição:**
  - Problema: páginas fazem `api.get` + `useState` + `useEffect` cada uma do seu jeito; sem cache, sem invalidação, sem tipagem compartilhada.
  - Recomendação: **RTK Query** (já vem no `@reduxjs/toolkit` instalado; integra com a store existente). Saga continua só no auth.
  - Implementar:
    1. `src/services/baseApi.ts`: `createApi` com `baseQuery` sobre o Axios de `http.ts` (reaproveita interceptors de token e 401). `tagTypes`: `Barbershop`, `Branch`, `Barber`, `Service`, `Appointment`, `Payment`, `Client`, `Dashboard`, `Me`.
    2. Endpoints injetados por feature: `src/features/<dominio>/api/<dominio>Api.ts` (`injectEndpoints`).
    3. `src/types/api.ts`: `Paginated<T>`, `Barbershop`, `Branch`, `Address`, `Barber`, `Service`, `Appointment`, `AppointmentStatus`, `Payment`, `ApiError { status, message, code? }`. Quando BE-43 estiver pronto, gerar com `openapi-typescript` a partir de `Back-End/docs/openapi.json` (script `npm run gen:api`).
    4. `src/utils/date.ts`: `formatDate`, `formatTime`, `formatDateTime`, `toUtcIso`, `fromUtc(…, timezone)` com `Intl.DateTimeFormat('pt-BR', { timeZone })` (ou `date-fns` + `date-fns-tz`).
    5. `src/utils/money.ts`: `formatBRL` com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
    6. Migrar as 5 páginas já integradas para RTK Query como referência de padrão.
- **Impacto:** Alto. Define o padrão que todas as ~25 telas restantes vão seguir; evita 25 implementações diferentes.

### [ ] FE-06 — Kit de UI: estados, feedback, formulários e tokens de design
- **Prioridade:** 6º
- **Depende de:** FE-04
- **Descrição:**
  - Tokens: a cor `#0b4bd8` aparece 123 vezes literal, além de `#eef2ff`, `#eef3ff`, `#f7f8fe`, `#dce6ff`. Definir paleta em `tailwind.config.ts` (`primary`, `primary-50…900`, `surface`, `muted`, `success`, `warning`, `danger`) e substituir os literais.
  - Componentes em `src/components/ui/`: `Button` (variantes, loading), `Input`/`Select`/`Textarea`/`Field` (label, erro, hint — já existe `forms/Field.tsx`, consolidar com `Input.tsx` e `Button.tsx` da raiz), `Modal`, `ConfirmDialog` (nunca usar `window.confirm`), `Toast` (provider + hook `useToast`), `Skeleton`, `EmptyState`, `ErrorState` (com retry), `Badge` de status de agendamento (cores por status), `Pagination`, `Tabs`, `Avatar`, `DataTable` (consolidar `AdminTable`).
  - Hook `useApiErrorMessage(error)` que traduz `code` do backend (BE-37) em mensagem amigável.
  - Formulários: adotar `react-hook-form` + `zod` (schemas espelhando o backend).
- **Impacto:** Alto. Consistência visual e de UX; acelera todas as telas seguintes.

### [ ] FE-07 — Limpeza de páginas órfãs e layouts duplicados
- **Prioridade:** 7º
- **Depende de:** FE-01
- **Descrição:**
  - Arquivos aparentemente não roteados: `src/pages/DashboardPage.tsx` (a rota `/dashboard` usa `AdminDashboardPage` importado com nome `DashboardPage`), `src/pages/UserHomePage.tsx`, `src/pages/SelectBarberPage.tsx`, `src/layouts/DashboardLayout.tsx` (só usado pelo DashboardPage órfão). Confirmar com `grep` e: remover os órfãos; **reaproveitar** `SelectBarberPage` como passo do wizard em FE-21.
  - Layouts: existem `AdminLayout` (features/admin), `DashboardBarberLayout`, `DashboardLayout`, `WorkspaceShell`, `CustomerLayout`, `AppLayout`, `BookingLayout`, `LandingLayout`, `AuthLayout`. Consolidar em: `PublicLayout`, `AuthLayout`, `CustomerLayout`, `WorkspaceLayout` (owner e barbeiro, com menu por role).
  - Renomear import confuso em `ownerRoutes.tsx` (`DashboardPage` → `AdminDashboardPage`).
  - Code splitting por grupo de rota com `React.lazy` + `Suspense` (`FullScreenLoader`).
- **Impacto:** Médio. Menos arquivos para o agente confundir; bundle menor.

---

## Fase P1 — Área do dono (owner)

### [ ] FE-08 — Onboarding do dono: cadastro de barbearia
- **Prioridade:** 8º
- **Depende de:** BE-21, FE-05, FE-06
- **Descrição:**
  - No `/signup`, opção "Sou cliente" / "Tenho uma barbearia". Fluxo do dono (decidido: endpoint dedicado `POST /api/auth/register-owner`, que já devolve o token): dados pessoais + dados da barbearia (nome, telefone) → envio → primeira filial (endereço completo, horários) → pronto (cai no `/dashboard`).
  - Owner logado sem barbearia (`/me/barbershops` vazio) → redireciona para o wizard em vez de mostrar dashboard vazio.
  - CTAs da landing ("Começar grátis", pricing) apontam para esse fluxo.
- **Impacto:** Alto. Porta de entrada de receita do SaaS; hoje nenhum dono consegue se cadastrar sozinho.

### [ ] FE-09 — Contexto de barbearia/filial ativa no painel
- **Prioridade:** 9º
- **Depende de:** BE-20, FE-05
- **Descrição:**
  - Slice leve `workspace` (persistido): `activeBarbershopId`, `activeBranchId | 'all'`.
  - Seletor no topo do `WorkspaceLayout` (dropdown barbearia → filial). Todas as queries do painel usam esses IDs.
  - Default: primeira barbearia/“todas as filiais”.
- **Impacto:** Alto. Pré-requisito de todas as telas do owner com mais de uma filial.

### [ ] FE-10 — Filiais: CRUD completo com endereço, horários e fechamentos
- **Prioridade:** 10º
- **Depende de:** BE-10, BE-17, FE-09
- **Descrição:**
  - `BranchesManagementPage`, `NewBranchPage`, `EditBranchPage` já falam com a API: migrar para RTK Query e para o kit de UI.
  - Endereço: novos campos `street`, `neighborhood`; autopreencher por CEP via ViaCEP (`https://viacep.com.br/ws/{cep}/json/`) com fallback manual; máscara de CEP e telefone.
  - Editor de horário semanal (dia, abre, fecha, múltiplos intervalos, "fechado") → `PUT /api/branch/:id/opening-hours`.
  - Lista/criação de fechamentos (feriados) → `/closures`.
  - Excluir filial com `ConfirmDialog` (tratar 409 se houver agendamentos futuros).
- **Impacto:** Alto. Sem horários configurados não existe disponibilidade para o cliente.

### [ ] FE-11 — Barbeiros: listagem, convite, edição, jornada e folgas
- **Prioridade:** 11º
- **Depende de:** BE-05, BE-11, BE-19, BE-22, FE-09
- **Descrição:**
  - `BarbersManagementPage` (mock) → lista real por filial com foto, nome, bio, serviços, status.
  - `NewBarberPage` (inputs sem estado) → formulário real: e-mail, nome, filial, bio, serviços que executa → `POST /api/branch/:id/barbers`. Mostrar "convite enviado" quando o usuário não existe.
  - Página/aba de edição: bio, foto (upload após BE-34), serviços, jornada semanal, folgas/bloqueios.
  - Remover barbeiro com confirmação (tratar 409 de agendamentos futuros).
- **Impacto:** Alto. O owner precisa montar a equipe para receber agendamentos.

### [ ] FE-12 — Serviços: CRUD
- **Prioridade:** 12º
- **Depende de:** BE-06, FE-09
- **Descrição:**
  - `ServicesManagementPage` (mock) → lista real da barbearia ativa; modal de criar/editar (nome, descrição, preço em BRL com máscara, duração em minutos com presets 15/30/45/60), ativar/desativar.
- **Impacto:** Alto. Sem serviços não há agendamento.

### [ ] FE-13 — Agenda da filial (calendário operacional)
- **Prioridade:** 13º
- **Depende de:** BE-04, BE-12, BE-15, FE-09
- **Descrição:**
  - `BranchSchedulePage` hoje lista 20 agendamentos sem filtro. Reescrever como agenda:
    - Visões **dia** (colunas por barbeiro, linhas de 15 min) e **semana**; navegação de datas; filtro por barbeiro/status.
    - Blocos coloridos por status (Badge de FE-06); bloqueios/folgas em cinza; fora do horário da filial hachurado.
    - Clique no bloco → drawer com detalhes e ações: confirmar, concluir, não compareceu, cancelar (com motivo), reagendar, registrar pagamento (PIX/dinheiro → BE-07).
    - Clique em horário vazio → abre FE-14 pré-preenchido.
  - Recomendação de lib: construir com CSS grid (controle total, sem dependência pesada); alternativa `@fullcalendar/react` se o tempo apertar.
  - Atualização: refetch ao focar a janela + polling de 60 s.
- **Impacto:** Crítico para o dia a dia da barbearia — é a tela mais usada pelo dono/recepção.

### [ ] FE-14 — Novo agendamento pelo dono (balcão/telefone)
- **Prioridade:** 14º
- **Depende de:** BE-14, BE-23, FE-13
- **Descrição:**
  - `NewAppointmentPage`: substituir o campo `user_id` livre por busca de cliente (autocomplete em `/barbershop/:id/clients?search`) + "cadastrar cliente rápido" (nome + telefone, se BE-23 aprovar clientes sem conta).
  - Serviço → barbeiro (filtrado por quem executa) → data → **slots disponíveis** de `/availability` (não mais `datetime-local` livre).
  - Tratar 409 (horário tomado entre a seleção e o envio): mensagem + recarregar slots.
- **Impacto:** Alto. Grande parte dos agendamentos de barbearia ainda chega por WhatsApp/telefone.

### [ ] FE-15 — Clientes
- **Prioridade:** 15º
- **Depende de:** BE-23, FE-09
- **Descrição:**
  - `ClientsPage` (mock) → tabela real com busca, paginação, colunas (nome, contato, nº de visitas, última visita, total gasto, faltas).
  - Detalhe do cliente (drawer ou página `/dashboard/clientes/:id`) com histórico e botão "Novo agendamento" (link do `TODO.md`).
- **Impacto:** Médio. Relacionamento e fidelização.

### [ ] FE-16 — Dashboard, financeiro e rendimentos
- **Prioridade:** 16º
- **Depende de:** BE-24, FE-09
- **Descrição:**
  - `AdminDashboardPage` (mock): cards (receita, agendamentos, ticket médio, ocupação), gráfico receita por dia, top serviços, próximos agendamentos de hoje — filtro de período (hoje, 7 d, 30 d, mês, personalizado).
  - `AdminFinancialPage` (mock): listagem de pagamentos `GET /api/payment` com filtros (status, método, filial, período) + totais; exportar CSV.
  - `BranchRevenuePage` (mock): receita por filial e por barbeiro.
  - Gráficos: escolher uma lib leve (`recharts`) e padronizar cores pelos tokens.
- **Impacto:** Alto. É o valor percebido que justifica a assinatura.

### [ ] FE-17 — Configurações da barbearia (perfil público e regras)
- **Prioridade:** 17º
- **Depende de:** BE-18, BE-15, FE-09 (upload: BE-34)
- **Descrição:**
  - Nova rota `/dashboard/configuracoes`: nome, slug (com preview do link público `/b/:slug` e botão copiar), descrição, telefone, Instagram, logo, capa. A confirmação automática e o prazo de cancelamento de 24 h são regras globais (não configuráveis); apenas mostrar um texto informativo sobre elas.
  - Link "Configurações" do `AdminLayout` (pendência do `TODO.md`).
- **Impacto:** Médio. Dá ao dono controle da vitrine e das regras da agenda.

---

## Fase P1 — Área pública e do cliente

### [ ] FE-18 — Busca de barbearias/filiais (`/filiais`)
- **Prioridade:** 18º
- **Depende de:** BE-25, FE-05
- **Descrição:**
  - `SearchResultsPage` + `features/barbershops/{SearchFilters,ResultsGrid,BarbershopCard,MapPromoCard}` (mock) → busca real com filtros na URL (`?q=&city=&service=`), paginação ou scroll infinito, estados vazio/erro.
  - `BarbershopCard` clicável → `/b/:slug/:branchId` (pendência do `TODO.md`); botão "Agendar" → `/b/:slug/agendar?branch=`.
  - `ResultsGrid`: corrigir link `/mapa` → `/filiais` (pendência do `TODO.md`). Mapa real fica em P3 (FE-36).
  - "Perto de mim": `navigator.geolocation` → filtra por cidade (ou distância quando BE tiver lat/lng).
- **Impacto:** Alto. Principal porta de aquisição de clientes finais.

### [ ] FE-19 — Página pública da barbearia (`/b/:slug`)
- **Prioridade:** 19º
- **Depende de:** BE-18, FE-05
- **Descrição:**
  - `BarbershopPage` + `features/barbershop-profile/*` (mock) → `GET /api/barbershop/slug/:slug`: hero (logo/capa/nome/descrição), filiais (com endereço, "aberto agora"), serviços com preço/duração, especialistas.
  - Slug inexistente → página 404 específica.
  - CTA "Agendar" em cada serviço/filial pré-preenche o wizard.
- **Impacto:** Alto. É o link que o dono vai divulgar no Instagram/WhatsApp.

### [ ] FE-20 — Página pública da filial (`/b/:slug/:branchId`)
- **Prioridade:** 20º
- **Depende de:** BE-18, BE-10
- **Descrição:**
  - `BranchPage` + `features/branch-profile/{BranchHero,BranchServicesGrid,ArtisansList,OpeningHoursCard}` (mock) → dados reais: endereço completo com link "abrir no Google Maps", telefone/WhatsApp, horários (destacar o dia atual e "aberto/fechado agora" no fuso da filial), serviços, barbeiros.
- **Impacto:** Alto. Informação prática que o cliente procura antes de ir.

### [ ] FE-21 — Fluxo de agendamento do cliente (wizard)
- **Prioridade:** 21º
- **Depende de:** BE-13, BE-14, FE-19, FE-01 (redirect pós-login)
- **Descrição:**
  - Substituir o placeholder `AppointmentFlowPage` (`/agendar`, `/b/:slug/agendar`) por wizard com estado na URL (`?branch=&service=&barber=&date=&slot=`), para que voltar/compartilhar funcione:
    1. Filial (pular se só houver uma ou vier na URL).
    2. Serviço (preço e duração).
    3. Profissional — reaproveitar `SelectBarberPage` / `features/booking/BarberCard` — com opção "sem preferência" (escolhe o primeiro livre).
    4. Data (próximos 30 dias; dias fechados desabilitados) e horário (slots de `/availability`).
    5. Revisão (resumo em `BookingSummaryBar`, observação opcional) → se não logado, login/cadastro e **volta para a revisão** com a seleção preservada → confirmar.
    6. Sucesso: detalhes, "adicionar ao Google Calendar" (link) e `.ics`, link para "Meus agendamentos".
  - 409 na confirmação → "esse horário acabou de ser reservado", voltar ao passo 4 com slots recarregados.
- **Impacto:** Crítico. É a funcionalidade-fim do produto para o cliente.

### [ ] FE-22 — Área do cliente: home, meus agendamentos e detalhes
- **Prioridade:** 22º
- **Depende de:** BE-15, BE-20, FE-21
- **Descrição:**
  - `CustomerHomePage` (mock): próximo agendamento em destaque, atalhos "agendar novamente" (últimas barbearias), barbearias sugeridas (cards clicáveis — `TODO.md`).
  - `CustomerAppointmentsPage` (mock): abas Próximos / Histórico via `/me/appointments`; botão "Novo agendamento" (`TODO.md`).
  - `AppointmentDetailsPage`: dados reais; ações cancelar e reagendar (reaproveita passos 4–5 do wizard) disponíveis **até 24 h antes** — usar `can_cancel_until` retornado pela API e mostrar "Você pode cancelar até dd/mm às hh:mm". Depois do prazo: ações desabilitadas + botão de contato com a barbearia. Tratar 409 `CANCELLATION_WINDOW_CLOSED`. Mostrar status do pagamento.
  - No passo de revisão do wizard (FE-21), informar a política: "Cancelamento gratuito até 24 h antes".
- **Impacto:** Alto. Autoatendimento do cliente reduz trabalho da recepção.

### [ ] FE-23 — Perfil do cliente
- **Prioridade:** 23º
- **Depende de:** BE-01, BE-29
- **Descrição:**
  - `CustomerProfilePage` (mock): editar nome, e-mail, telefone; trocar senha (com senha atual); sair (FE-01); excluir conta (com confirmação; depende de BE-40).
- **Impacto:** Médio. Requisito básico e de LGPD.

## Fase P1 — Área do barbeiro

### [ ] FE-24 — Painel do barbeiro
- **Prioridade:** 24º
- **Depende de:** BE-11, BE-15, BE-24, FE-13 (reaproveita componentes da agenda)
- **Descrição:**
  - `DashboardBarberPage` (mock) → agenda do dia (lista em mobile, timeline em desktop), próximo cliente em destaque, ações rápidas (confirmar, concluir, não compareceu, registrar pagamento), navegação por dia.
  - Gerenciar bloqueios próprios (almoço, folga) se BE-11 permitir.
  - Métricas do barbeiro (atendimentos e receita do período).
  - `DashboardBarberLayout`: itens de navegação válidos e "Sair" (pendências do `TODO.md`).
  - Pensar mobile-first: barbeiro usa no celular entre um cliente e outro.
- **Impacto:** Alto. Barbeiro é usuário diário; se ele não usar, a agenda fica desatualizada.

---

## Fase P2 — Autenticação completa, convites e monetização

### [ ] FE-25 — Recuperação de senha
- **Prioridade:** 25º
- **Depende de:** BE-26
- **Descrição:** `PasswordRecoveryPage` (`/recuperar-senha`): passo 1 e-mail → mensagem neutra "se existir conta, enviamos um link"; passo 2 (com `?token=`) nova senha + confirmação → sucesso → login. Tratar token expirado/usado.
- **Impacto:** Médio/alto. Evita perda de clientes que esquecem a senha.

### [ ] FE-26 — Verificação de e-mail
- **Prioridade:** 26º
- **Depende de:** BE-27
- **Descrição:** `VerifyEmailPage` (hoje sem lógica): ler `?token=`, chamar `POST /api/auth/verify-email`, estados sucesso/expirado; botão "reenviar". Banner no painel do owner enquanto não verificado. Rota deve ser acessível também logado (hoje está em `authRoutes`, só para deslogados — mover para pública).
- **Impacto:** Médio.

### [ ] FE-27 — Login e cadastro com Google
- **Prioridade:** 27º
- **Depende de:** BE-28, FE-03
- **Descrição:** `features/auth/utils/googleAuth.ts` + `authApi.loginWithGoogle/signupWithGoogle` (hoje lançam "indisponível") → obter `id_token` via Google Identity Services e enviar para `POST /api/auth/google`. Remover os mocks de Google.
- **Impacto:** Médio. Reduz atrito de cadastro.

### [ ] FE-28 — Aceitar convite de barbeiro
- **Prioridade:** 28º
- **Depende de:** BE-22
- **Descrição:** Nova rota pública `/convite/:token`: mostra barbearia/filial que convidou; se o e-mail já tem conta → login e aceite; senão → nome + senha → cria conta → cai no painel do barbeiro.
- **Impacto:** Médio. Fecha o ciclo de FE-11.

### [ ] FE-29 — Planos, checkout AbacatePay e gestão da assinatura
- **Prioridade:** 29º (pode subir para logo após FE-16 — é o que gera receita)
- **Depende de:** BE-31, BE-32, BE-33, BE-35
- **Descrição:**
  - `PricingSection` (landing) e `SignatureCheckoutPage` (`/assinatura`, mock) → 3 planos de `GET /api/plans` (R$ 99 / R$ 199 / R$ 399, com limites e recursos vindos da API; destacar o do meio). Remover os preços fixos atuais (49/99/179).
  - Checkout: owner logado escolhe plano → informa CPF/CNPJ (máscara + validação de dígitos) → `POST /api/billing/checkout` → redireciona para `checkout_url` da AbacatePay. Página de retorno `/dashboard/assinatura?status=...` **não** considera o plano ativo pelo parâmetro da URL: mostra "processando pagamento" e faz polling de `GET /api/barbershop/:id/subscription` (a ativação vem do webhook — SEC-13).
  - `/dashboard/assinatura`: plano atual, status (`trialing`, `pending`, `active`, `past_due`, `canceled`, `expired`) com textos claros, dias restantes de trial, próxima cobrança, uso × limite (filiais/barbeiros), trocar plano (`/billing/change-plan`; tratar `409 PLAN_LIMIT_EXCEEDED` listando o que precisa ser removido para o downgrade), cancelar (com confirmação e data efetiva), "gerenciar pagamento" (`/billing/portal`).
  - Bloqueios de UI ao atingir limite do plano: tratar `402 PLAN_LIMIT_REACHED` nos formulários de filial/barbeiro/convite com CTA de upgrade; banner global (`billing_banner` de `/api/me`) para trial acabando, inadimplência e modo leitura.
  - Onboarding (FE-08) termina em trial ativo; CTA de assinar aparece no banner, não bloqueia o uso no trial.
- **Impacto:** Alto para o negócio (receita).

### [ ] FE-30 — Landing page com conteúdo real
- **Prioridade:** 30º
- **Depende de:** FE-08, FE-29
- **Descrição:** Revisar `features/landing/*`: textos finais, depoimentos reais ou remover `TestimonialsSection` até ter, preços vindos da API, CTAs para cliente (buscar barbearia) e dono (cadastrar barbearia), rodapé com links legais (termos, privacidade — páginas novas).
- **Impacto:** Médio. Conversão e credibilidade; termos/privacidade são exigência legal.

---

## Fase P3 — Qualidade, performance e polimento

### [ ] FE-31 — Auditoria de responsividade, Safari iOS e acessibilidade
- **Prioridade:** 31º como auditoria final — mas a responsividade é exigida **em cada tarefa** (ver decisões no topo).
- **Depende de:** telas P1 prontas
- **Descrição:**
  - Auditar todas as rotas em 375/768/1280 px; menu lateral do painel vira drawer no mobile; wizard de agendamento e agenda do barbeiro usáveis com uma mão.
  - Safari iOS (é o "app" dos usuários de iPhone): `100dvh` em vez de `100vh`, safe areas (`env(safe-area-inset-*)`), inputs com `font-size ≥ 16px` (evita zoom automático), `type="tel"`/`inputmode` corretos, sem hover como única forma de interação.
  - Acessibilidade: foco visível, navegação por teclado no wizard e na agenda, `aria-*` em modais/toasts, contraste AA, `alt` em imagens, labels em todos os inputs (`eslint-plugin-jsx-a11y` ajuda).
  - **Proposta (não decidida):** transformar o web em PWA instalável (manifest + ícones + "Adicionar à tela de início") para dar aos usuários de iPhone uma experiência próxima de app. Custo baixo; pedir aprovação antes.
- **Impacto:** Alto. Sem app iOS, o web é o único canal para quem usa iPhone.

### [ ] FE-32 — Testes automatizados
- **Prioridade:** 32º
- **Depende de:** FE-04 (contínuo)
- **Descrição:** Unitários (utils de data/dinheiro, `mapRole`, guards) e de componente com `msw` (wizard de agendamento, agenda, formulários). E2E com Playwright para os fluxos críticos: cadastro de cliente → agendar → ver em meus agendamentos → cancelar; owner cria serviço/filial/barbeiro; barbeiro conclui atendimento. E2E rodando contra backend com seed (BE-39).
- **Impacto:** Alto para manutenção por agente.

### [ ] FE-33 — SEO e compartilhamento das páginas públicas
- **Prioridade:** 33º
- **Depende de:** FE-19, FE-20
- **Descrição:** `react-helmet-async` para `<title>`, description e Open Graph por página (`/b/:slug` com nome e logo da barbearia). Como é SPA no Cloudflare, avaliar Cloudflare Worker/Pages Function para injetar meta tags OG das páginas `/b/*` (crawlers de WhatsApp/Instagram não executam JS) — **[DECISÃO PENDENTE]**, recomendação: Worker simples que busca `/api/barbershop/slug/:slug` e reescreve o `<head>`. Configurar fallback SPA no `wrangler.json` (`not_found_handling: "single-page-application"`) se ainda não estiver — rotas profundas podem dar 404 no refresh.
- **Impacto:** Médio/alto. Link compartilhado no WhatsApp com preview bonito aumenta conversão.

### [ ] FE-34 — Tratamento global de erros e monitoramento
- **Prioridade:** 34º
- **Depende de:** FE-06
- **Descrição:** `ErrorBoundary` global e por rota com tela amigável; página offline/erro de rede; integração opcional com Sentry (env `VITE_SENTRY_DSN`) com `request_id` do backend (BE-42) nos eventos.
- **Impacto:** Médio.

### [ ] FE-35 — Performance
- **Prioridade:** 35º
- **Depende de:** FE-07
- **Descrição:** Medir com Lighthouse; lazy de imagens, `srcset`, formatos webp; prefetch de dados da próxima etapa do wizard; checar tamanho do bundle (`rollup-plugin-visualizer`); remover dependências não usadas.
- **Impacto:** Médio.

### [ ] FE-36 — Mapa de filiais
- **Prioridade:** 36º
- **Depende de:** BE-17 (lat/lng), FE-18
- **Descrição:** Visualização em mapa na busca (`react-leaflet` + OpenStreetMap, sem custo de API) com pins clicáveis; `MapPromoCard` passa a abrir essa visão.
- **Impacto:** Baixo/médio. Diferencial de descoberta.

### [ ] FE-37 — Sessão com refresh token
- **Prioridade:** 37º
- **Depende de:** BE-30
- **Descrição:** No `http.ts`, em 401 tentar `POST /api/auth/refresh` uma única vez (fila de requisições concorrentes aguardando o refresh), só então deslogar. Refresh token em cookie httpOnly (preferível) ou storage — alinhar com BE-30.
- **Impacto:** Médio. Usuário não é deslogado no meio do uso.

### [ ] FE-38 — Área administrativa da plataforma (admin) [FUTURO]
- **Prioridade:** 38º
- **Depende de:** FE-01
- **Descrição:** Rotas `/admin/*` para role `admin`: listar barbearias, assinaturas, usuários; suspender barbearia; métricas da plataforma.
- **Impacto:** Baixo agora; necessário para operar o SaaS com muitos clientes.

### [x] FE-40 — Cabeçalhos de segurança, CSP e fallback SPA no Cloudflare `[SEC-17]`
- **Feito (2026-11-21):** `dist/_headers` gerado no build (`build/securityHeaders.ts`, CSP com a origem de `VITE_API_BASE_URL`, Google login, ViaCEP, Google Fonts; HSTS, nosniff, `X-Frame-Options`, Referrer/Permissions-Policy, cache imutável de `/assets/*`); `vite preview` aplica a mesma CSP (validado no Chrome sem violações); `wrangler.json` com `not_found_handling: "single-page-application"`; ESLint proíbe `dangerouslySetInnerHTML`. `assetlinks.json` descartado (sem app mobile). **No deploy:** conferir em securityheaders.com.
- **Prioridade:** antes do lançamento
- **Depende de:** FE-03
- **Descrição:** criar `public/_headers` (ou Worker) com CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'` conforme SEC-17; ajustar `wrangler.json` com `not_found_handling: "single-page-application"`; regra ESLint proibindo `dangerouslySetInnerHTML`; servir `/.well-known/assetlinks.json` para os App Links do Android (MOB-06).
- **Impacto:** Alto. Reduz XSS/clickjacking e o risco do token em `localStorage` (SEC-15) até FE-37.

### [ ] FE-41 — Páginas legais e consentimento `[SEC-20]`
- **Prioridade:** antes do lançamento
- **Depende de:** BE-40
- **Descrição:** rotas `/termos` e `/privacidade` (texto fornecido pelo responsável/jurídico, com versão e data); checkbox obrigatório de aceite no cadastro de cliente e de dono (envia `terms_version`); link no rodapé e no app; e-mail do encarregado de dados.
- **Impacto:** Alto. Exigência legal (LGPD) e da Play Store para o app.

### [ ] FE-39 — Documentação do front sincronizada
- **Prioridade:** 39º
- **Depende de:** contínuo
- **Descrição:** Atualizar `docs/architecture.md` (RTK Query no lugar de saga para dados), `docs/state-management.md`, `docs/components-and-pages.md`, `docs/ai-context.md` e `README.md` a cada mudança estrutural; apagar `TODO.md` quando todos os itens dele estiverem cobertos.
- **Impacto:** Médio. O `ai-context.md` é o que orienta o próximo ciclo de vibecoding.

---

## Resumo da sequência recomendada (visão de sprint)

1. **Sprint A (P0):** FE-01 → FE-07 junto com BE-01 → BE-09.
2. **Sprint B (owner configura):** FE-08 → FE-12 junto com BE-10, BE-11, BE-17 → BE-22.
3. **Sprint C (agendar ponta a ponta):** FE-18 → FE-21, FE-13, FE-14 junto com BE-12 → BE-16, BE-25.
4. **Sprint D (operação diária):** FE-22 → FE-24, FE-15, FE-16 junto com BE-23, BE-24.
5. **Sprint D' (receita):** FE-29 junto com BE-31 → BE-35 — **lançamento pago possível após esta sprint + FE-40/FE-41 + Críticos/Altos de `SECURITY_BACKLOG.md` fechados**.
6. **Sprint E (P2):** FE-25 → FE-28, FE-30 junto com BE-26 → BE-30, BE-34.
7. **Contínuo (P3):** FE-31 → FE-39.
