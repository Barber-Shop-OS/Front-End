# Design System — BarberOS

Fonte de verdade: Figma **BarberOS** (`vdkMpT94nWPXWhLoJhG8TZ`, página única "Page 1", 38 frames desktop de 1280 px).
O arquivo **não tem variáveis nem estilos publicados**; os tokens abaixo foram extraídos por inventário de todos os nós
(cores de preenchimento/texto/borda, fontes, raios e sombras — contagem de uso entre parênteses) e seguem o padrão de
nomes do Material 3, que é o que o design usa. Implementação: `tailwind.config.ts` (nunca usar hex literal nos componentes).

## 1. Marca

| Item | Valor |
|---|---|
| Logo | Emblema "barber pole + tesoura + calendário" — `src/assets/figma/brand/logo.png` (recorte do nó `1:410`, mesmo recorte do Figma). Favicon: `public/favicon.png`. Decisão do produto (20/11): **este é o logo oficial em todas as áreas**. |
| Wordmark | "BarberOS" Inter Bold 20/28, tracking −1px (−0.05em), `primary-600` |
| Componentes | `Logo` (emblema + wordmark + `tagline` opcional, ex.: "FRONT DESK"), `LogoMark` (só o emblema) — `src/components/Logo.tsx` |
| Fotos | Imagens do Figma liberadas para produção (landing: `src/assets/figma/landing/*`). Fotos de barbearias/barbeiros vêm da API (uploads) com fallback. |

## 2. Cores

| Token Tailwind | Hex | Papel M3 / uso no Figma |
|---|---|---|
| `primary-600` (`primary`) | `#004ac6` | primary — botões, links, ativos, números de destaque (89 fills, 191 textos) |
| `primary-500` | `#2563eb` | primary-container — gradiente de CTA, foco |
| `primary-100` | `#dbe1ff` | primary-fixed — badges (+12%), chips de hora, ícones de card |
| `primary-200` | `#b4c5ff` | inverse-primary |
| `primary-300` | `#acbfff` | primary-fixed-dim — botão "Cadastrar cliente" (front desk) |
| `primary-900` | `#00174b` | on-primary-fixed — texto sobre primary-fixed |
| `primary-50` | `#f1f3ff` | = surface-low (atalho) |
| `surface` | `#f9f9ff` | background de todas as telas, topbar |
| `surface-lowest` | `#ffffff` | cards, sidebar |
| `surface-low` | `#f1f3ff` | surface-container-low — seções, item ativo do menu, campos |
| `surface-container` | `#e9edff` | botões secundários, cards de passo |
| `surface-high` | `#e1e8fd` | surface-container-high — chips neutros, bento |
| `surface-highest` | `#dce2f7` | surface-container-highest — avatar placeholder, listas laterais (30%) |
| `ink` | `#141b2b` | on-surface — títulos e texto principal |
| `ink-variant` | `#434655` | on-surface-variant — texto secundário (442 usos) |
| `ink-subtle` / `outline` | `#737686` | outline — placeholders, ícones |
| `outline-variant` | `#c3c6d7` | bordas sutis (normalmente 10–30% de opacidade) |
| `muted` | `#64748b` | slate-500 — itens de menu inativos |
| `slate-400` | `#94a3b8` | rodapé |
| `secondary` / `secondary-on` | `#495c95` / `#394c84` | textos auxiliares azulados |
| `tertiary` / `tertiary-container` / `tertiary-fixed` | `#943700` / `#bc4800` / `#ffdbcd` | destaque laranja ("Pendentes", passo 03, alertas) |
| `danger-600` / `danger-700` / `danger-50` | `#ba1a1a` / `#93000a` / `#ffdad6` | erro M3 |
| `inverse-surface` / `inverse-on` | `#293040` / `#edf0ff` | tooltip, toast |
| `success-*` | `#059669`… | **não existe no Figma**; usado só para status "Concluído/Pago" (decisão técnica) |

## 3. Tipografia

Família **Inter** (Google Fonts, 400/500/600/700/800/900 em `index.html`).

| Uso | Estilo |
|---|---|
| Hero (landing) | Bold 72/72, tracking −3.6px (mobile: 40/44) |
| CTA final | Regular 60/60, tracking −3px |
| Título de página (painéis) | Bold 36/40, tracking −0.72px (mobile 28/36) — `PageHeader` |
| Título de seção | Bold 36/40 tracking −1.8px (landing) · Bold 18/28 tracking −0.45px (cards) |
| Número de KPI | Black 30/36, tracking −1.5px (front desk: Black 48) |
| Corpo | Regular 14/20 (mais usado) · 16/24 |
| Rótulo / eyebrow | 12–14px, caixa-alta, tracking 1.2–1.4px (`tracking-label`) — Bold quando é eyebrow, Semibold em rótulos de campo |
| Menu lateral | 14/20, tracking −0.35px; ativo Bold `primary-600`, inativo Regular `muted` |
| Legenda | Regular 12/16 |

## 4. Espaçamento, raios, sombras

- Grade de 4px. Containers: `max-w-[1280px]` com `px-6` (público); painel: sidebar 256px + conteúdo `max-w-[1024px]` `px-8 py-8`. Gaps comuns: 8, 16, 24, 32, 48.
- **Raios**: 8px `rounded-lg` (botões, campos — 345 usos) · 12px `rounded-xl` (cards, avatares — 308) · 4px `rounded` (itens de menu, chips de hora) · 24px `rounded-3xl` (cards da landing, bento) · 32px (CTA final).
- **Sombras** (`shadow-*`): `card` 0 1 2 rgba(0,0,0,.05) (76 usos) · `soft` 0 8 24 −4 rgba(20,27,43,.04) · `primary` (botões de destaque) · `float` · `hero` (barra de busca) · `sidebar` 4 0 24 −4 rgba(0,74,198,.05) · `elevated` (popovers, botão branco do CTA) · `ring` (borda 1px outline-variant 15%).

## 5. Componentes (src/components/ui)

| Componente | Figma | Notas |
|---|---|---|
| `Button` / `ButtonLink` / `buttonClass` | botões | variantes `primary` (#004ac6/branco), `secondary` (surface-container/primary), `tonal` (primary-fixed-dim), `outline`, `ghost`, `danger`, `white` (CTA sobre azul); tamanhos sm 36 · md 40 · lg 48; raio 8 |
| `Input` / `Select` / `Textarea` / `Checkbox` / `Field` | formulários | campo `surface-low` sem borda, raio 8, altura 48; rótulo em caixa-alta 12px tracking; erro `danger-600` com `aria-invalid` |
| `Card`, `CardTitle`, `PageHeader`, `Stat` | cards e cabeçalhos | card branco raio 12 `shadow-card` |
| `Badge`, `StatusBadge` | chips | raio 12, Bold 12; tons gray/blue/green/yellow/red/orange |
| `Avatar` | avatares | raio 12 (quadrado arredondado, não círculo), iniciais em `surface-highest` |
| `Tabs`, `Pagination` | filtros | trilho `surface-low`, aba ativa branca |
| `Spinner`, `Skeleton`, `ListSkeleton`, `EmptyState`, `ErrorState`, `Alert`, `FullScreenLoader` | estados | obrigatórios em toda tela com dados |
| `Modal`, `ConfirmDialog` (Overlay), `Toast` | modais/feedback | modal vira bottom-sheet no mobile |
| `NotificationBell` (features/notifications) | sino da topbar | popover com não lidas (BE-51) |

## 6. Layouts

- **PublicLayout** (público + cliente): topbar 60px `surface/90` com blur; logo, links Início/Filiais/Agendamentos, sino, configurações, avatar (menu). Rodapé centralizado em caixa-alta `slate-400`.
- **AuthLayout**: telas de login/cadastro/recuperação/verificação (ver frames 1:470, 1:892, 1:2, 1:427).
- **WorkspaceLayout** (`owner` | `barber` | `frontdesk` | `admin`): sidebar branca 256px `shadow-sidebar` (logo + tagline, CTA primário, navegação com item ativo `surface-low` + Bold primário, usuário no rodapé) e topbar 64px `surface/80` blur `shadow-card` (busca de cliente no front desk, sino, configurações, avatar). Abaixo de `lg` a sidebar vira gaveta.

## 7. Ícones

O Figma usa **Material Symbols (Outlined)** exportados como vetores. O projeto usa **lucide-react** com os equivalentes
mais próximos (mesmo traço outline, 18–20px), por ser tree-shakeable e já ser dependência. Exceção: o emblema da marca e
fotos são sempre os arquivos originais do Figma.

## 8. Responsividade (decisão do produto, 20/11)

O Figma só tem desktop (1280). Regras adotadas:
- Público e cliente: **mobile-first** (375px), grids colapsam para 1 coluna, hero com tipografia reduzida.
- Barbeiro: mobile + tablet.
- Dono e front desk: desktop + tablet; no celular continuam utilizáveis (sidebar em gaveta, tabelas viram cards ou rolagem horizontal).
- Breakpoints Tailwind padrão (sm 640, md 768, lg 1024, xl 1280).

## 9. Incertezas registradas

- Hover/focus/disabled não estão desenhados: hover escurece 1 tom (`primary-700`, `surface-high`); foco com anel `primary-600`; disabled 60% opacidade.
- Estados de erro/vazio/carregamento não estão no Figma: usam os componentes de estado do kit com as cores acima.
- Textos "Artesão Moderno" (tagline do dono) e dados de exemplo do Figma são substituídos por dados reais (nome da barbearia).
