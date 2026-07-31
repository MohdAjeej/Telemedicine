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
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: ({ theme }) => ({
            '&:hover': { backgroundColor: theme.palette.primary.light },
          }),
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            border: '1px solid rgba(15,23,42,0.06)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 10px rgba(15,23,42,0.04)',
          },
        },
      ],
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            border: '1px solid rgba(15,23,42,0.06)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 10px rgba(15,23,42,0.04)',
          },
        },
      ],
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#1e3a8a', dark: '#152c6b', light: '#3b5fc4' },
    secondary: { main: '#e53935', dark: '#c62828', light: '#ef5350' },
    error: { main: '#e53935' },
    warning: { main: '#f59e0b' },
    success: { main: '#22c55e' },
    info: { main: '#2f6fed' },
    background: { default: '#f5f7fc', paper: '#ffffff' },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#5b7fd6', dark: '#1e3a8a', light: '#8ba3e0' },
    secondary: { main: '#ef5350', dark: '#e53935', light: '#fca5a5' },
    error: { main: '#ef5350' },
    warning: { main: '#fbbf24' },
    success: { main: '#4ade80' },
    info: { main: '#6f9bf3' },
    background: { default: '#0f172a', paper: '#1a2436' },
  },
});

export function getTheme(mode: 'light' | 'dark') {
  return mode === 'dark' ? darkTheme : lightTheme;
}
