import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../authSlice';
import { useExchangeAdminHandoffMutation } from '../authApi';

/** Landing page for admins forwarded here from the client app's shared login page.
 * Redeems the one-time ticket in the URL for a real session — the admin never
 * has to type their password a second time. */
export default function HandoffPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [exchangeAdminHandoff] = useExchangeAdminHandoffMutation();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const ticket = searchParams.get('ticket');
    if (!ticket) {
      setError('Missing sign-in ticket.');
      return;
    }

    exchangeAdminHandoff({ ticket })
      .unwrap()
      .then(({ user, accessToken }) => {
        dispatch(setCredentials({ user, accessToken }));
        navigate('/', { replace: true });
      })
      .catch(() => {
        setError('This sign-in link has expired or was already used. Please sign in again.');
      });
  }, [searchParams, exchangeAdminHandoff, dispatch, navigate]);

  if (error) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body2">
          <Link component={RouterLink} to="/login" fontWeight={600}>
            Go to the login page
          </Link>
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
}
