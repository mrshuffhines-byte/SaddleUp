export const colors = {
  // Primary - Warm browns (leather/saddle inspired)
  primary: {
    50: '#fdf8f6',
    100: '#f5ebe6',
    200: '#e8d5c9',
    300: '#d4b5a0',
    400: '#c49a7c',
    500: '#a67c52',  // Main brand brown
    600: '#8b6342',
    700: '#6d4c35',
    800: '#5a3d2b',
    900: '#4a3225',
  },
  // Secondary - Sage greens (pasture/nature)
  secondary: {
    50: '#f6f7f6',
    100: '#e3e7e3',
    200: '#c7d1c7',
    300: '#9fb09f',
    400: '#748c74',
    500: '#5a7159',  // Main sage
    600: '#465a45',
    700: '#394939',
    800: '#303c30',
    900: '#283028',
  },
  // Accent - Warm gold (ribbon/award inspired)
  accent: {
    500: '#d4af37',
    600: '#b8972e',
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
  // Semantic
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// Theme object for easy access
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
};

