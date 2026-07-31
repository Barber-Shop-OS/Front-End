import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';

/**
 * Configuração da store — EXEMPLO ISOLADO
 *
 * - combineReducers: agrupa os reducers do app (aqui apenas auth).
 * - persistConfig: define a chave "root" no localStorage e persiste
 *   apenas o reducer "auth".
 * - persistReducer: envolve o rootReducer para persistir/reativar o estado.
 * - configureStore: cria a store com Redux Toolkit.
 * - middleware: serializableCheck ignora as actions internas do Redux Persist,
 *   evitando warnings no console.
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

