# Plano de implementação — Front-End a partir do Figma

Atualizado continuamente durante a execução. Decisões de produto da entrevista de 20/11/2026 estão na seção 1.

## 1. Decisões de produto (entrevista 20/11/2026)

| # | Decisão |
|---|---|
| A1 | Criar papel `receptionist` (Front Desk / Atendimento) no back-end, vinculado a uma filial, convidado por dono/gerente. |
| A2 | Agendamento com pagamento só "Pagar no local"; Cartão/Pix exibidos desabilitados "Em breve". |
| A3 | Checkout de assinatura mantém o layout, mas redireciona ao checkout hospedado do AbacatePay (sem cartão no front). |
| A4 | Dono cadastra → trial de **14 dias** → assina quando quiser. |
| B1 | Login/cadastro só na etapa final do agendamento, preservando a seleção. |
| B2 | Central de notificações in-app simples (tabela + endpoints) para o sino. |
| B3 | Gerente usa o painel do dono restrito à filial; admin usa o layout de painel. |
| B4 | Assinatura mostra os 3 planos de `/plans`. |
| C1 | Público/cliente mobile-first; barbeiro mobile+tablet; dono/atendimento desktop+tablet (sidebar em gaveta). |
| D1 | Logo oficial = emblema da landing page, em todas as áreas. |
| D2 | Fotos do Figma liberadas para produção. |
| E1 | Push em `feat/frontend-backlog` (front) e `feat/sprint-d` (back), sem merge na `main`. |
| E2 | "Pronto" = validado em produção local (build + preview; API em docker com MySQL). Sem deploy Cloudflare. |
| E3 | Placeholders corrompidos de `booking/` removidos; `src/redux-persist-example` fica fora do git. |

## 2. Arquitetura mantida
React 18 + Vite + TS estrito + Tailwind (tokens em `tailwind.config.ts`) + RTK Query (`src/services/baseApi.ts`, endpoints
por feature com `injectEndpoints`) + react-router 6 (`src/App.tsx`, páginas lazy) + react-hook-form/zod. Kit de UI em
`src/components/ui`. Layouts: `PublicLayout`, `AuthLayout`, `WorkspaceLayout(area)`.

## 3. Pacotes de trabalho

| Etapa | Escopo | Estado |
|---|---|---|
| 0 | Engenharia reversa do Figma: inventário de tokens, assets, `DESIGN_SYSTEM.md`, `SCREEN_INVENTORY.md`, `USER_FLOWS.md` | ✅ |
| 1 | Fundação: tokens, logo, kit de UI, layouts, área atendimento nos guards, sino de notificações, rotas + stubs | ✅ commit `3dd227e` |
| BE | Back-end BE-49..BE-53 | ✅ pushado (feat/sprint-d) |
| A | Público: landing, busca, barbearia, filial, para barbearias, legais, 404 | ✅ |
| B | Agendamento (wizard) + autenticação | ✅ |
| C | Cliente: home, agendamentos, detalhes, conta | ✅ |
| D | Dono — operação: dashboard, financeiro, rendimentos, agenda, clientes, novo agendamento, onboarding | ✅ |
| E | Dono — gestão: filiais, barbeiros, serviços, equipe, assinatura, checkout, configurações | ✅ |
| F | Barbeiro: dashboard, agendamentos, rendimentos, clientes, folgas | ✅ |
| G | Atendimento (4 telas) + admin — depende do BE-49/50 | ✅ |
| V | Auditoria E2E no navegador (Claude in Chrome) em produção local, por perfil + responsividade; correções; `VALIDATION_REPORT.md` | ✅ desktop, tablet e celular |

## 4. Estado em 21/11

Todas as telas do inventário implementadas (nenhum stub restante). Validação ponta a ponta no Chrome em produção
local (vite build + preview; API em docker com MySQL) — ver `docs/VALIDATION_REPORT.md`.

Pendências:
1. Revisão de fidelidade visual tela a tela contra o Figma (a cota do Figma MCP do plano Starter acabou nesta sessão).
2. Testes de componentes (Testing Library/MSW): base pronta (`src/test/render.tsx`, MSW global) com login 2FA,
   cartão de 2FA e bloqueio de cliente; ampliar para as demais telas.

### 21/11 (tarde)
- SEC-27: login em duas etapas (app autenticador ou código de recuperação) e cartão em Conta › Segurança (QR code,
  códigos de recuperação, desativar); admin sem 2FA é levado à ativação.
- SEC-21: dono/gerente bloqueia/desbloqueia cliente (detalhe do cliente; selo "Bloqueado" na lista).
- Correções: códigos de erro da API voltaram a chegar às telas (normalizeApiError) e campos dentro de modais não
  perdem mais o foco a cada tecla; títulos das abas no painel/financeiro/rendimentos.
- FE-40: CSP/HSTS gerados no build (`dist/_headers`), fallback SPA no wrangler; dependências sem vulnerabilidades
  (zod 4, react-router 7.18). App mobile cancelado: o web é o único produto.
- Validado no Chrome em produção local (API docker + PostgreSQL): ativar 2FA, login com código errado e com código
  de recuperação, bloquear/desbloquear cliente, navegação sem violações de CSP.

## 5. Riscos e limitações conhecidas
- OneDrive: arquivos podem virar placeholders ilegíveis; commits sempre com `git add` explícito.
- Credenciais externas (SMTP, Google OAuth, AbacatePay produção) indisponíveis → mocks locais / devMode.
