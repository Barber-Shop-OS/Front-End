import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

import { contentSecurityPolicy, headersFile } from './build/securityHeaders';

/** SEC-17 / FE-40: gera `dist/_headers` (CSP com a origem da API do ambiente). */
const securityHeaders = (apiBaseUrl: string | undefined, imagesOrigin: string | undefined): Plugin => ({
  name: 'barberos-security-headers',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile(apiBaseUrl, imagesOrigin) });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [react(), securityHeaders(env.VITE_API_BASE_URL, env.VITE_IMAGES_ORIGIN)],
    // `vite preview` (produção local) aplica a mesma CSP do Cloudflare para pegar violações antes do deploy.
    preview: { headers: { 'Content-Security-Policy': contentSecurityPolicy(env.VITE_API_BASE_URL, env.VITE_IMAGES_ORIGIN) } },
  };
});
