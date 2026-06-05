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
        // FlowTrack brand — deep teal/emerald inspired by the reference design.
        brand: {
          50: '#eafaf5',
          100: '#cdf2e6',
          200: '#9fe6d2',
          300: '#66d4ba',
          400: '#34bd9f',
          500: '#14a085', // primary
          600: '#0d8570',
          700: '#0c6a5b',
          800: '#0d5449',
          900: '#0c453d',
          950: '#042b26',
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
        card: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.12)',
        'card-lg': '0 12px 40px -12px rgba(16,24,40,0.18)',
        glow: '0 10px 40px -10px rgba(20,160,133,0.55)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #14a085 0%, #0d6a5b 55%, #0c453d 100%)',
        'brand-radial': 'radial-gradient(120% 120% at 0% 0%, #1bb898 0%, #0d6a5b 45%, #0a3f38 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
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
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
