import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // Prepared for React Compiler: enable Babel plugin when upgrading stack to compatible React release.
  plugins: [react()]
});
