/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      colors: {
        stellar: {
          bg: 'var(--stellar-bg)',
          'bg-elevated': 'var(--stellar-bg-elevated)',
          surface: 'var(--stellar-surface)',
          'surface-muted': 'var(--stellar-surface-muted)',
          border: 'var(--stellar-border)',
          'border-strong': 'var(--stellar-border-strong)',
          text: 'var(--stellar-text)',
          'text-muted': 'var(--stellar-text-muted)',
          'text-subtle': 'var(--stellar-text-subtle)',
          accent: 'var(--stellar-accent)',
          'accent-hover': 'var(--stellar-accent-hover)',
          'accent-fg': 'var(--stellar-accent-fg)',
          inverse: 'var(--stellar-inverse)',
          'inverse-fg': 'var(--stellar-inverse-fg)',
          danger: 'var(--stellar-danger)',
          'danger-fg': 'var(--stellar-danger-fg)',
          success: 'var(--stellar-success)',
          focus: 'var(--stellar-focus-ring)',
        },
      },
      spacing: {
        'stellar-0': 'var(--space-0)',
        'stellar-1': 'var(--space-1)',
        'stellar-2': 'var(--space-2)',
        'stellar-3': 'var(--space-3)',
        'stellar-4': 'var(--space-4)',
        'stellar-5': 'var(--space-5)',
        'stellar-6': 'var(--space-6)',
        'stellar-8': 'var(--space-8)',
        'stellar-10': 'var(--space-10)',
        'stellar-12': 'var(--space-12)',
        'stellar-16': 'var(--space-16)',
        'stellar-20': 'var(--space-20)',
        'stellar-24': 'var(--space-24)',
      },
      borderRadius: {
        stellar: 'var(--radius-md)',
        'stellar-lg': 'var(--radius-lg)',
        'stellar-xl': 'var(--radius-xl)',
        'stellar-2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        stellar: 'var(--shadow-card)',
        'stellar-elevated': 'var(--shadow-elevated)',
        'stellar-glow': 'var(--shadow-glow)',
        'stellar-inset': 'var(--shadow-inset)',
      },
      transitionTimingFunction: {
        stellar: 'var(--ease-out-expo)',
        'stellar-spring': 'var(--ease-spring)',
      },
      transitionDuration: {
        stellar: 'var(--duration-normal)',
        'stellar-fast': 'var(--duration-fast)',
        'stellar-slow': 'var(--duration-slow)',
      },
      maxWidth: {
        dashboard: 'var(--dashboard-max-width)',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-slow) var(--ease-out-expo) forwards',
        'fade-up': 'fadeUp var(--duration-slow) var(--ease-out-expo) forwards',
        'scale-in': 'scaleIn var(--duration-normal) var(--ease-spring) forwards',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
