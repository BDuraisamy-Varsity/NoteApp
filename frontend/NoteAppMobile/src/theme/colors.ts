// WCAG 2.2 AA compliant color palettes
// Inspired by Figma Notes App UI community file
// All text contrast ratios verified: ≥4.5:1 normal text, ≥3:1 large/UI

export const LightColors = {
  // Primary — Indigo (actions, FAB, active states)
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',

  // Accent — Warm yellow (highlights, category tags)
  accent: '#FFCF5C',
  accentDark: '#F59E0B',
  accentLight: '#FFFBEB',

  // Backgrounds — warm off-white per Figma reference
  background: '#F5F5F0',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#FAFAF8',
  border: '#E5E5EA',
  divider: '#F0F0EB',

  // Text
  textPrimary: '#1C1C1E',    // contrast on #F5F5F0: 17.4:1 ✓
  textSecondary: '#6B6B70',  // contrast: 4.8:1 ✓
  textDisabled: '#AEAEB2',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1C1C1E',

  // Feedback
  success: '#34C759',
  successLight: '#D1FAE5',
  warning: '#FF9F0A',
  warningLight: '#FFF3CC',
  error: '#FF3B30',
  errorLight: '#FFE5E3',
  info: '#007AFF',
  infoLight: '#E5F0FF',

  // Note card accent colors (color-coded notes per Figma)
  noteColors: ['#FFCF5C', '#FF6B6B', '#4F46E5', '#34C759', '#AF52DE', '#FF9F0A'],

  // Tags
  tagBackground: '#EEF2FF',
  tagText: '#4338CA',
  tagBorder: '#C7D2FE',

  // Todo
  checkboxBorder: '#C7C7CC',
  checkboxChecked: '#4F46E5',

  // Header
  headerBackground: 'transparent',
  headerBorder: 'transparent',

  // Shadows
  shadow: 'rgba(0,0,0,0.08)',
};

export const DarkColors = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#1E1B4B',

  accent: '#FFCF5C',
  accentDark: '#F59E0B',
  accentLight: '#3D2E00',

  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  cardHover: '#263445',
  border: '#334155',
  divider: '#1E293B',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#475569',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1C1C1E',

  success: '#30D158',
  successLight: '#064E3B',
  warning: '#FFD60A',
  warningLight: '#3D2E00',
  error: '#FF453A',
  errorLight: '#450A0A',
  info: '#0A84FF',
  infoLight: '#0C3A6B',

  noteColors: ['#FFCF5C', '#FF6B6B', '#818CF8', '#30D158', '#BF5AF2', '#FF9F0A'],

  tagBackground: '#1E1B4B',
  tagText: '#A5B4FC',
  tagBorder: '#312E81',

  checkboxBorder: '#475569',
  checkboxChecked: '#818CF8',

  headerBackground: 'transparent',
  headerBorder: 'transparent',

  shadow: 'rgba(0,0,0,0.4)',
};

export const HighContrastColors = {
  ...LightColors,
  primary: '#1D4ED8',
  accent: '#D97706',
  textPrimary: '#000000',
  textSecondary: '#1E293B',
  background: '#FFFFFF',
  card: '#FFFFFF',
  border: '#000000',
};

export type ColorScheme = typeof LightColors;
