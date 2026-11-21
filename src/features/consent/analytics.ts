// FE-42: Google Analytics 4 só depois do consentimento (LGPD art. 7º I e 8º).
// - Nada do Google é carregado antes de o visitante aceitar "Estatísticas" no banner.
// - Consent Mode v2: tudo negado por padrão; só `analytics_storage` é liberado. Publicidade fica sempre negada
//   (sem Google Signals, sem personalização de anúncios).
// - Revogar: consent update → denied, `ga-disable-<ID>` e remoção dos cookies `_ga*`.
// - Minimização: o endereço enviado não tem query string nem hash e troca tokens/IDs por marcadores;
//   nas áreas logadas o título da aba (que pode ter nome de pessoa) não é enviado. Nunca enviamos user_id.
import { GA_MEASUREMENT_ID } from '@/config/env';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** Cookies do GA4 expiram em ~13 meses (padrão do Google é 2 anos). */
const COOKIE_EXPIRES_SECONDS = 60 * 60 * 24 * 395;

const PRIVATE_PREFIXES = ['/dashboard', '/barbeiro', '/atendimento', '/admin', '/cliente', '/conta', '/nova-barbearia'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let loaded = false;
let granted = false;
let lastPath: string | null = null;

export const isAnalyticsConfigured = (): boolean => Boolean(GA_MEASUREMENT_ID);

/** Caminho sem dados pessoais: `/convite/<token>` → `/convite/:token`; números, UUIDs e hashes → `:id`. */
export const sanitizePath = (pathname: string): string => {
  const segments = pathname.split('?')[0].split('#')[0].split('/');
  return segments
    .map((segment, index) => {
      if (!segment) return segment;
      if (segments[index - 1] === 'convite') return ':token';
      if (/^\d+$/.test(segment) || UUID.test(segment) || /^[A-Za-z0-9_-]{24,}$/.test(segment)) return ':id';
      return segment;
    })
    .join('/');
};

const isPrivate = (path: string): boolean => PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

// O gtag.js espera o objeto `arguments` no dataLayer, não um array — por isso function e não arrow.
function gtag(..._args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const load = (id: string) => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  gtag('js', new Date());
  gtag('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: COOKIE_EXPIRES_SECONDS,
    cookie_flags: 'SameSite=Lax;Secure',
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.analytics = 'ga4';
  document.head.appendChild(script);
  loaded = true;
};

/** Apaga `_ga`, `_ga_<ID>`, `_gid` e `_gat` no domínio atual e nos domínios-pai. */
export const clearAnalyticsCookies = (): void => {
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat'));
  if (!names.length) return;
  const parts = window.location.hostname.split('.');
  const domains = ['', ...parts.map((_, index) => parts.slice(index).join('.')).filter((domain) => domain.includes('.'))];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=.${domain}` : ''}`;
    }
  }
};

const send = (path: string) => {
  if (!GA_MEASUREMENT_ID || !granted || !window.gtag) return;
  const clean = sanitizePath(path);
  window.gtag('event', 'page_view', {
    page_location: `${window.location.origin}${clean}`,
    page_path: clean,
    page_title: isPrivate(clean) ? clean : document.title,
  });
};

/** Liga ou desliga o GA4 conforme a escolha do visitante. */
export const applyAnalyticsConsent = (allow: boolean): void => {
  const id = GA_MEASUREMENT_ID;
  if (!id) return;
  if (allow) {
    window[`ga-disable-${id}`] = false;
    if (!loaded) load(id);
    gtag('consent', 'update', { analytics_storage: 'granted' });
    const wasGranted = granted;
    granted = true;
    if (!wasGranted && lastPath) send(lastPath);
    return;
  }
  granted = false;
  if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
  window[`ga-disable-${id}`] = true;
  clearAnalyticsCookies();
};

/** Chamado a cada troca de rota (SPA). Sem consentimento, só guarda o caminho. */
export const trackPageView = (path: string): void => {
  lastPath = path;
  send(path);
};

/** Evento customizado (ex.: `sign_up`). Não envie dados pessoais nos parâmetros. */
export const trackEvent = (name: string, params: Record<string, string | number | boolean> = {}): void => {
  if (!GA_MEASUREMENT_ID || !granted || !window.gtag) return;
  window.gtag('event', name, params);
};

/** Só para testes. */
export const __resetAnalyticsForTests = (): void => {
  loaded = false;
  granted = false;
  lastPath = null;
  delete window.gtag;
  delete window.dataLayer;
  document.querySelectorAll('script[data-analytics="ga4"]').forEach((node) => node.remove());
};
