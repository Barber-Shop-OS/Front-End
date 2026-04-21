# Architecture

## Estrutura de Pastas

- `src/assets`: imagens, icones e fontes
- `src/components`: componentes globais e presentacionais (dumb components)
- `src/features`: modulos por dominio de negocio
  - Cada feature contem `components`, `slices`, `sagas`, `api`
- `src/hooks`: hooks globais e wrappers de biblioteca
- `src/layouts`: estruturas de pagina
- `src/pages`: pontos de entrada de rotas que compoem layouts + features
- `src/services`: clientes e configuracoes externas (ex.: Axios)
- `src/store`: rootReducer, rootSaga, persist e configuracao Redux
- `src/types`: tipagens globais
- `src/utils`: funcoes puras e utilitarios

## Fluxo de Dados

1. Componente dispara action
2. Saga observa action e executa regra assincrona
3. Saga chama camada de API (Axios)
4. Backend responde
5. Saga despacha success/failure
6. Slice atualiza Redux
7. Componente re-renderiza via selector

Fluxo canônico:

`Componente -> Action -> Saga -> Axios -> Backend -> Redux -> Componente`

## Princípios Arquiteturais

- Estado de dominio centralizado por feature.
- I/O externo isolado em `services` e `features/*/api`.
- Componentes de UI devem ser reutilizaveis e sem regra de negocio.
- Rotas privadas controladas por estado de autenticacao.
