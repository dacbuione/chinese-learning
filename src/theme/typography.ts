export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    chinese: 'System', // Will use system Chinese font
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 64,  // For large Chinese characters
    '7xl': 80,  // For practice characters
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};