/**
 * Configuração centralizada da API.
 *
 * Todas as leituras de variáveis de ambiente relacionadas ao backend
 * devem passar por este arquivo. Assim, para publicar em outro ambiente,
 * a única alteração necessária é a variável de ambiente, ex.:
 *   VITE_API_BASE_URL=https://api.meudominio.com
 */

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

/** Remove a barra final da URL base para evitar "//api" na concatenação. */
const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

/** URL base da API (apenas origem/host), sem "/api". */
export const API_BASE_URL: string = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

/** URL base já com o prefixo "/api" usado pelas rotas do backend. */
export const API_URL: string = `${API_BASE_URL}/api`;

/** Habilita o fluxo de autenticação com mocks locais (sem backend). */
export const USE_MOCK_AUTH: boolean =
  import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/** Client ID do Google OAuth. */
export const GOOGLE_CLIENT_ID: string | undefined =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "644338454460-60sdpois6ijhitqv81plildvsdesqvs9.apps.googleusercontent.com";

