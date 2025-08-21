import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';

const PaymentProcessingPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query; // Get orderId from query parameters
  const [loadingMessage, setLoadingMessage] = useState('Processing your payment securely...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID missing. Redirecting to orders page...');
      setTimeout(() => {
        router.push('/orders'); // Redirect to general orders page if no orderId
      }, 3000);
      return;
    }

    // Simulate 15-second payment processing delay
    const processingTimeout = setTimeout(() => {
      // In a real application, you would check backend for final payment status here
      // For this simulation, we assume success after 15 seconds.
      if (orderId) {
        router.push(`/orders/confirmation/${orderId}`); // Redirect to order confirmation page
      } else {
        // Fallback or error if orderId is somehow lost
        setError('Payment processed, but order ID was lost. Redirecting to orders page.');
        setTimeout(() => {
            router.push('/orders');
        }, 3000);
      }
    }, 6000); // 15 seconds

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(processingTimeout);
  }, [orderId, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh', // Adjust as needed
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Payment Processing
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <>
            <CircularProgress size={60} sx={{ my: 3 }} />
            <Typography variant="body1" color="text.secondary">
              {loadingMessage}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Please do not close this window.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentProcessingPage;