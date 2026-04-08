import { DefaultTheme } from 'react-native-paper';

export const theme: DefaultTheme = {
  dark: false,
  roundness: 4,
  colors: {
    primary: '#3b82f6',
    primaryVariant: '#2563eb',
    secondary: '#6366f1',
    secondaryVariant: '#5b21b6',
    background: '#f9fafb',
    surface: '#ffffff',
    error: '#ef4444',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#111827',
    onSurface: '#111827',
    onError: '#ffffff',
    text: '#374151',
    placeholder: '#9ca3af',
    disabled: '#d1d5db',
    backdrop: '#f3f4f6',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};