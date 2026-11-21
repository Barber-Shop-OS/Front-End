// Cliente HTTP (Axios) da API.
// FE-37: access token só em memória; em 401 tenta POST /auth/refresh UMA vez (requisições
// concorrentes esperam o mesmo refresh) e repete a original. Refresh falhou → sessão encerrada.
// O refresh token fica em cookie httpOnly (BE-30); por isso `withCredentials` e o header
// X-Requested-With (proteção CSRF exigida pela API).
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { API_URL, AUTH_URL } from '@/config/env';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' && value !== null && 'status' in value && 'message' in value;

/** Converte qualquer erro em ApiError { status, message, code, details }. */
export const normalizeApiError = (error: unknown): ApiError => {
  // AxiosError (axios ≥ 1.7) também tem `status` e `message`: tratar antes de isApiError.
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: unknown; code?: unknown; details?: unknown } | undefined;
    if (!error.response) {
      return { status: 0, message: 'Sem conexão com o servidor. Verifique sua internet.', code: 'NETWORK_ERROR' };
    }
    return {
      status: error.response.status,
      message: typeof data?.message === 'string' ? data.message : 'Algo deu errado. Tente novamente.',
      code: typeof data?.code === 'string' ? data.code : undefined,
      details: data?.details,
    };
  }
  if (isApiError(error)) return error;
  return { status: 500, message: 'Erro inesperado.', code: 'INTERNAL' };
};

let accessToken: string | null = null;
export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

let sessionExpiredHandler: (() => void) | null = null;
/** Chamado quando o refresh falha (sessão realmente expirada). */
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler;
};

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

/** Chamadas de sessão vão para /api/auth (onde o cookie de refresh vale). */
export const authHttp = axios.create({
  baseURL: AUTH_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

const attachToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};
http.interceptors.request.use(attachToken);
authHttp.interceptors.request.use(attachToken);

let refreshing: Promise<string | null> | null = null;

/** Renova o access token (uma chamada por vez; as demais aguardam a mesma promessa). */
export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshing) {
    refreshing = authHttp
      .post<{ token: string }>('/refresh')
      .then((response) => {
        setAccessToken(response.data.token);
        return response.data.token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401 && error.config) {
      const original = error.config as RetriableConfig;
      if (!original._retried) {
        original._retried = true;
        const token = await refreshAccessToken();
        if (token) {
          original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
          return http.request(original);
        }
        sessionExpiredHandler?.();
      }
    }
    return Promise.reject(normalizeApiError(error));
  }
);

authHttp.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error))
);

export default http;
