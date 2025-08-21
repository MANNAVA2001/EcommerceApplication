import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
  TextField,
  Grid
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { useRouter } from 'next/router';

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const cartState = useSelector((state: RootState) => state.cart);
  const { items, totalItems, totalAmount: cartTotal } = cartState;
  const cartItems = items;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 0) {
      return;
    }
    
    const numericProductId = parseInt(productId);
    
    if (newQuantity === 0) {
      dispatch(removeFromCart(numericProductId));
    } else if (newQuantity <= 100) {
      dispatch(updateQuantity({ productId: numericProductId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => router.push('/products')} sx={{ borderRadius: '8px' }}>
          Continue Shopping
        </Button>
      </Paper>
    );
  }


  return (
    <Paper sx={{ p: 3, borderRadius: '8px' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Shopping Cart
      </Typography>
      
      <List>
        {cartItems.map((item) => (
          <React.Fragment key={item.product.id}>
            <ListItem>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {item.product.name}
                      </Typography>
                    }
                    secondary={`$${item.product.price.toFixed(2)} each`}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.product.id.toString(), item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleQuantityChange(item.product.id.toString(), value);
                        }
                      }}
                      sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      inputProps={{ min: 0, 'data-testid': `quantity-input-${item.product.id}` }} // Add this line
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.product.id.toString(), item.quantity + 1)}
                      sx={{ borderRadius: '8px' }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography variant="body1" fontWeight="bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => dispatch(removeFromCart(item.product.id))}
                    sx={{ borderRadius: '8px' }}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Total: ${cartTotal.toFixed(2)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleClearCart} sx={{ borderRadius: '8px' }}>
            Clear Cart
          </Button>
          <Button variant="outlined" onClick={() => router.push('/products')} sx={{ borderRadius: '8px' }}>
            Continue Shopping
          </Button>
          <Button variant="contained" onClick={handleCheckout} sx={{ borderRadius: '8px' }}>
            Proceed to Checkout
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Cart;
