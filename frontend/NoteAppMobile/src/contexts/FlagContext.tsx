import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {DEFAULT_FLAG_CONFIGS, FlagConfig, loadFlagConfigs, saveFlagConfigs} from '../theme/flags';

interface FlagContextValue {
  flagConfigs: FlagConfig[];
  updateFlagConfig: (updated: FlagConfig) => Promise<void>;
  resetFlagConfigs: () => Promise<void>;
}

const FlagContext = createContext<FlagContextValue | null>(null);

export function FlagProvider({children}: {children: React.ReactNode}) {
  const [flagConfigs, setFlagConfigs] = useState<FlagConfig[]>(DEFAULT_FLAG_CONFIGS);

  useEffect(() => {
    loadFlagConfigs().then(setFlagConfigs);
  }, []);

  const updateFlagConfig = async (updated: FlagConfig) => {
    const next = flagConfigs.map(c => c.level === updated.level ? updated : c);
    setFlagConfigs(next);
    await saveFlagConfigs(next);
  };

  const resetFlagConfigs = async () => {
    setFlagConfigs(DEFAULT_FLAG_CONFIGS);
    await saveFlagConfigs(DEFAULT_FLAG_CONFIGS);
  };

  const value = useMemo(
    () => ({flagConfigs, updateFlagConfig, resetFlagConfigs}),
    [flagConfigs],
  );

  return <FlagContext.Provider value={value}>{children}</FlagContext.Provider>;
}

export function useFlagContext(): FlagContextValue {
  const ctx = useContext(FlagContext);
  if (!ctx) throw new Error('useFlagContext must be used within FlagProvider');
  return ctx;
}
