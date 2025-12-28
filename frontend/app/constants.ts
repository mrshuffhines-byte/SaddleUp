/**
 * API Configuration
 * 
 * Chrome Local Network Request Compatibility:
 * - Development: Uses localhost (HTTP is OK for localhost in development)
 *   Chrome will prompt users to grant permission for localhost access
 * - Production: Must use HTTPS with a public domain
 *   No restrictions apply to public HTTPS endpoints
 * 
 * Private IPs (192.168.x.x, 10.x.x.x, .local domains) will require
 * explicit user permission in Chrome. Always use HTTPS in production.
 * 
 * To override, set EXPO_PUBLIC_API_URL environment variable
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  typeof __DEV__ !== 'undefined' && __DEV__ 
    ? 'http://localhost:3001'
    : 'https://api.thereinapp.com'
);

/**
 * Check if the current API URL is a local network address
 * Chrome will require explicit permission for these in upcoming versions
 */
export const isLocalNetworkAPI = (() => {
  try {
    const url = new URL(API_URL);
    const hostname = url.hostname.toLowerCase();
    
    // Check for localhost variants
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    // Check for .local domains
    if (hostname.endsWith('.local')) {
      return true;
    }
    
    // Check for private IP ranges (IPv4)
    const parts = hostname.split('.').map(Number);
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
})();

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
