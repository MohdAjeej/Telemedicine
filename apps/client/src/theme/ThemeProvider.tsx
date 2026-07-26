import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { getTheme } from '@telemedicine/ui';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'telemedicine-theme-mode';

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          window.localStorage.setItem(STORAGE_KEY, next);
          return next;
        }),
    }),
    [mode],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- co-located provider hook, not worth a separate file
export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return context;
}
