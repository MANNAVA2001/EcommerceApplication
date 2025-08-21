import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Container,
  CircularProgress
} from '@mui/material';
import { CreditCard } from '@mui/icons-material';

const PaymentProcessingPage: React.FC = () => {
  const router = useRouter();
  const { orderId, cardNumber } = router.query;
  const [progress, setProgress] = useState(0);
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    if (cardNumber && typeof cardNumber === 'string') {
      const prefix = cardNumber.substring(0, 2);
      switch (prefix) {
        case '23':
          setBankName('Citibank');
          break;
        case '12':
          setBankName('Bank of America');
          break;
        case '56':
          setBankName('Capital One');
          break;
        case '34':
          setBankName('Chase Bank');
          break;
        case '45':
          setBankName('Wells Fargo');
          break;
        case '67':
          setBankName('PNC Bank');
          break;
        case '89':
          setBankName('US Bank');
          break;
        case '90':
          setBankName('TD Bank');
          break;
        case '11':
          setBankName('BB&T');
          break;
        case '22':
          setBankName('SunTrust');
          break;
        case '33':
          setBankName('Regions Bank');
          break;
        case '44':
          setBankName('Fifth Third Bank');
          break;
        case '55':
          setBankName('Santander Bank');
          break;
        default:
          setBankName('Your Bank');
          break;
      }
    }
  }, [cardNumber]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          if (orderId) {
            router.push(`/order-confirmation/${orderId}`);
          }
          return 100;
        }
        return prevProgress + (100 / 150);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [orderId, router]);

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <CircularProgress size={80} sx={{ mb: 3 }} />
          <CreditCard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        </Box>
        
        <Typography variant="h4" gutterBottom color="primary">
          Processing Payment
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
          Processing payment with {bankName}
        </Typography>
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Please wait while we securely process your payment...
        </Typography>
        
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary">
          {Math.round(progress)}% Complete
        </Typography>
        
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="textSecondary">
          Do not close this window or navigate away from this page
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentProcessingPage;
