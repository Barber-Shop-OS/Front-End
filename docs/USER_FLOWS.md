# Fluxos de usuário — BarberOS (web)

Perfis: **visitante**, **cliente**, **dono** (owner), **gerente de filial** (manager, BE-47), **atendimento/recepção**
(receptionist, BE-49), **barbeiro**, **admin da plataforma**. A página inicial após login é decidida por
`homePathFor` (`src/features/auth/hooks.ts`): admin → `/admin`; dono/gerente → `/dashboard`; barbeiro → `/barbeiro`;
recepção → `/atendimento`; demais → `/cliente`. Quem tem mais de um papel troca de área pela sidebar.

## 1. Visitante → cliente agendando (Figma 1:252 → 1:714 → 1:521/1:949 → 1:1881 → 1:1736 → 1:1253 → 1:2060)
1. Landing: busca por barbearia/localização ou "Agendar agora" → `/filiais?q=`.
2. Resultados → página da barbearia (`/b/:slug`) ou da filial (`/b/:slug/:branchId`).
3. "Agendar" → wizard `/b/:slug/agendar?branch=`: filial → serviço → barbeiro → data/horário (disponibilidade real) → revisão.
4. Pagamento: **só "Pagar no local"** (Cartão e Pix exibidos como "Em breve" — decisão de produto 20/11).
5. Confirmar: sem sessão → seleção salva → `/login` (ou cadastro rápido) → volta ao wizard restaurado → confirma.
   Regra SEC-21: precisa de e-mail verificado **ou** telefone; se faltar, a tela orienta a resolver.
6. Sucesso → `/cliente/agendamentos/:id`; e-mail de confirmação + notificação in-app.

## 2. Cliente (Figma 1:2209, 1:1112, 1:1659, 1:1477)
- Home (`/cliente`): próximo agendamento e atalhos. Meus agendamentos: próximos / histórico.
- Detalhes: cancelar (dentro da janela da barbearia), reagendar (novo horário), agendar novamente.
- Conta (`/conta`): dados, senha, e-mail, sessões, notificações, exportar dados / excluir conta (LGPD).

## 3. Autenticação (Figma 1:470, 1:892, 1:2, 1:427)
- Login (e-mail/senha; Google quando configurado) → área do perfil. Sessão: access 15 min + refresh automático.
- Cadastro de cliente → verificação de e-mail (link) → login.
- Recuperação de senha: solicitar link → redefinir com token.
- Convite (`/convite/:token`): barbeiro/membro aceita, cria ou vincula conta.

## 4. Dono — da conta ao primeiro agendamento
1. `/cadastro-barbearia` → conta + barbearia com **trial de 14 dias** (sem cobrança no cadastro — decisão 20/11).
2. Onboarding (`/nova-barbearia` se não houver barbearia) → filial (endereço, horários) → serviços → convidar barbeiros.
3. Operação diária: Dashboard (1:3879) → Agenda da filial (1:4201) → concluir atendimento + registrar pagamento
   presencial → Financeiro (1:2662) / Rendimentos da filial (1:3498).
4. Cadastros: Filiais (1:2858/1:3012), Barbeiros (1:3748/1:2444/1:4407), Serviços (1:3209), Clientes (1:3360),
   Equipe (gerentes e recepcionistas), Configurações (perfil público, regras).
5. Assinatura (1:44): vê trial/plano, escolhe um dos 3 planos (`/plans`) → Checkout (1:4085) → **redirecionado ao
   checkout seguro do AbacatePay** (sem dados de cartão no BarberOS) → webhook ativa → banner some.
   Inadimplência: banners de aviso → modo somente leitura (BE-35).

## 5. Gerente de filial
Mesmo painel do dono, restrito às filiais que gerencia; sem Assinatura e Configurações.

## 6. Atendimento / recepção (Figma 1:5522, 1:5337, 1:5856, 1:5661)
1. Dashboard "Hoje": agendamentos do dia, atendidos, pendentes, próximos (editar / concluir).
2. Agenda da filial; novo agendamento de balcão (cliente existente ou cadastro rápido).
3. Cadastro de cliente (1:5856); busca de cliente pela topbar.
4. Pagamento de serviço (1:5661): registrar pagamento presencial (PIX, dinheiro, cartão na maquininha).
Sem acesso a financeiro, cadastros estruturais, equipe ou assinatura.

## 7. Barbeiro (Figma 1:5027, 1:4578, 1:4820, 1:5175)
Dashboard do dia → agendamentos (concluir/falta) → rendimentos → clientes → folgas e bloqueios.

## 8. Admin da plataforma (sem frame)
Métricas gerais, barbearias (suspender, reativar, estender trial), usuários (papel).
