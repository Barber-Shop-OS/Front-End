# TODO — Integração do Frontend com o Backend BarberOS (Auth)

## Objetivo
Integrar cadastro, login e sessão autenticada ao backend local (http://localhost:3000), preservando design e arquitetura atuais.

## Contrato real da API
- `POST /api/auth/register` → `201 { message, user: { id, name, email, role } }` (sem token)
- `POST /api/auth/login` → `200 { message, token, user: { id, name, email, role } }` (token único)
- `GET /api/auth/me` → `200 { id, name, email, role }` (Bearer token)
- Erros: `{ message }` · Health check: `GET /` → `200 OK`

## Etapas
- [x] Criar `.env.example` com `VITE_API_BASE_URL`, `VITE_USE_MOCK_AUTH`, `VITE_GOOGLE_CLIENT_ID`
- [x] Criar `src/config/api.ts` (leitura centralizada + normalização de URL)
- [x] Criar `src/services/http.ts` (axios centralizado, Authorization Bearer, erro `{ message }`, handler 401)
- [x] Criar `src/services/authService.ts` (register, login, getMe + normalização de role)
- [x] Atualizar `src/services/api.ts` como re-export de `http.ts` (compatibilidade)
- [x] Atualizar `src/vite-env.d.ts` com `VITE_API_BASE_URL`
- [x] Atualizar `src/types/auth.ts` (`AuthTokens` com refreshToken opcional)
- [x] Atualizar `src/features/auth/api/authApi.ts` (delegar a `authService`, endpoints reais, `getMe`)
- [x] Atualizar `src/features/auth/slices/authSlice.ts` (idle inicial, bootstrap, loginSuccess com token único)
- [x] Atualizar `src/features/auth/sagas/authSaga.ts` (bootstrap via `/me`, auto-login pós-cadastro)
- [x] Atualizar `src/store/index.ts` (persistir apenas user/tokens; registrar getter do http)
- [x] Criar `src/components/FullScreenLoader.tsx`
- [x] Atualizar guards (`ProtectedRoute`, `PublicOnlyRoute`, `RoleRoute`) com estado idle/loading
- [x] Atualizar `src/App.tsx` (AuthBootstrap + handler 401 com navigate)
- [x] Remover credenciais mock do `LoginForm.tsx`
- [x] Atualizar `README.md`, `docs/auth-login-and-google.md`, `docs/auth-signup.md`
- [x] Rodar `npm run typecheck` e `npm run build`

