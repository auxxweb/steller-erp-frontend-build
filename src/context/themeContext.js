import { createContext } from 'react';

export const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'stellar-theme';

export const themeTokens = {
  colors: {
    ink: 'var(--stellar-ink)',
    bg: 'var(--stellar-bg)',
    surface: 'var(--stellar-surface)',
    text: 'var(--stellar-text)',
    muted: 'var(--stellar-text-muted)',
    accent: 'var(--stellar-accent)',
  },
  spacing: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    4: 'var(--space-4)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
  },
};
