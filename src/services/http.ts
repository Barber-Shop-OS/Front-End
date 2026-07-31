import axios, { AxiosError } from 'axios';

import { API_URL } from '@/config/api';

export interface ApiError {
  status: number;
  message: string;
}

/** Extrai a mensagem de erro no formato `{ message: string }` do backend. */
const extractErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message: unknown }).message;
    return typeof message === 'string' ? message : null;
  }

  return null;
};

/**
 * Normaliza qualquer erro em um `ApiError` consistente.
 * - Erros do Axios: usa `error.response.data.message` quando existir.
 * - Erros desconhecidos: retorna erro genérico 500.
 */
export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const apiMessage = extractErrorMessage(error.response?.data);

    return {
      status: error.response?.status ?? 500,
      message: apiMessage ?? error.message
    };
  }

  return {
    status: 500,
    message: 'Unexpected API error.'
  };
};

let accessTokenGetter: () => string | null = () => null;

/**
 * Registra a função que retorna o token de acesso atual.
 * Chamado uma única vez no bootstrap da store.
 */
export const setAccessTokenGetter = (getter: () => string | null): void => {
  accessTokenGetter = getter;
};

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registra o callback executado quando qualquer requisição recebe 401.
 * Usado para limpar a sessão e redirecionar para /login.
 */
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

/** Cliente HTTP centralizado (Axios) com interceptors de autenticação. */
const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

http.interceptors.request.use((config) => {
  const token = accessTokenGetter();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401) {
      unauthorizedHandler?.();
    }

    return Promise.reject(apiError);
  }
);

export default http;

