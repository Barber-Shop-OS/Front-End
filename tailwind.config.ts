import type { Config } from 'tailwindcss';

// Tokens de design extraídos do Figma do BarberOS (docs/DESIGN_SYSTEM.md). Paleta no padrão Material 3.
// Use sempre os nomes (primary-600, surface-low, ink-variant, outline-variant…) — nada de hex literal nos
// componentes. Ao precisar de uma cor nova, extraia do Figma e adicione aqui.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // primary-600 = cor primária do Figma (#004ac6). 500 = primary-container (#2563eb).
        primary: {
          50: '#f1f3ff',
          100: '#dbe1ff', // primary-fixed
          200: '#b4c5ff', // inverse-primary
          300: '#acbfff', // primary-fixed-dim
          400: '#60a5fa',
          500: '#2563eb', // primary-container
          600: '#004ac6', // primary
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#00174b', // on-primary-fixed
          DEFAULT: '#004ac6',
        },
        secondary: { DEFAULT: '#495c95', on: '#394c84' },
        tertiary: { DEFAULT: '#943700', container: '#bc4800', fixed: '#ffdbcd' },
        surface: {
          DEFAULT: '#f9f9ff', // surface / background
          lowest: '#ffffff',
          low: '#f1f3ff', // surface-container-low
          container: '#e9edff', // surface-container
          high: '#e1e8fd', // surface-container-high
          highest: '#dce2f7', // surface-container-highest
        },
        ink: {
          DEFAULT: '#141b2b', // on-surface
          variant: '#434655', // on-surface-variant
          subtle: '#737686', // outline
        },
        outline: { DEFAULT: '#737686', variant: '#c3c6d7' },
        inverse: { surface: '#293040', on: '#edf0ff' },
        muted: '#64748b',
        success: { 50: '#ecfdf5', 600: '#059669', 700: '#047857' },
        warning: { 50: '#fff7ed', 600: '#bc4800', 700: '#943700' },
        danger: { 50: '#ffdad6', 600: '#ba1a1a', 700: '#93000a' },
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Haettenschweiler', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        soft: '0 8px 24px -4px rgba(20, 27, 43, 0.04)',
        ring: '0 0 0 1px rgba(195, 198, 215, 0.15)',
        primary: '0 10px 15px -3px rgba(0, 74, 198, 0.2), 0 4px 6px -4px rgba(0, 74, 198, 0.2)',
        float: '0 10px 30px -15px rgba(0, 74, 198, 0.1)',
        hero: '0 25px 50px -12px rgba(0, 74, 198, 0.05)',
        sidebar: '4px 0 24px -4px rgba(0, 74, 198, 0.05)',
        elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      letterSpacing: {
        label: '0.1em', // rótulos em caixa-alta (12–14px, tracking 1.2–1.4px)
      },
    },
  },
  plugins: [],
} satisfies Config;
