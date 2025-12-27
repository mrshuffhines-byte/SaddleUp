// API URL - uses localhost in development, production URL in production
// To override, set EXPO_PUBLIC_API_URL environment variable
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  typeof __DEV__ !== 'undefined' && __DEV__ 
    ? 'http://localhost:3001'
    : 'https://api.thereinapp.com'
);

export const COLORS = {
  primary: '#8B7355',
  secondary: '#5A4A3A',
  background: '#F5F1EA',
  surface: '#FFFFFF',
  border: '#D4C4B0',
  text: '#5A4A3A',
  textSecondary: '#999999',
  accent: '#A8C09A', // Sage green
  warning: '#FFC107',
  error: '#DC3545',
  success: '#28A745',
};
