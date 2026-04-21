import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf7',
          100: '#d6f5eb',
          500: '#14b889',
          600: '#109e75',
          700: '#0d7f5f'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
