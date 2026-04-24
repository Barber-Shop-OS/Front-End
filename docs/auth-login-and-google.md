# Auth Login and Google

## Objetivo

Documentar a implementacao atual da autenticacao na tela de login, incluindo:

- Login com e-mail e senha
- Login com Google via OAuth 2.0 (authorization code flow)
- Estrutura para envio ao backend via Saga + API layer

## Fluxo de autenticacao

Fluxo padrao (e-mail/senha):

1. Usuario envia formulario em `LoginForm`
2. Componente dispara `loginRequest`
3. `authSaga` executa `authApi.login`
4. API responde com `LoginSuccessPayload`
5. Saga dispara `loginSuccess` ou `loginFailure`
6. Redux atualiza `auth.state`

Fluxo Google (OAuth code):

1. Usuario clica em "Entrar com Google" em `LoginAccessPanel`
2. Frontend carrega Google Identity Services (script)
3. Frontend inicia `initCodeClient` com `ux_mode: popup`
4. Google retorna `authorizationCode`
5. Componente dispara `loginWithGoogleRequest`
6. `authSaga` executa `authApi.loginWithGoogle`
7. Backend troca code por tokens e responde com `LoginSuccessPayload`
8. Saga dispara `loginSuccess` ou `loginFailure`

Fluxo canonico da feature:

`Componente -> Action -> Saga -> API -> Backend -> Redux -> Componente`

## Contratos de tipos

Arquivo: `src/types/auth.ts`

- `LoginRequestPayload`
- `GoogleLoginRequestPayload`
- `LoginSuccessPayload`
- `AuthState`

Payload enviado no login Google:

- `provider`: `google`
- `authorizationCode`: codigo retornado pelo Google
- `redirectUri`: URI usada no OAuth
- `source`: `web`

## Endpoints esperados

Arquivo: `src/features/auth/api/authApi.ts`

- Login padrao: `POST /auth/login`
- Login Google: `POST /auth/google/login`

Resposta esperada em ambos:

- `user`: `{ id, email, name }`
- `tokens`: `{ accessToken, refreshToken }`

## Variaveis de ambiente

Arquivo: `src/vite-env.d.ts`

- `VITE_API_URL`: base URL da API
- `VITE_GOOGLE_CLIENT_ID`: client id OAuth do Google
- `VITE_USE_MOCK_AUTH`: `true` ou `false`

Comportamento de mock:

- Quando `VITE_USE_MOCK_AUTH=true`, o authApi retorna dados simulados e nao chama backend

## Arquivos principais da feature

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/LoginAccessPanel.tsx`
- `src/features/auth/utils/googleAuth.ts`
- `src/features/auth/slices/authSlice.ts`
- `src/features/auth/sagas/authSaga.ts`
- `src/features/auth/api/authApi.ts`
- `src/types/auth.ts`

## Observacoes de backend

Para producao, o backend deve:

1. Validar `authorizationCode` com Google
2. Fazer exchange do code por tokens no Google
3. Validar identidade do usuario
4. Criar/atualizar usuario local
5. Retornar `LoginSuccessPayload`

## Validacao local

- Typecheck: `npm run typecheck`
- Resultado atual: sem erros de tipagem
