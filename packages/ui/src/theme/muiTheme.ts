import { createTheme, type ThemeOptions } from '@mui/material/styles';

const shared: ThemeOptions = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#2f6fed', dark: '#1f56c9', light: '#6f9bf3' },
    secondary: { main: '#0ea5a4' },
    error: { main: '#dc2626' },
    warning: { main: '#d97706' },
    success: { main: '#16a34a' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#6f9bf3', dark: '#2f6fed', light: '#9dbdf8' },
    secondary: { main: '#2dd4d3' },
    error: { main: '#f87171' },
    warning: { main: '#fbbf24' },
    success: { main: '#4ade80' },
    background: { default: '#0f172a', paper: '#1a2436' },
  },
});

export function getTheme(mode: 'light' | 'dark') {
  return mode === 'dark' ? darkTheme : lightTheme;
}
