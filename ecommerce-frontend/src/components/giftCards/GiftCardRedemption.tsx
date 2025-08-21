import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchGiftCardByCode, clearError } from '../../store/slices/giftCardSlice';

interface GiftCardRedemptionProps {
  onGiftCardApplied: (code: string, amount: number) => void;
  maxAmount: number;
}

const GiftCardRedemption: React.FC<GiftCardRedemptionProps> = ({ onGiftCardApplied, maxAmount }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentGiftCard, loading, error } = useSelector((state: RootState) => state.giftCard);

  const [giftCardCode, setGiftCardCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(0);

  const handleCheckGiftCard = async () => {
    if (!giftCardCode.trim()) return;

    try {
      await dispatch(fetchGiftCardByCode(giftCardCode)).unwrap();
    } catch (error) {
      console.error('Failed to fetch gift card:', error);
    }
  };

  const handleApplyGiftCard = () => {
    if (!currentGiftCard || redeemAmount <= 0) return;

    const amountToRedeem = Math.min(redeemAmount, currentGiftCard.balance, maxAmount);
    onGiftCardApplied(currentGiftCard.code, amountToRedeem);
    
    setGiftCardCode('');
    setRedeemAmount(0);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Apply Gift Card
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Gift Card Code"
          value={giftCardCode}
          onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
          placeholder="Enter gift card code"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          onClick={handleCheckGiftCard}
          disabled={loading || !giftCardCode.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Check'}
        </Button>
      </Box>

      {currentGiftCard && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Gift card found! Available balance: ${currentGiftCard.balance}
          </Alert>
          
          <TextField
            label="Amount to Redeem"
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Number(e.target.value))}
            inputProps={{ 
              min: 0.01, 
              max: Math.min(currentGiftCard.balance, maxAmount),
              step: 0.01 
            }}
            helperText={`Maximum: $${Math.min(currentGiftCard.balance, maxAmount)}`}
            sx={{ mb: 2 }}
            fullWidth
          />
          
          <Button
            variant="contained"
            onClick={handleApplyGiftCard}
            disabled={redeemAmount <= 0 || redeemAmount > Math.min(currentGiftCard.balance, maxAmount)}
            fullWidth
          >
            Apply ${redeemAmount} Gift Card
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default GiftCardRedemption;
