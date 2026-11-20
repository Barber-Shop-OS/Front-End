import type { Config } from 'tailwindcss';

// FE-06: tokens de design. Use as cores pelo nome (primary-600, surface, muted...) — nada de hex
// literal nos componentes.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#8aa8fb',
          400: '#5a80f0',
          500: '#2f5fe3',
          600: '#0b4bd8',
          700: '#0a3db0',
          800: '#0c338c',
          900: '#0f2c6e',
        },
        surface: '#f7f8fe',
        muted: '#64748b',
        success: { 50: '#ecfdf5', 600: '#059669', 700: '#047857' },
        warning: { 50: '#fffbeb', 600: '#d97706', 700: '#b45309' },
        danger: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
