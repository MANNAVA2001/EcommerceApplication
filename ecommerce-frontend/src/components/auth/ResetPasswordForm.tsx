import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { resetPassword } from '../../store/slices/authSlice';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token as string);
    }
  }, [router.query.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await dispatch(resetPassword({ token, newPassword: password })).unwrap();
      setMessage(result.message);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.100"
      >
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error">
              Invalid reset link. Please request a new password reset.
            </Alert>
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push('/forgot-password')}
                sx={{ textDecoration: 'none' }}
              >
                Request New Reset Link
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.100"
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>

            <Box textAlign="center">
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push('/login')}
                sx={{ textDecoration: 'none' }}
              >
                Back to Login
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordForm;
