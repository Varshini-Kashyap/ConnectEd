import { useEffect } from 'react';

const THEME_KEY = 'connected-theme';

/**
 * Ensures document has data-theme from localStorage on mount and when navigating.
 * Use once in App so every page (Login, Questionnaire, Career, etc.) respects light/dark.
 */
export default function ThemeSync() {
  useEffect(() => {
    const theme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  return null;
}
