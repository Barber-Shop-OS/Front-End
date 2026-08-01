  # TODO — Consolidação Definitiva do Redux (Auth)

## Objetivo
Remover o exemplo isolado `redux-persist-example/`, consolidar a store com
persistência tipada e criar selectors tipados de auth — deixando o Redux,
Redux Saga e Redux Persist claros e definitivos no projeto.

## Etapas
- [x] Remover `src/redux-persist-example/` (exemplo isolado JS/JSX)
- [x] Reescrever `src/store/index.ts` com `createTransform` tipado (persiste apenas `user` e `tokens`)
- [x] Criar `src/features/auth/selectors.ts` (selectors tipados de auth)
- [x] Atualizar guards (`ProtectedRoute`, `PublicOnlyRoute`, `RoleRoute`) para usar selectors
- [x] Atualizar `LoginForm`, `SignupForm`, `App`, `DashboardPage`, `NewAppointmentPage` para usar selectors
- [x] Atualizar `docs/state-management.md` (remover referência ao exemplo, documentar estrutura definitiva)
- [x] Rodar `npm run typecheck` e `npm run build`

