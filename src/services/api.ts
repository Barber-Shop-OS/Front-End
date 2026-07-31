/**
 * Compatibilidade: cliente HTTP centralizado.
 *
 * O novo cliente está em `src/services/http.ts`. Este módulo re-exporta
 * o cliente e utilitários para não quebrar imports existentes.
 */
export { default } from '@/services/http';
export type { ApiError } from '@/services/http';
export { normalizeApiError, setAccessTokenGetter } from '@/services/http';

