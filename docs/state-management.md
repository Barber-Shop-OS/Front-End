# State Management

## Estrutura Ativa (Produção)

O app usa a store TypeScript em `src/store/index.ts`, com:

- `configureStore` do `@reduxjs/toolkit`
- `persistReducer` + `persistStore` (`redux-persist`) com `whitelist: ['auth']`
- `createTransform` para persistir apenas `auth.user` e `auth.tokens`
  (flags efêmeras como `status` e `error` são reconstruídas no bootstrap)
- `serializableCheck` ignorando `FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER`
- Redux Saga como middleware de side effects
- Slice de auth em `src/features/auth/slices/authSlice.ts`
- Selectors tipados em `src/features/auth/selectors.ts`

## Estrutura de Arquivos

```text
src/
  store/
    index.ts          # configureStore + persistReducer + persistor + saga
    rootReducer.ts    # combineReducers
    rootSaga.ts       # root saga (fork de authSaga)
  features/auth/
    slices/authSlice.ts   # estado + actions (bootstrap, login, signup, logout)
    sagas/authSaga.ts     # side effects (bootstrap /me, login, signup, logout)
    api/authApi.ts        # camada de API da feature
    selectors.ts          # selectors tipados de auth
  hooks/redux.ts          # useAppDispatch / useAppSelector tipados
```

## Fluxo de Dados

1. Componente dispara action
2. Saga observa action e executa regra assíncrona
3. Saga chama camada de API (`src/services/http.ts`)
4. Backend responde
5. Saga despacha success/failure
6. Slice atualiza Redux
7. Componente re-renderiza via selector

## O que Persistir (Redux Persist)

Persistir apenas dados essenciais para continuidade de sessão:

- `auth.tokens` (access token)
- `auth.user` mínimo necessário para bootstrap de sessão

O transform de persistência (`authSanitizeTransform` em `src/store/index.ts`)
garante que apenas esses campos sejam gravados no `localStorage`.

## O que NAO Persistir

- Flags transitórias de UI (`loading`, `error`, modal aberto)
- Dados que podem ficar desatualizados rapidamente e devem ser recarregados
- Qualquer informação sensível desnecessária

## Selectors

Os componentes não acessam `state.auth.*` diretamente. A leitura é feita
através dos selectors em `src/features/auth/selectors.ts`:

- `selectAuthState`
- `selectAuthStatus`
- `selectAuthUser`
- `selectAuthTokens`
- `selectAuthError`
- `selectIsAuthenticated`
- `selectAuthRole`
- `selectAccessToken`

## Estado Global Efemero (Redux sem persist)

- Estado compartilhado entre múltiplas telas
- Cache de dados de domínio enquanto a aplicação está aberta
- Status de requisições que impactam fluxos globais

## Estado Local de Componente

- Form states locais
- Controle de foco, hover, expand/collapse
- Micro estados que não são reutilizados fora do componente

## Convenções

- Reducers sempre puros e tipados
- Side effects somente em Saga
- Selectors para leitura consistente

