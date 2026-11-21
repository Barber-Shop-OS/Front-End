// FE-42: escolha do visitante sobre cookies não essenciais (LGPD).
// - Guardada no navegador (localStorage) para não perguntar de novo a cada visita;
// - registrada na API (BE-58) como prova do consentimento — se a chamada falhar, reenvia na próxima visita;
// - perguntamos de novo quando a política de cookies muda de versão ou após 12 meses.
import { useSyncExternalStore } from 'react';

import { COOKIE_POLICY_VERSION } from '@/config/env';
import http from '@/services/http';

import { applyAnalyticsConsent } from './analytics';

export type ConsentAction = 'accept_all' | 'reject_all' | 'custom' | 'withdraw';

export interface CookieConsent {
  /** Identificador aleatório deste navegador (liga o histórico de escolhas). */
  id: string;
  version: string;
  analytics: boolean;
  decidedAt: string;
  action: ConsentAction;
  synced: boolean;
}

export const STORAGE_KEY = 'barberos:cookie-consent';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

const listeners = new Set<() => void>();
const preferenceListeners = new Set<() => void>();

const readRaw = (): CookieConsent | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.id !== 'string' || typeof parsed.analytics !== 'boolean' || typeof parsed.decidedAt !== 'string') return null;
    return parsed as CookieConsent;
  } catch {
    return null;
  }
};

/** Escolha válida (mesma versão da política e com menos de 12 meses) ou null. */
const readValid = (): CookieConsent | null => {
  const stored = readRaw();
  if (!stored) return null;
  if (stored.version !== COOKIE_POLICY_VERSION) return null;
  if (Date.now() - new Date(stored.decidedAt).getTime() > MAX_AGE_MS) return null;
  return stored;
};

let snapshot: CookieConsent | null = typeof window === 'undefined' ? null : readValid();

const write = (value: CookieConsent) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sem storage (aba anônima restrita): vale só nesta página
  }
  snapshot = value;
  listeners.forEach((listener) => listener());
};

const newId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Fallback RFC 4122 v4.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const sync = async (value: CookieConsent) => {
  try {
    await http.post('/consents/cookies', {
      consent_id: value.id,
      policy_version: value.version,
      analytics: value.analytics,
      marketing: false,
      action: value.action,
    });
    if (snapshot && snapshot.id === value.id && snapshot.decidedAt === value.decidedAt) write({ ...snapshot, synced: true });
  } catch {
    // fica synced=false e reenvia na próxima visita
  }
};

export const getCookieConsent = (): CookieConsent | null => snapshot;

/** Grava a escolha, aplica ao GA4 e registra na API. */
export const saveCookieConsent = (analytics: boolean, action: ConsentAction): CookieConsent => {
  const previous = readRaw();
  const value: CookieConsent = {
    id: previous?.id ?? newId(),
    version: COOKIE_POLICY_VERSION,
    analytics: action === 'reject_all' || action === 'withdraw' ? false : analytics,
    decidedAt: new Date().toISOString(),
    action,
    synced: false,
  };
  write(value);
  applyAnalyticsConsent(value.analytics);
  void sync(value);
  return value;
};

/** Na carga do app: aplica a escolha salva e reenvia o registro pendente. */
export const initCookieConsent = (): void => {
  const current = readValid();
  if (current?.decidedAt !== snapshot?.decidedAt) {
    snapshot = current;
    listeners.forEach((listener) => listener());
  }
  if (!snapshot) return;
  applyAnalyticsConsent(snapshot.analytics);
  if (!snapshot.synced) void sync(snapshot);
};

export const subscribeCookieConsent = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useCookieConsent = (): CookieConsent | null =>
  useSyncExternalStore(subscribeCookieConsent, getCookieConsent, () => null);

/** Abre o painel "Preferências de cookies" (rodapé, política de privacidade, minha conta). */
export const openCookiePreferences = (): void => preferenceListeners.forEach((listener) => listener());

export const onOpenCookiePreferences = (listener: () => void): (() => void) => {
  preferenceListeners.add(listener);
  return () => preferenceListeners.delete(listener);
};

/** Só para testes. */
export const __resetConsentForTests = (): void => {
  snapshot = null;
};
