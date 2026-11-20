// FE-03: configuração do ambiente. Toda variável VITE_* passa por aqui.
const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const rawApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (import.meta.env.PROD && !rawApiBase) {
  // Build de produção sem API configurada: falha alto em vez de apontar para localhost.
  throw new Error('VITE_API_BASE_URL não definido no build de produção');
}

/** Origem da API (sem /api). */
export const API_BASE_URL: string = normalizeBaseUrl(rawApiBase ?? 'http://localhost:3000');

/** Prefixo versionado das rotas (BE-48). */
export const API_URL = `${API_BASE_URL}/api/v1`;

/** Prefixo das rotas de sessão — o cookie de refresh tem Path=/api/auth (BE-30). */
export const AUTH_URL = `${API_BASE_URL}/api/auth`;

/** Client ID do Google; sem ele os botões do Google ficam ocultos (sem fallback fixo no código). */
export const GOOGLE_CLIENT_ID: string | undefined = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || undefined;

/** Versão dos termos de uso/privacidade aceita no cadastro (BE-40). */
export const TERMS_VERSION: string = (import.meta.env.VITE_TERMS_VERSION as string | undefined) || '2026-11';

/** URL pública do app (links compartilháveis). */
export const APP_URL: string = normalizeBaseUrl(
  (import.meta.env.VITE_APP_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
);
