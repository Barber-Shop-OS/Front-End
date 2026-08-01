# Redux Persist — Exemplo Isolado

Estrutura **isolada** de exemplo usando **Redux Toolkit** + **Redux Persist**,
criada em `src/redux-persist-example/` para não conflitar com a configuração
TypeScript existente do projeto (`src/store`, `src/features/auth/slices/authSlice.ts`).

## 1. Dependências

As dependências já estão instaladas neste projeto (`package.json`), mas caso
precise instalá-las em outro projeto:

### npm

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### yarn

```bash
yarn add @reduxjs/toolkit react-redux redux-persist
```

> `react-redux` é necessário para `<Provider>` (injeção da store) e para os hooks
> `useDispatch` / `useSelector`.

## 2. Estrutura dos Arquivos

```
src/redux-persist-example/
├── main.jsx                        # Entry isolado: <Provider> + <PersistGate>
├── App.jsx                         # Componente raiz do exemplo
├── README.md                       # Este arquivo
├── components/
│   └── AuthSessionExample.jsx      # Exemplo de uso (dispatch + useSelector)
└── store/
    ├── index.js                    # configureStore + persistReducer + persistor
    └── slices/
        └── authSlice.js            # Slice de auth: { user, token, isAuthenticated }
```

## 3. Arquivos Gerados

### `store/slices/authSlice.js`

- Estado inicial: `{ user: null, token: null, isAuthenticated: false }`
- `loginSuccess`: recebe `{ user, token }` e marca `isAuthenticated: true`
- `logout`: limpa todos os dados

### `store/index.js`

- `combineReducers` agrupa os reducers (aqui apenas `auth`)
- `persistConfig` com `key: 'root'`, `storage` (localStorage) e `whitelist: ['auth']`
- `persistReducer` envolve o rootReducer
- `configureStore` com middleware ignorando as ações internas do Redux Persist
  (`FLUSH`, `REHYDRATE`, `PAUSE`, `PERSIST`, `PURGE`, `REGISTER`) para evitar
  warnings de `serializableCheck`
- Exporta `store` e `persistor`

### `main.jsx` (entry)

```jsx
<Provider store={store}>
  <PersistGate loading={<p>Carregando sessão...</p>} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

## 4. Exemplo de Uso nos Componentes

No componente `AuthSessionExample.jsx`:

### Disparar login (`useDispatch` + `loginSuccess`)

```jsx
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';

const dispatch = useDispatch();

dispatch(
  loginSuccess({
    user: { id: '1', name: 'Anderson', email: 'a@b.com' },
    token: 'jwt-token',
  }),
);
```

### Ler dados salvos/persistidos (`useSelector`)

```jsx
import { useSelector } from 'react-redux';

const user = useSelector((state) => state.auth.user);
const token = useSelector((state) => state.auth.token);
const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
```

### Logout

```jsx
import { logout } from '../store/slices/authSlice';

dispatch(logout());
```

## 5. Como Executar Este Exemplo

O projeto principal usa `src/main.tsx` como entry. Para testar este exemplo
isolado, você pode:

1. **Temporariamente** trocar o entry em `index.html`:

   ```html
   <script type="module" src="/src/redux-persist-example/main.jsx"></script>
   ```

2. Rodar o dev server:

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

3. Clicar em **"Simular Login"**, depois recarregar a página (F5). O estado
   será restaurado do `localStorage` (chave `persist:root`) via Redux Persist.

> **Importante**: este é um exemplo isolado. Em produção, o app usa a store
> TypeScript em `src/store/index.ts`, com Sagas e API integration.

