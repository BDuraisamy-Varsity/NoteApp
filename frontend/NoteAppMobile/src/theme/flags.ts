// Flag/priority system — hot-to-cool color palette
// Matches backend FlagLevel enum exactly

import AsyncStorage from '@react-native-async-storage/async-storage';

export type FlagLevel = 'None' | 'Low' | 'Normal' | 'Important' | 'High' | 'Critical';

export const FLAG_ORDER: FlagLevel[] = ['Critical', 'High', 'Important', 'Normal', 'Low', 'None'];

export interface FlagConfig {
  level: FlagLevel;
  label: string;
  emoji: string;
  color: string;       // background / badge color
  textColor: string;   // text on badge
  borderColor: string;
}

// Default hot-to-cool palette
export const DEFAULT_FLAG_CONFIGS: FlagConfig[] = [
  { level: 'Critical',  label: 'Critical',  emoji: '🔴', color: '#FF3B30', textColor: '#FFFFFF', borderColor: '#CC2F27' },
  { level: 'High',      label: 'High',      emoji: '🟠', color: '#FF6B35', textColor: '#FFFFFF', borderColor: '#CC5529' },
  { level: 'Important', label: 'Important', emoji: '🟡', color: '#FFCC00', textColor: '#1C1C1E', borderColor: '#CCA300' },
  { level: 'Normal',    label: 'Normal',    emoji: '🟢', color: '#34C759', textColor: '#FFFFFF', borderColor: '#28A046' },
  { level: 'Low',       label: 'Low',       emoji: '🔵', color: '#007AFF', textColor: '#FFFFFF', borderColor: '#005FCC' },
  { level: 'None',      label: 'No flag',   emoji: '⬜', color: '#E2E8F0', textColor: '#64748B', borderColor: '#CBD5E1' },
];

const STORAGE_KEY = '@noteapp_flag_configs';

export async function loadFlagConfigs(): Promise<FlagConfig[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return DEFAULT_FLAG_CONFIGS;
    const saved: Partial<FlagConfig>[] = JSON.parse(json);
    // Merge saved overrides with defaults (preserves new defaults if added)
    return DEFAULT_FLAG_CONFIGS.map(def => {
      const override = saved.find(s => s.level === def.level);
      return override ? { ...def, ...override } : def;
    });
  } catch {
    return DEFAULT_FLAG_CONFIGS;
  }
}

export async function saveFlagConfigs(configs: FlagConfig[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function getFlagConfig(configs: FlagConfig[], level: FlagLevel): FlagConfig {
  return configs.find(c => c.level === level) ?? DEFAULT_FLAG_CONFIGS[5]; // fallback to None
}

// Auto-detect flag from note title/body keywords
export function autoDetectFlag(title: string, body: string): FlagLevel {
  const text = `${title} ${body}`.toLowerCase();

  const criticalKw = ['urgent', 'asap', 'critical', 'emergency', 'deadline', 'overdue', 'immediately'];
  const highKw     = ['important', 'priority', 'high priority', 'must', 'required', 'today', 'due today'];
  const importantKw = ['reminder', 'meeting', 'review', 'follow-up', 'follow up', 'action'];
  const lowKw      = ['idea', 'later', 'someday', 'maybe', 'reference', 'draft', 'note to self', 'fyi'];

  if (criticalKw.some(k => text.includes(k)))  return 'Critical';
  if (highKw.some(k => text.includes(k)))       return 'High';
  if (importantKw.some(k => text.includes(k))) return 'Important';
  if (lowKw.some(k => text.includes(k)))        return 'Low';
  return 'None';
}
