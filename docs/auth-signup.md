# Auth Signup

## Objetivo

Documentar a implementacao da pagina de cadastro de usuarios, incluindo:

- Cadastro com nome, e-mail e senha
- Cadastro com Google via OAuth 2.0 (authorization code flow)
- Estrutura para envio ao backend via Saga + API layer

## Fluxo de cadastro

Fluxo padrao (nome/e-mail/senha):

1. Usuario envia formulario em `SignupForm`
2. Componente dispara `signupRequest`
3. `authSaga` executa `authApi.signup`
4. API responde com `LoginSuccessPayload`
5. Saga dispara `loginSuccess` ou `signupFailure`
6. Redux atualiza `auth.state`

Fluxo Google (OAuth code):

1. Usuario clica em "Cadastro com Google" em `SignupAccessPanel`
2. Frontend carrega Google Identity Services (script)
3. Frontend inicia `initCodeClient` com `ux_mode: popup`
4. Google retorna `authorizationCode`
5. Componente dispara `signupWithGoogleRequest`
6. `authSaga` executa `authApi.signupWithGoogle`
7. Backend troca code por tokens e responde com `LoginSuccessPayload`
8. Saga dispara `loginSuccess` ou `signupFailure`

Fluxo canonico da feature:

`Componente -> Action -> Saga -> API -> Backend -> Redux -> Componente`

## Contratos de tipos

Arquivo: `src/types/auth.ts`

- `SignupRequestPayload`
- `GoogleSignupRequestPayload`

Payload enviado no cadastro padrao:

- `name`: nome completo do usuario
- `email`: e-mail de cadastro
- `password`: senha

Payload enviado no cadastro com Google:

- `provider`: `google`
- `authorizationCode`: codigo retornado pelo Google
- `redirectUri`: URI usada no OAuth
- `source`: `web`

## Endpoints esperados

Arquivo: `src/features/auth/api/authApi.ts`

- Cadastro padrao: `POST /auth/signup`
- Cadastro Google: `POST /auth/google/signup`

Resposta esperada em ambos:

- `user`: `{ id, email, name }`
- `tokens`: `{ accessToken, refreshToken }`

## Arquivos principais da feature

- `src/pages/SignupPage.tsx`
- `src/features/auth/components/SignupHeroPanel.tsx`
- `src/features/auth/components/SignupAccessPanel.tsx`
- `src/features/auth/components/SignupForm.tsx`
- `src/features/auth/slices/authSlice.ts` (actions: `signupRequest`, `signupWithGoogleRequest`, `signupFailure`)
- `src/features/auth/sagas/authSaga.ts` (workers para signup)
- `src/features/auth/api/authApi.ts` (metodos: `signup`, `signupWithGoogle`)
- `src/types/auth.ts` (tipos de payload)

## Roteamento

- Rota publica (sem autenticacao): `/signup`
- Usuario autenticado acessando `/signup` -> redireciona para `/dashboard`

## Observacoes de backend

Para producao, o backend deve:

1. Validar campos obrigatorios (name, email, password)
2. Verificar se e-mail ja existe
3. Hash da senha antes de salvar
4. Para Google:
   - Validar `authorizationCode` com Google
   - Fazer exchange do code por tokens no Google
   - Validar identidade do usuario
   - Criar usuario local se nao existir
5. Retornar `LoginSuccessPayload` em sucesso
6. Retornar erro estruturado em falha

## Validacao local

- Typecheck: `npm run typecheck`
- Resultado atual: sem erros de tipagem
