# Components and Pages

## Roteamento Inicial

Rotas publicas:

- `/login`: autenticacao de usuario existente
- `/signup`: cadastro de novo usuario

Rotas privadas (requer autenticacao):

- `/`: dashboard inicial
- `/dashboard`: dashboard principal

Fluxo:

- Usuario nao autenticado acessando rota privada -> redirecionar para `/login`
- Usuario autenticado acessando `/login` ou `/signup` -> redirecionar para `/dashboard`

## Documentacao de Autenticacao

- Fluxo detalhado de login com e-mail/senha e Google OAuth:
  - `docs/auth-login-and-google.md`
- Fluxo detalhado de cadastro com nome/e-mail/senha e Google OAuth:
  - `docs/auth-signup.md`

## Estrutura de Pages

- `pages` devem orquestrar layout + feature components
- `layouts` encapsulam estrutura visual e navegacao comum

## Catálogo Padrão de UI Components

Componentes globais esperados em `src/components`:

- `Button`
- `Input`
- `Card`
- `Modal`
- `Spinner`
- `EmptyState`
- `ErrorState`

Critérios:

- Serem presentacionais, tipados e reutilizaveis
- Nao acessar Redux diretamente
- Nao fazer chamadas HTTP
