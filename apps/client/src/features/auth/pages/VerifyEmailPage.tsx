import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Link, Stack, Typography } from '@mui/material';
import { LoadingSpinner } from '@telemedicine/ui';
import { useVerifyEmailMutation } from '../authApi';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    verifyEmail({ token })
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token, verifyEmail]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Email verification
      </Typography>
      {status === 'pending' && <LoadingSpinner label="Verifying your email..." />}
      {status === 'success' && (
        <Alert severity="success">Your email has been verified. You can now sign in.</Alert>
      )}
      {status === 'error' && (
        <Alert severity="error">This verification link is invalid or has expired.</Alert>
      )}
      <Link component={RouterLink} to="/login">
        Back to sign in
      </Link>
    </Stack>
  );
}
