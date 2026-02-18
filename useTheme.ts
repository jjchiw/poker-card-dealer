import { useState, useEffect } from 'react';
import { Theme, getTheme } from './themes';

const STORAGE_KEY = 'poker-dealer-theme';

export const useTheme = () => {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'classic';
    }
    return 'classic';
  });

  const theme = getTheme(themeId);

  const changeTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  useEffect(() => {
    // Apply CSS variables for dynamic theming
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  return { theme, themeId, changeTheme };
};
