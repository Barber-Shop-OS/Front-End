import axios, { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
}

const extractErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message: unknown }).message;
    return typeof message === 'string' ? message : null;
  }

  return null;
};

let accessTokenGetter: () => string | null = () => null;

export const setAccessTokenGetter = (getter: () => string | null): void => {
  accessTokenGetter = getter;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = accessTokenGetter();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401) {
      console.warn('Unauthorized request detected.');
    }

    return Promise.reject(apiError);
  }
);

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

export default api;
