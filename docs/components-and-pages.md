# Components and Pages

## Roteamento Inicial

Rotas publicas:

- `/login`: autenticacao

Rotas privadas (requer autenticacao):

- `/`: dashboard inicial
- `/dashboard`: dashboard principal

Fluxo:

- Usuario nao autenticado acessando rota privada -> redirecionar para `/login`
- Usuario autenticado acessando `/login` -> redirecionar para `/dashboard`

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
