import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };

  // O build de produção não pode cair no fallback de localhost.
  if (command === 'build' && !env.VITE_API_BASE_URL?.trim()) {
    throw new Error(
      'Defina VITE_API_BASE_URL (ex.: https://api.seudominio.com) para gerar o build.'
    );
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [react()]
  };
});
