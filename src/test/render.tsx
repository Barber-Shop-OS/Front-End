// FE-32: render de páginas/componentes com store real, rotas e toasts; a API é simulada pelo MSW
// (handlers por teste em `server.use(...)`). Base da API dos testes: http://api.test (vitest.config.ts).
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { ToastProvider } from '@/components/ui';
import { setAccessToken } from '@/services/http';
import { createStore } from '@/store';
import type { Me } from '@/types/api';

export const API = 'http://api.test/api/v1';
export const AUTH = 'http://api.test/api/auth';

export const server = setupServer();

export const baseMe = (overrides: Partial<Me> = {}): Me =>
  ({
    id: 1,
    name: 'Ana Dona',
    email: 'ana@barberos.dev',
    phone: '11999990000',
    role: 'owner',
    roles: ['owner'],
    email_verified_at: '2026-11-01T00:00:00.000Z',
    created_at: '2026-11-01T00:00:00.000Z',
    barbershops: [],
    barber_profiles: [],
    billing_banner: null,
    billing_banners: [],
    two_factor_enabled: false,
    two_factor_required: false,
    ...overrides,
  }) as Me;

interface Options {
  route?: string;
  path?: string;
  me?: Me | null;
  /** Rotas extras (destinos de navegação) para conferir redirecionamentos. */
  extraRoutes?: Record<string, ReactElement>;
}

export const renderWithApp = (ui: ReactElement, { route = '/', path = '*', me = null, extraRoutes = {} }: Options = {}) => {
  const store = createStore();
  if (me) {
    setAccessToken('test-token');
    store.dispatch({ type: 'auth/start/fulfilled', payload: me });
  } else {
    setAccessToken(null);
  }
  const result = render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            {Object.entries(extraRoutes).map(([extraPath, element]) => (
              <Route key={extraPath} path={extraPath} element={element} />
            ))}
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Provider>
  );
  return { store, ...result };
};
