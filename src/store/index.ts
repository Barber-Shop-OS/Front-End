// Store: sessão (auth) + cache de dados do servidor (RTK Query). Nada persiste em localStorage
// (FE-37 / SEC-15): a sessão volta pelo cookie httpOnly de refresh.
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer, { sessionExpired } from '@/features/auth/authSlice';
import { activeContextReducer } from '@/features/workspace/activeContextSlice';
import { baseApi } from '@/services/baseApi';
import { setSessionExpiredHandler } from '@/services/http';

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      activeContext: activeContextReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

export const store = createStore();
setupListeners(store.dispatch);

// Refresh falhou (sessão expirada/revogada): limpa a sessão; os guards levam ao /login.
setSessionExpiredHandler(() => {
  store.dispatch(sessionExpired());
  store.dispatch(baseApi.util.resetApiState());
});

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
