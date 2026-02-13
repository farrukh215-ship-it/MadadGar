import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdfa',
          100: '#d1faf5',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: {
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          sunken: 'var(--surface-sunken)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.25' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
        'premium': '0 4px 20px -4px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
        'premium-hover': '0 12px 32px -8px rgba(0,0,0,0.1), 0 4px 12px -4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        'premium-brand': '0 10px 25px -5px rgba(20,184,166,0.35), 0 4px 10px -6px rgba(20,184,166,0.2)',
        'premium-brand-hover': '0 14px 30px -5px rgba(20,184,166,0.4), 0 6px 14px -6px rgba(20,184,166,0.25)',
        'elevated': '0 20px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.18s ease-out',
        'slide-in-right': 'slideInRight 0.15s ease-out',
        'shimmer': 'shimmer 0.85s infinite',
        'bounce-in': 'bounceIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.85' } },
      },
      transitionDuration: {
        '400': '400ms',
      },
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};

export default config;
