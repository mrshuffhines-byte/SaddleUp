// API URL - uses localhost in development, production URL in production
// To override, set EXPO_PUBLIC_API_URL environment variable
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  typeof __DEV__ !== 'undefined' && __DEV__ 
    ? 'http://localhost:3001'
    : 'https://api.thereinapp.com'
);

export const COLORS = {
  primary: '#8B6F47', // Rich brown
  primaryDark: '#6B5635',
  primaryLight: '#A6825D',
  secondary: '#5A4A3A',
  background: '#FAF8F5', // Warm off-white
  surface: '#FFFFFF',
  surfaceAlt: '#F5EFE7', // Light warm beige
  border: '#E8DFD4', // Soft border
  borderLight: '#F0EAE2',
  text: '#2C2416', // Dark brown-black
  textSecondary: '#6B5635', // Medium brown
  textTertiary: '#998675', // Muted brown
  accent: '#A8C09A', // Sage green
  accentDark: '#8BA882',
  warning: '#FFC107',
  error: '#DC3545',
  success: '#28A745',
  successLight: '#4CAF50',
  
  // Semantic colors
  complete: '#28A745',
  current: '#8B6F47',
  locked: '#CCCCCC',
  
  // Gradient colors
  gradientStart: '#8B6F47',
  gradientEnd: '#6B5635',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  // Font families would go here if using custom fonts
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
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
