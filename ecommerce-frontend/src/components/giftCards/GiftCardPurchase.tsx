import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { purchaseGiftCard, clearError } from '../../store/slices/giftCardSlice';

const GiftCardPurchase: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.giftCard);

  const [formData, setFormData] = useState({
    amount: 25,
    recipientEmail: '',
    message: '',
  });

  const predefinedAmounts = [25, 50, 100, 200, 500];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount < 10 || formData.amount > 1000) {
      return;
    }

    try {
      await dispatch(purchaseGiftCard({
        amount: formData.amount,
        recipientEmail: formData.recipientEmail || undefined,
        message: formData.message || undefined,
      })).unwrap();
      
      setFormData({
        amount: 25,
        recipientEmail: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to purchase gift card:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Purchase Gift Card
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Select Amount
          </Typography>
          
          <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={formData.amount === amount ? 'contained' : 'outlined'}
                onClick={() => setFormData(prev => ({ ...prev, amount }))}
              >
                ${amount}
              </Button>
            ))}
          </Box>

          <TextField
            label="Custom Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            inputProps={{ min: 10, max: 1000 }}
            helperText="Amount must be between $10 and $1000"
            sx={{ mb: 3 }}
          />

          <TextField
            label="Recipient Email (Optional)"
            type="email"
            fullWidth
            value={formData.recipientEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
            helperText="Leave empty to purchase for yourself"
            sx={{ mb: 3 }}
          />

          <TextField
            label="Personal Message (Optional)"
            multiline
            rows={3}
            fullWidth
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || formData.amount < 10 || formData.amount > 1000}
          >
            {loading ? <CircularProgress size={24} /> : `Purchase Gift Card - $${formData.amount}`}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default GiftCardPurchase;
