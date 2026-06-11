import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './preview/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // DollarMemo brand — driven by CSS variables so the accent color is
        // user-selectable at runtime (see globals.css [data-accent] + Settings).
        // Default values (teal) live in globals.css :root.
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)', // primary
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        // Semantic money colors
        income: '#16b981',
        expense: '#f4715f', // coral red from the reference screenshots
        // Neutral surfaces (light + dark handled via CSS vars below)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--ink-soft) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Layered, low-alpha shadows read as "expensive": a crisp key line,
        // a soft ambient pass, and a wide diffuse falloff.
        card: '0 1px 2px rgba(16,24,40,0.04), 0 4px 10px -4px rgba(16,24,40,0.05), 0 20px 36px -20px rgba(16,24,40,0.10)',
        'card-lg': '0 2px 4px rgba(16,24,40,0.04), 0 12px 24px -8px rgba(16,24,40,0.08), 0 28px 56px -16px rgba(16,24,40,0.14)',
        glow: '0 10px 40px -10px rgb(var(--brand-500) / 0.55)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, rgb(var(--brand-500)) 0%, rgb(var(--brand-700)) 55%, rgb(var(--brand-900)) 100%)',
        'brand-radial':
          'radial-gradient(120% 120% at 0% 0%, rgb(var(--brand-400)) 0%, rgb(var(--brand-700)) 45%, rgb(var(--brand-900)) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'page-in': 'page-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
