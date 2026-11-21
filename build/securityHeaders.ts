// SEC-17 / FE-40: cabeçalhos de segurança servidos pelo Cloudflare (arquivo `_headers` dos assets do Worker).
// Gerado no build porque a CSP depende da origem da API (VITE_API_BASE_URL).

/** Origens externas usadas pelo app. */
const GOOGLE = 'https://accounts.google.com';
const VIACEP = 'https://viacep.com.br';
const FONTS_CSS = 'https://fonts.googleapis.com';
const FONTS_FILES = 'https://fonts.gstatic.com';
// FE-42: Google Analytics 4 (só quando VITE_GA_MEASUREMENT_ID está definido; o script só carrega após consentimento).
const GA_SCRIPT = 'https://*.googletagmanager.com';
const GA_CONNECT = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'];

const origin = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * @param imagesOrigin VITE_IMAGES_ORIGIN — origem pública do bucket de imagens quando não é https (ex.: bucket local
 *   http://localhost:9090); em produção o R2 é https e já está coberto por `https:`.
 * @param analytics GA4 configurado (VITE_GA_MEASUREMENT_ID) — libera o gtag.js e os coletores do Google.
 */
export const contentSecurityPolicy = (apiBaseUrl: string | undefined, imagesOrigin?: string, analytics = false): string => {
  const api = origin(apiBaseUrl);
  const images = origin(imagesOrigin);
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `${GOOGLE}/gsi/client`, ...(analytics ? [GA_SCRIPT] : [])],
    // Login do Google injeta estilos; atributos style do React exigem 'unsafe-inline' em style-src.
    'style-src': ["'self'", "'unsafe-inline'", FONTS_CSS, `${GOOGLE}/gsi/style`],
    'font-src': ["'self'", FONTS_FILES],
    // Logos/fotos vêm do bucket público (R2, domínio definido no deploy); QR code do 2FA é data:.
    'img-src': ["'self'", 'data:', 'blob:', 'https:', ...(images ? [images] : [])],
    'connect-src': ["'self'", ...(api ? [api] : []), VIACEP, `${GOOGLE}/gsi/`, ...(analytics ? GA_CONNECT : [])],
    'frame-src': [`${GOOGLE}/gsi/`],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
};

export const headersFile = (apiBaseUrl: string | undefined, imagesOrigin?: string, analytics = false): string =>
  [
    '/*',
    `  Content-Security-Policy: ${contentSecurityPolicy(apiBaseUrl, imagesOrigin, analytics)}`,
    '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=(), usb=()',
    '  Cross-Origin-Opener-Policy: same-origin-allow-popups',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
