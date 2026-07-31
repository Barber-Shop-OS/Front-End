# State Management

## Estrutura Ativa (Produção)

O app usa a store TypeScript em `src/store/index.ts`, com:

- `configureStore` do `@reduxjs/toolkit`
- `persistReducer` + `persistStore` (`redux-persist`) com `whitelist: ['auth']`
- `serializableCheck` ignorando `FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER`
- Redux Saga como middleware de side effects
- Slice de auth em `src/features/auth/slices/authSlice.ts`

## Exemplo Isolado (Redux Persist)

Existe uma estrutura **isolada de exemplo** em `src/redux-persist-example/`
usando Redux Toolkit + Redux Persist com o estado
`{ user, token, isAuthenticated }` e arquivos `.js`/`.jsx`.

Ela foi isolada em pasta própria para **não conflitar** com a estrutura
TypeScript ativa. Veja `src/redux-persist-example/README.md` para detalhes
(dependências npm/yarn, estrutura de arquivos, exemplo de uso e como executar).

## O que Persistir (Redux Persist)

Persistir apenas dados essenciais para continuidade de sessao e preferencia:

- `auth.tokens` (access token, refresh token quando aplicavel)
- `auth.user` minimo necessario para bootstrap de sessao
- preferencias de UX (ex.: tema) quando existirem

## O que NAO Persistir

- Flags transitórias de UI (`loading`, `error`, modal aberto)
- Dados que podem ficar desatualizados rapidamente e devem ser recarregados
- Qualquer informacao sensivel desnecessaria

## Estado Global Efemero (Redux sem persist)

- Estado compartilhado entre multiplas telas
- Cache de dados de dominio enquanto a aplicacao esta aberta
- Status de requisicoes que impactam fluxos globais

## Estado Local de Componente

- Form states locais
- Controle de foco, hover, expand/collapse
- Micro estados que nao sao reutilizados fora do componente

## Convenções

- Reducers sempre puros e tipados
- Side effects somente em Saga
- Selectors para leitura consistente
