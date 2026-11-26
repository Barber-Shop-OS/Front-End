/**
 * Configuração centralizada da API.
 *
 * Todas as leituras de variáveis de ambiente relacionadas ao backend
 * devem passar por este arquivo. Para publicar em outro ambiente, basta
 * definir as variáveis no build, ex.: VITE_API_BASE_URL=https://api.meudominio.com
 */

/** Usado apenas em desenvolvimento local (`npm run dev`). */
const DEV_API_BASE_URL = 'http://localhost:3000';

/** Remove a barra final da URL base para evitar "//api" na concatenação. */
const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const resolveApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return normalizeBaseUrl(fromEnv);

  // Em build de produção não há fallback para localhost: o build precisa
  // receber VITE_API_BASE_URL (ver vite.config.ts, que falha o build sem ela).
  if (import.meta.env.PROD) {
    throw new Error('VITE_API_BASE_URL não definida no build de produção.');
  }

  return DEV_API_BASE_URL;
};

/** URL base da API (apenas origem/host), sem "/api". */
export const API_BASE_URL: string = resolveApiBaseUrl();

/** URL base já com o prefixo "/api" usado pelas rotas do backend. */
export const API_URL: string = `${API_BASE_URL}/api`;

/** Habilita o fluxo de autenticação com mocks locais (sem backend). Nunca em produção. */
export const USE_MOCK_AUTH: boolean =
  !import.meta.env.PROD && import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/** Client ID do Google OAuth (público por natureza, mas vem do ambiente). */
export const GOOGLE_CLIENT_ID: string | undefined =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || undefined;

/**
 * Login/cadastro com Google só aparece quando o backend tiver o endpoint
 * (VITE_GOOGLE_AUTH_ENABLED=true) e houver Client ID — ou no modo mock local.
 */
export const GOOGLE_AUTH_ENABLED: boolean =
  USE_MOCK_AUTH ||
  (import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true' && Boolean(GOOGLE_CLIENT_ID));
