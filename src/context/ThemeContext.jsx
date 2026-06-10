import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext, THEME_STORAGE_KEY, themeTokens } from './themeContext.js';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (mode) => {
  const root = document.documentElement;
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
  });

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const current = prev === 'system' ? getSystemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && getSystemTheme() === 'dark');

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleTheme,
      isDark,
      theme: themeTokens,
    }),
    [mode, toggleTheme, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
