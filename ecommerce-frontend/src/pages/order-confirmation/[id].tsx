import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Container
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchOrderById } from '../../store/slices/orderSlice';

const OrderConfirmationPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { loading, error, currentOrder } = useSelector((state: RootState) => state.orders);


  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id as string));
    }
  }, [dispatch, id]);

  if (!isAuthenticated && !loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Please log in to view your order details.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Log In
        </Button>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }


  if (!currentOrder) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Order not found</Typography>
        <Button variant="contained" onClick={() => router.push('/products')} sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom color="success.main">
          Order Confirmed!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Thank you for your purchase
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Order ID: #{currentOrder.id.toString().slice(-8).toUpperCase()}
        </Typography>
        
        <Chip
          label={currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
          color="primary"
          sx={{ mb: 3 }}
        />
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Order Date
            </Typography>
            <Typography variant="body1">
              {new Date(currentOrder.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Payment Method
            </Typography>
            <Typography variant="body1">
              {currentOrder.paymentMethod.replace('_', ' ').toUpperCase()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Items Ordered
        </Typography>
        <List>
          {currentOrder.products && currentOrder.products.length > 0 ? (
            currentOrder.products.map((item, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.name || `Product ID: ${item.productId}`}
                  secondary={`Quantity: ${item.quantity} × $${item.price.toFixed(2)}`}
                />
                <Typography variant="body1" fontWeight="bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </ListItem>
            ))
          ) : (
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="No items found in this order" />
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Total Amount:</Typography>
          <Typography variant="h6" color="primary">
            ${currentOrder.totalAmount.toFixed(2)}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>
        <Typography variant="body1">
          {currentOrder.shippingAddress.street}<br />
          {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}<br />
          {currentOrder.shippingAddress.country}
        </Typography>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => router.push('/products')}
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/orders')}
        >
          View All Orders
        </Button>
      </Box>
    </Container>
  );
};

export default OrderConfirmationPage;
