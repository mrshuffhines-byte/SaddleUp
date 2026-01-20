/**
 * Design System Colors
 * Based on warm, modern equestrian aesthetic
 */
export const colors = {
  // Primary - Deep Ink (main CTA, primary text)
  deepInk: '#12161C',
  // Brand Colors
  saddleBrown: '#6B4A2D',
  warmSand: '#E7DDCF',
  bone: '#F6F1E8', // Elevated surfaces
  prairieSage: '#7C8A7A',
  // Neutral Grays
  slate: '#3A4652', // Secondary text
  midGray: '#8B949E', // Placeholder text
  // Backgrounds
  white: '#FFFFFF', // Surface
  offWhite: '#FAF7F2', // Background
  surfaceWarm: '#F2EADF',
  // Borders
  borderWarm: '#E3D7C7',
  // Accent Colors (use sparingly)
  turquoise: '#2DB7A3',
  brass: '#B58B2A',
  // Semantic Colors
  success: '#1F9D6A',
  warning: '#D89B24',
  error: '#D64545',
  // Legacy support (mapped to new colors for gradual migration)
  primary: {
    50: '#FAF7F2', // offWhite
    100: '#F2EADF', // surfaceWarm
    200: '#E7DDCF', // warmSand
    300: '#E3D7C7', // borderWarm
    400: '#B58B2A', // brass
    500: '#12161C', // deepInk
    600: '#6B4A2D', // saddleBrown
    700: '#3A4652', // slate
    800: '#12161C', // deepInk
    900: '#12161C', // deepInk
  },
  secondary: {
    500: '#7C8A7A', // prairieSage
    600: '#7C8A7A',
  },
  accent: {
    500: '#B58B2A', // brass
  },
  neutral: {
    50: '#FAF7F2', // offWhite
    100: '#F6F1E8', // bone
    200: '#E3D7C7', // borderWarm
    300: '#E3D7C7', // borderWarm
    400: '#E7DDCF', // warmSand
    500: '#8B949E', // midGray
    600: '#3A4652', // slate
    700: '#3A4652', // slate
    800: '#12161C', // deepInk
    900: '#12161C', // deepInk
  },
  successBg: '#F0FDF4',
  warningBg: '#FEFCE8',
  errorBg: '#FEF2F2',
  info: '#2DB7A3', // turquoise
  infoBg: '#EFF6FF',
  surface: '#FFFFFF',
};

/**
 * Spacing Scale (px)
 * 4, 8, 12, 16, 20, 24, 32, 40, 48
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  // Legacy aliases for backward compatibility
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  // Old scale (gradual migration)
  xxl: 48,
};

/**
 * Border Radius Scale (px)
 * 8 (chips, small elements)
 * 12 (inputs, buttons)
 * 16 (cards)
 * 24 (modals, sheets)
 */
export const borderRadius = {
  sm: 8, // chips, small elements
  md: 12, // inputs, buttons
  lg: 16, // cards
  xl: 24, // modals, sheets
  full: 9999,
};

/**
 * Shadows
 * Subtle shadows using deepInk color
 */
export const shadows = {
  sm: {
    shadowColor: '#12161C', // deepInk
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#12161C', // deepInk
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#12161C', // deepInk
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#12161C', // deepInk
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
};

/**
 * Gradients
 * Use sparingly - prefer solid colors from the design system
 */
export const gradients = {
  warmBackground: ['#FAF7F2', '#F2EADF'], // offWhite to surfaceWarm
  cardHighlight: ['#FFFFFF', '#F6F1E8'], // white to bone
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
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
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
    lineHeight: 26,
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
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  micro: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
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

