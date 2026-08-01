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
 * Persiste apenas `user` e `tokens` do estado de auth.
 * Flags efêmeras (`status`, `error`) são reconstruídas a partir do
 * initialState na reidratação.
 */
const authSanitizeTransform = createTransform(
  (inboundState: unknown) => {
    const root = inboundState as RootReducerState;

    if (root.auth) {
      return {
        ...root,
        auth: {
          user: root.auth.user,
          tokens: root.auth.tokens
        }
      };
    }

    return root;
  },
  (outboundState: unknown) => outboundState
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

