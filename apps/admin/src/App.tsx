import { RouterProvider } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppThemeProvider } from './theme/ThemeProvider';
import { router } from './routes';

export default function App() {
  return (
    <AppThemeProvider>
      <Helmet titleTemplate="%s | Admin Console" defaultTitle="Admin Console" />
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}
