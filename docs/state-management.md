# State Management

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
