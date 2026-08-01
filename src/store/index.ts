import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';

import { setAccessTokenGetter } from '@/services/http';

import rootReducer, { type RootReducerState } from './rootReducer';
import rootSaga from './rootSaga';

/**
 * Persiste apenas os dados essenciais da sessão (`user` e `tokens`).
 * Flags efêmeras (`status`, `error`) são reconstruídas a partir do
 * initialState do slice na reidratação.
 *
 * O transform é aplicado ao estado de cada slice incluído no whitelist
 * (aqui apenas `auth`), portanto `inboundState` já é um `AuthState`.
 */
const authSanitizeTransform = createTransform(
  (inboundState: { user?: unknown; tokens?: unknown }) => ({
    user: inboundState.user ?? null,
    tokens: inboundState.tokens ?? null
  }),
  (outboundState: { user?: unknown; tokens?: unknown }) => ({
    user: outboundState.user ?? null,
    tokens: outboundState.tokens ?? null
  })
);

const persistConfig: PersistConfig<RootReducerState> = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transforms: [authSanitizeTransform]
};

const sagaMiddleware = createSagaMiddleware();

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(sagaMiddleware)
});

export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

setAccessTokenGetter(() => store.getState().auth.tokens?.accessToken ?? null);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

