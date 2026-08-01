import type { RootState } from '@/store';
import type { AuthState, AuthTokens, AuthUser, UserRole } from '@/types';

/**
 * Selectors tipados do domínio de auth.
 *
 * Centralizam a leitura do estado Redux para que os componentes não
 * acessem `state.auth.*` diretamente (fonte única de consulta).
 */

/** Estado completo do slice de autenticação. */
export const selectAuthState = (state: RootState): AuthState => state.auth;

/** Status atual da autenticação (idle | loading | authenticated | unauthenticated). */
export const selectAuthStatus = (state: RootState): AuthState['status'] =>
  state.auth.status;

/** Usuário autenticado ou `null`. */
export const selectAuthUser = (state: RootState): AuthUser | null =>
  state.auth.user;

/** Tokens de sessão ou `null`. */
export const selectAuthTokens = (state: RootState): AuthTokens | null =>
  state.auth.tokens;

/** Mensagem de erro de autenticação ou `null`. */
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;

/** `true` apenas quando a sessão está autenticada. */
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated';

/** Role normalizada do usuário autenticado (customer | barber | owner). */
export const selectAuthRole = (state: RootState): UserRole | undefined =>
  state.auth.user?.role;

/** Token de acesso atual ou `null`. */
export const selectAccessToken = (state: RootState): string | null =>
  state.auth.tokens?.accessToken ?? null;

