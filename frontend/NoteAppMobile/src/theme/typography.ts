// Scalable typography — base sizes multiply by fontScale factor
// WCAG 2.2 SC 1.4.4: Text can be resized up to 200% without loss of content

export type FontSizeLevel = 'small' | 'medium' | 'large' | 'xl';

const BASE_SIZES = {
  xs: 11,
  sm: 13,
  md: 16,   // WCAG minimum body text
  lg: 20,
  xl: 24,
  xxl: 30,
  title: 36,
};

const FONT_SCALE: Record<FontSizeLevel, number> = {
  small: 0.875,
  medium: 1.0,
  large: 1.25,
  xl: 1.5,
};

export function buildTypography(level: FontSizeLevel) {
  const scale = FONT_SCALE[level];
  return {
    xs: Math.round(BASE_SIZES.xs * scale),
    sm: Math.round(BASE_SIZES.sm * scale),
    md: Math.round(BASE_SIZES.md * scale),
    lg: Math.round(BASE_SIZES.lg * scale),
    xl: Math.round(BASE_SIZES.xl * scale),
    xxl: Math.round(BASE_SIZES.xxl * scale),
    title: Math.round(BASE_SIZES.title * scale),
  };
}

export const defaultTypography = buildTypography('medium');

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,   // WCAG 1.4.12 minimum
  relaxed: 1.75,
};
