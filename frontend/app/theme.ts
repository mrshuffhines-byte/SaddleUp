export const colors = {
  // Primary - Richer, warmer browns
  primary: {
    50: '#faf6f1',
    100: '#f0e6d9',
    200: '#e0ccb3',
    300: '#c9a87a',
    400: '#b8894d',
    500: '#8B6F47',  // Main brand - richer brown
    600: '#6B5538',
    700: '#4a3a26',
    800: '#3E2C1F',  // Dark brown for headings
    900: '#2a1e15',
  },
  // Secondary - Sage greens (nature/pasture)
  secondary: {
    50: '#f0f4f0',
    100: '#dce5dc',
    200: '#b8cbb8',
    300: '#8baa8b',
    400: '#5d8a5d',
    500: '#4a7c4a',
    600: '#3d663d',
    700: '#2f4f2f',
    800: '#243d24',
    900: '#1a2c1a',
  },
  // Accent - Warm gold
  accent: {
    50: '#fefbf0',
    100: '#fdf3d0',
    200: '#fbe7a1',
    300: '#f7d56b',
    400: '#f2c038',
    500: '#d4a537',
    600: '#b8972e',
    700: '#8c7323',
    800: '#6b581b',
    900: '#4a3d13',
  },
  // Neutrals - Warm grays
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  // Semantic with softer tones
  success: '#4ade80',
  successBg: '#f0fdf4',
  warning: '#fbbf24',
  warningBg: '#fefce8',
  error: '#f87171',
  errorBg: '#fef2f2',
  info: '#60a5fa',
  infoBg: '#eff6ff',
  // Surface colors
  surface: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#3E2C1F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#3E2C1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#3E2C1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: '#8B6F47',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const gradients = {
  warmBackground: ['#faf6f1', '#f0e6d9'],
  sunsetWarm: ['#fdf3d0', '#f0e6d9'],
  cardHighlight: ['#ffffff', '#faf6f1'],
};

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  // Special
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  helper: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
  // Legacy support - weights object for backward compatibility
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Theme object for easy access
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  gradients,
};

