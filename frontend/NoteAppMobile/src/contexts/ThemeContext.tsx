import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ColorScheme, DarkColors, HighContrastColors, LightColors} from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'system';

const THEME_STORAGE_KEY = '@noteapp_theme';

const THEME_COLOR_MAP: Record<Exclude<ThemeMode, 'system'>, ColorScheme> = {
  light: LightColors,
  dark: DarkColors,
  'high-contrast': HighContrastColors,
};

interface ThemeContextValue {
  themeMode: ThemeMode;
  colors: ColorScheme;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        setThemeMode(saved as ThemeMode);
      }
    } catch {
      // Default to system theme on error
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const resolvedMode = useMemo((): Exclude<ThemeMode, 'system'> => {
    if (themeMode !== 'system') {
      return themeMode;
    }
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }, [themeMode]);

  const colors = THEME_COLOR_MAP[resolvedMode];

  const value = useMemo(
    () => ({
      themeMode,
      colors,
      isDark: resolvedMode === 'dark' || resolvedMode === 'high-contrast',
      setTheme,
    }),
    [themeMode, colors, resolvedMode, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
