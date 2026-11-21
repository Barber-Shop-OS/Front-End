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
| 1 | `/auth/refresh` dividia a cota de 10/15 min do login: poucas recargas → 429 → sessão perdida | SEC-30 (back): `refreshLimiter` próprio (120/15 min) |
| 2 | Recepcionista caía em `/cliente`: a API envia a recepção em `front_desk[]`, o front lia `barbershops[]` | `normalizeMe` no front converte `front_desk` em barbearias `receptionist` |
| 3 | "Sessões ativas" na web não marcava a sessão atual (cookie com `Path=/api/auth` não chega a `/api/me`) | BE-54 (back): `sid` no access token |
| 4 | Aba aberta durante um deploy quebrava ao abrir outra página (chunk antigo inexistente) | Recarga automática única quando o import de uma página falha |
| 5 | Ajustes visuais: filtros da agenda, horários cortados, overflow do seletor de datas, datas longas em tabelas, capitalização | Corrigidos |

## Pendente

- Responsividade em largura de celular (não verificada nesta rodada).
- Conferência visual contra o Figma (cota do Figma MCP esgotada).
- Checkout real da AbacatePay e e-mails (sem credenciais externas no ambiente local).
