# AI Context

## Propósito do Projeto

Este frontend é a camada de experiência do usuário de um SaaS, desacoplado do backend. Toda integração acontece exclusivamente via API REST.

## Stack Oficial

- React com preparação para React Compiler
- TypeScript em modo estrito
- Vite como bundler
- Tailwind CSS para estilização utilitária
- React Router DOM para navegação
- Redux Toolkit para estado global
- Redux Persist para estado persistente essencial
- Redux Saga para side effects e fluxos assíncronos
- Axios para cliente HTTP com interceptors

## Diretrizes de Código

- Priorizar Clean Code: funções pequenas, nomes explícitos e responsabilidades únicas.
- Seguir SOLID no frontend:
  - Single Responsibility em componentes, hooks e services.
  - Open/Closed para extensão por composição e configuração.
  - Dependency Inversion via camadas (componentes não conhecem cliente HTTP diretamente).
- Evitar uso de `any`; preferir tipos explícitos, `unknown` e narrowing seguro.
- Separar apresentação de regra de negócio:
  - UI reutilizável em `src/components`
  - Domínio em `src/features/*`
- Side effects devem ficar em sagas; reducers permanecem puros.

## Como Agentes de IA Devem Evoluir o Projeto

- Criar novas features sempre em `src/features/<dominio>` com subpastas `components`, `slices`, `sagas`, `api`.
- Reusar componentes globais antes de criar novos.
- Ao adicionar chamadas de API:
  - usar `src/services/api.ts`
  - tratar erro de forma consistente
  - evitar chamadas HTTP diretas em componentes
- Atualizar documentação em `docs/` sempre que mudar arquitetura, roteamento ou estado.
- Preservar tipagem estrita e não introduzir acoplamento desnecessário.
