# Relatório de validação — Front-End (21/11/2026)

Ambiente "produção local": `vite build` + `vite preview` (porta 4173, `.env.production.local` apontando para
`http://localhost:3000`) e API `feat/sprint-d` em docker (`NODE_ENV=production`, MySQL do compose). Contas do seed
(`*@barberos.dev`); a recepcionista foi criada pela própria API e vinculada pela tela **Equipe**.

## Fluxos exercitados no Chrome (desktop 1536 px)

| Perfil | Fluxo | Resultado |
|---|---|---|
| Dono | Login → Dashboard | ✅ |
| Dono | Agenda (dia/semana, filtros, detalhe) | ✅ (barra de filtros ajustada) |
| Dono | Barbeiros (tabela, detalhe: perfil, serviços, jornada, bloqueios) | ✅ (campos de hora alargados) |
| Dono | Serviços, Assinatura (3 planos de `/plans`, uso do plano), Configurações | ✅ |
| Dono | Equipe → adicionar recepcionista (BE-49) | ✅ |
| Dono | Clientes (CRM) | ✅ (badges sem quebra) |
| Dono | Novo agendamento de balcão → agenda → registrar pagamento (Pix) | ✅ (overflow horizontal corrigido) |
| Recepção | Login → /atendimento, pagamentos (caixa com troco), agenda | ✅ após a correção do /me (abaixo) |
| Barbeiro | Dashboard, agendamentos, rendimentos, clientes, folgas | ✅ |
| Visitante → cliente | Agendamento público (unidade → serviço → barbeiro → calendário → pagar no local) → login → volta ao mesmo ponto → confirmado | ✅ |
| Cliente | Conta (dados, segurança, sessões, notificações) | ✅ |
| Admin | Visão geral, barbearias, usuários | ✅ |

## Problemas encontrados e corrigidos

| # | Problema | Correção |
|---|---|---|
| 1 | `/auth/refresh` dividia a cota de 10/15 min do login: poucas recargas → 429 → sessão perdida | SEC-30 (back): `refreshLimiter` próprio (600/15 min) |
| 2 | Recepcionista caía em `/cliente`: a API envia a recepção em `front_desk[]`, o front lia `barbershops[]` | `normalizeMe` no front converte `front_desk` em barbearias `receptionist` |
| 3 | "Sessões ativas" na web não marcava a sessão atual (cookie com `Path=/api/auth` não chega a `/api/me`) | BE-54 (back): `sid` no access token |
| 4 | Aba aberta durante um deploy quebrava ao abrir outra página (chunk antigo inexistente) | Recarga automática única quando o import de uma página falha |
| 5 | Ajustes visuais: filtros da agenda, horários cortados, overflow do seletor de datas, datas longas em tabelas, capitalização | Corrigidos |

## Responsividade (celular 390 px e tablet 820 px)

Auditoria automatizada (Playwright com o Chrome instalado) de **47 rotas × 2 larguras = 94 páginas**, logado em cada
perfil: detecta rolagem horizontal da página, erros de JavaScript e quedas de sessão, e salva capturas de página
inteira para revisão visual. Resultado final: **0 overflow, 0 erros, 0 quedas de sessão**.

| # | Problema | Correção |
|---|---|---|
| 6 | Overflow em 390 px: Conta (menu lateral), Configurações (URL longa), Atendimento | `min-w-0` no `Card`, dicas com quebra de palavra, aside da conta |
| 7 | Tabelas de clientes/barbeiros cortavam colunas em tablet | Tabela só a partir de 1024 px (com rolagem); abaixo, cartões em 1–2 colunas |
| 8 | Filtros da agenda espremidos no celular | Grade de 2 colunas no celular |
| 9 | Duas abas abrindo juntas / recarga durante a renovação derrubavam a sessão (`REFRESH_REUSED`) | SEC-32 (back): tolerância de 30 s |
| 10 | Limites por IP baixos para uma barbearia com vários aparelhos (429 em uso normal) | SEC-31 (geral 300/min) e SEC-30 (refresh 600/15 min) |
| 11 | Pagamentos do barbeiro/financeiro sem nome do serviço (API usa `appointment`/`barber` minúsculos) | Normalização na resposta de `/payment` |
| 12 | Novo agendamento com `?cliente=` mostrava "Cliente #id" antes de carregar | Nome provisório só se a busca falhar |

## Pendente

- Conferência visual contra o Figma: a cota do Figma MCP (plano Starter) está esgotada e a janela do Chrome estava
  minimizada, o que impede capturar o canvas do Figma pelo navegador.
- Checkout real da AbacatePay e e-mails (sem credenciais externas no ambiente local).
