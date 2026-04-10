import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {buildTypography, FontSizeLevel} from '../theme/typography';

const FONT_SIZE_STORAGE_KEY = '@noteapp_font_size';

interface AccessibilityContextValue {
  fontSizeLevel: FontSizeLevel;
  typography: ReturnType<typeof buildTypography>;
  setFontSizeLevel: (level: FontSizeLevel) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({children}: {children: React.ReactNode}) {
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevel>('medium');

  useEffect(() => {
    loadSavedFontSize();
  }, []);

  const loadSavedFontSize = async () => {
    try {
      const saved = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (saved) {
        setFontSizeLevelState(saved as FontSizeLevel);
      }
    } catch {
      // Default to medium on error
    }
  };

  const setFontSizeLevel = useCallback(async (level: FontSizeLevel) => {
    setFontSizeLevelState(level);
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, level);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const typography = useMemo(() => buildTypography(fontSizeLevel), [fontSizeLevel]);

  const value = useMemo(
    () => ({fontSizeLevel, typography, setFontSizeLevel}),
    [fontSizeLevel, typography, setFontSizeLevel],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return ctx;
}
