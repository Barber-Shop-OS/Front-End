import { describe, expect, it } from 'vitest';

import { contentSecurityPolicy, headersFile } from './securityHeaders';

describe('cabeçalhos de segurança (SEC-17)', () => {
  it('CSP libera só a origem da API, o login do Google e o ViaCEP', () => {
    const csp = contentSecurityPolicy('https://api.barberos.com.br/');
    expect(csp).toContain("connect-src 'self' https://api.barberos.com.br https://viacep.com.br https://accounts.google.com/gsi/");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self' https://accounts.google.com/gsi/client");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('origem do bucket de imagens opcional entra em img-src', () => {
    expect(contentSecurityPolicy('https://api.x.com', 'http://localhost:9090/barberos')).toContain("img-src 'self' data: blob: https: http://localhost:9090;");
  });

  it('GA4 só entra na CSP quando configurado (FE-42)', () => {
    expect(contentSecurityPolicy('https://api.x.com')).not.toContain('googletagmanager');
    const csp = contentSecurityPolicy('https://api.x.com', undefined, true);
    expect(csp).toContain("script-src 'self' https://accounts.google.com/gsi/client https://*.googletagmanager.com;");
    expect(csp).toContain('https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com');
    expect(headersFile('https://api.x.com', undefined, true)).toContain('googletagmanager');
  });

  it('URL inválida não entra na CSP', () => {
    expect(contentSecurityPolicy('não é url')).toContain("connect-src 'self' https://viacep.com.br");
  });

  it('arquivo _headers tem HSTS, nosniff e cache imutável dos assets', () => {
    const file = headersFile('https://api.barberos.com.br');
    expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy: /);
    expect(file).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    expect(file).toContain('X-Content-Type-Options: nosniff');
    expect(file).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable');
  });
});
