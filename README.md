# BarberOS Front-End

Front-end do BarberOS, construído com Vite, React e TypeScript. A aplicação organiza a autenticação, a landing page e o dashboard com Redux, Redux Saga, persistência de estado e integração com uma API HTTP.

## Visão Geral

Este projeto entrega:

- landing page pública para apresentação do produto
- autenticação com login, cadastro e fluxo com Google OAuth
- rotas protegidas por estado de autenticação
- dashboard inicial para usuários autenticados
- base modular por domínio em `src/features`

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- Redux Saga
- Redux Persist
- React Router DOM
- Axios
- Cloudflare Wrangler para deploy

## Requisitos

- Node.js 18+ recomendado
- npm

## Instalação

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
npm run deploy
```

## Ambiente

Crie um arquivo `.env` na raiz do projeto, se necessário, com as variáveis abaixo:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK_AUTH=true
VITE_GOOGLE_CLIENT_ID=seu_client_id_google
```

### Variáveis

- `VITE_API_URL`: URL base da API. Se não for definida, o app usa `http://localhost:3000/api`.
- `VITE_USE_MOCK_AUTH`: quando `true`, o fluxo de autenticação usa mocks locais.
- `VITE_GOOGLE_CLIENT_ID`: habilita o login e cadastro com Google.

## Rodando Localmente

```bash
npm run dev
```

Depois, abra a URL exibida pelo Vite no navegador.

## Build

```bash
npm run build
```

## Deploy

O projeto já possui configuração para Cloudflare Wrangler em `wrangler.json`.

```bash
npm run deploy
```

## Rotas

- `/` - landing page
- `/login` - login de usuário existente
- `/signup` - cadastro de novo usuário
- `/dashboard` - dashboard protegido

Regras de acesso:

- usuário não autenticado tentando acessar rota protegida é redirecionado para `/login`
- usuário autenticado acessando `/login` ou `/signup` é redirecionado para `/dashboard`

## Estrutura do Projeto

```text
src/
  assets/           imagens, ícones e fontes
  components/       componentes globais reutilizáveis
  features/         módulos por domínio
  hooks/            hooks globais e wrappers de biblioteca
  layouts/          layouts de páginas
  pages/            páginas e pontos de entrada de rota
  services/         clientes e configurações externas
  store/            Redux root reducer, root saga e persistência
  types/            tipagens globais
  utils/            utilitários puros
```

## Arquitetura

O fluxo principal segue a sequência abaixo:

```text
Componente -> Action -> Saga -> Axios -> Backend -> Redux -> Componente
```

Princípios adotados:

- estado de domínio centralizado por feature
- I/O externo isolado em `services` e `features/*/api`
- componentes de UI sem regra de negócio
- controle de rotas privadas por estado de autenticação

## Documentação Relacionada

- `docs/architecture.md`
- `docs/components-and-pages.md`
- `docs/auth-login-and-google.md`
- `docs/auth-signup.md`
- `docs/state-management.md`
- `docs/ai-context.md`
