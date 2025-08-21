import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Add this
import DeleteIcon from '@mui/icons-material/Delete'; // Add this
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { useRouter } from 'next/router';
import { validateCardPrefix } from '../../config/constants';
import { SelectChangeEvent } from '@mui/material/Select'; // Import SelectChangeEvent
import { fetchUserCheckoutData, createCheckoutAddress, updateCheckoutAddress, deleteCheckoutAddress, createCheckoutPaymentMethod, updateCheckoutPaymentMethod, deleteCheckoutPaymentMethod } from '@/store/slices/userCheckoutSlice';
//import { PaymentMethod } from '../../store/slices/paymentSlice';
import { CheckoutPaymentMethod } from '../../types';
import GiftCardRedemption from '../giftCards/GiftCardRedemption';
interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
//.....
// Define the structure for card information
const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items: cart } = useSelector((state: RootState) => state.cart);
  const { loading, error } = useSelector((state: RootState) => state.orders);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: storedProcedureData } = useSelector((state: RootState) => state.userCheckout);

  const addresses = storedProcedureData?.addresses || useSelector((state: RootState) => state.addresses.addresses);
  const paymentMethods = storedProcedureData?.paymentMethods || useSelector((state: RootState) => state.payments.paymentMethods);

  useEffect(() => {
    console.log('Debug - storedProcedureData:', storedProcedureData);
    console.log('Debug - addresses:', addresses);
    console.log('Debug - paymentMethods:', paymentMethods);
  }, [storedProcedureData, addresses, paymentMethods]);


  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });
  const [addressOption, setAddressOption] = useState<'new' | 'existing'>('new');
  const [paymentOption, setPaymentOption] = useState<'new' | 'existing'>('new');
  const [useExistingPayment, setUseExistingPayment] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [ShowPaymentModal, setShowPaymentModal] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(0);

  const handleCardInfoChange = (field: string, value: string) => {
    setCardInfo((prev: any) => ({
      ...prev,
      [field]: value
    }));
    if (field !== 'cvv') {
      setPaymentOption('new');
      setSelectedPaymentId('');
      setUseExistingPayment(false);
    }
    setFormErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  const cartItems = cart.map((cartItem: any) => {
    return {
      productId: cartItem.product.id,
      quantity: cartItem.quantity,
      product: cartItem.product
    };
  });

  const subtotalAmount = cartItems.reduce((total: number, item: any) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
  
  const totalAmount = Math.max(0, subtotalAmount - giftCardAmount);
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchUserCheckoutData());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (addresses.length > 0 && addressOption === 'existing' && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setShippingAddress({
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          country: defaultAddress.country
        });
        setSelectedAddressId(defaultAddress.id);
      }
    } else if (addressOption === 'new') {
      setShippingAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      });
      setSelectedAddressId('');
    }
  }, [addresses, addressOption, selectedAddressId]);
    

  useEffect(() => {
    if (paymentMethods.length > 0 && paymentOption === 'existing' && !selectedPaymentId) {
      const defaultPayment = paymentMethods[0];
      if (defaultPayment) {
        setCardInfo({
          cardNumber: defaultPayment.cardNumber.replace(/\*|-/g, '').slice(-4).padStart(16, '*'),
          expMonth: defaultPayment.expMonth.toString(),
          expYear: defaultPayment.expYear.toString(),
          cvv: ''
        });
        setSelectedPaymentId(defaultPayment.id);
      }
    } else if (paymentOption === 'new') {
      setCardInfo({
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvv: ''
      });
      setSelectedPaymentId('');
    }
  }, [paymentMethods, paymentOption, selectedPaymentId]);


  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev: ShippingAddress) => ({
      ...prev,
      [field]: value
    }));
    setAddressOption('new');
    setSelectedAddressId('');
    setFormErrors((prev: any) => ({ ...prev, [field]: '' }));
  };
  const handleEditAddress = (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setEditingAddress(address);
      setShowAddressModal(true);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteCheckoutAddress(addressId));
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };
  const handleExistingAddressSelect = (event: SelectChangeEvent<string>) => { // Changed type here
    const addressId = event.target.value;
    const selected = addresses.find(addr => addr.id === addressId);
    if (selected) {
      setShippingAddress({
        street: selected.street,
        city: selected.city,
        state: selected.state,
        zipCode: selected.zipCode,
        country: selected.country
      });
      setSelectedAddressId(addressId);
      setAddressOption('existing');
      setFormErrors((prev: any) => ({ ...prev, selectedAddress: '' }));
    }
  };
  const handleCreatePayment = async (paymentData: Omit<CheckoutPaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {        
  try {        
    await dispatch(createCheckoutPaymentMethod(paymentData));        
    setShowPaymentModal(false);      
  } catch (error) {        
    console.error('Failed to create payment method:', error);        
  }        
};
  const handleUpdatePayment = async (paymentData: { id: string } & Partial<PaymentMethodData>) => {    
  try {    
    await dispatch(updateCheckoutPaymentMethod(paymentData));    
    setShowPaymentModal(false);    
    setEditingPayment(null);    
  } catch (error) {    
    console.error('Failed to update payment method:', error);    
  }    
};
  const handleEditPayment = (paymentId: string) => {
    const payment = paymentMethods.find(method => method.id === paymentId);
    if (payment) {
      setEditingPayment(payment);
      setShowPaymentModal(true);
    }
  };
  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await dispatch(deleteCheckoutPaymentMethod(paymentId));
      } catch (error) {
        console.error('Failed to delete payment method:', error);
      }
    }
  };
  const handleExistingPaymentSelect = (event: SelectChangeEvent<string>) => {
    const paymentId = event.target.value;
    const selectedPayment = paymentMethods.find(payment => payment.id === paymentId);
    if (selectedPayment) {
      setCardInfo({
        cardNumber: selectedPayment.cardNumber.replace(/\*|-/g, '').slice(-4).padStart(16, '*'),
        expMonth: selectedPayment.expMonth.toString(),
        expYear: selectedPayment.expYear.toString(),
        cvv: cardInfo.cvv // Preserve existing CVV to prevent disappearing
      });
      setSelectedPaymentId(paymentId);
      setUseExistingPayment(true);
      setPaymentOption('existing');
      setFormErrors((prev: any) => ({ ...prev, selectedPayment: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (cart.length === 0) {
      errors.cart = 'Your cart is empty. Please add products to continue.';
    }

    if (addressOption === 'new') {
      if (!shippingAddress.street) errors.street = 'Street address is required';
      if (!shippingAddress.city) errors.city = 'City is required';
      if (!shippingAddress.state) errors.state = 'State is required';
      if (!shippingAddress.zipCode) errors.zipCode = 'Zip code is required';
      if (!shippingAddress.country) errors.country = 'Country is required';
    } else if (addressOption === 'existing' && !selectedAddressId) {
      errors.selectedAddress = 'Please select a saved address';
    }

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (paymentOption === 'new') {
        if (!cardInfo.cardNumber) errors.cardNumber = 'Card number is required';
        else if (cardInfo.cardNumber.length !== 16) errors.cardNumber = 'Card number must be 16 digits';
        if (!cardInfo.expMonth) errors.expMonth = 'Expiration month is required';
        else if (parseInt(cardInfo.expMonth, 10) < 1 || parseInt(cardInfo.expMonth, 10) > 12) errors.expMonth = 'Invalid month';
        if (!cardInfo.expYear) errors.expYear = 'Expiration year is required';
        else if (parseInt(cardInfo.expYear, 10) < new Date().getFullYear() || parseInt(cardInfo.expYear, 10) > new Date().getFullYear() + 20) errors.expYear = 'Invalid year';
      } else if (paymentOption === 'existing' && !selectedPaymentId) {
        errors.selectedPayment = 'Please select a saved payment method';
      }
      if (!cardInfo.cvv) errors.cvv = 'CVV is required';
      else if (cardInfo.cvv.length < 3 || cardInfo.cvv.length > 4) errors.cvv = 'CVV must be 3 or 4 digits';

      const currentCardNumber = paymentOption === 'existing' && selectedPaymentId
        ? paymentMethods.find((p: any) => p.id === selectedPaymentId)?.cardNumber.replace(/\*|-/g, '')
        : cardInfo.cardNumber;

      if (currentCardNumber && !validateCardPrefix(currentCardNumber).isValid) {
        errors.cardNumber = 'Invalid card prefix. Please check your card number.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      console.log('Cart is empty, preventing order submission.');
      return;
    }

    console.log('Cart items before dispatch:', cart.length, cart);

    if (!validateForm()) {
      return;
    }
    if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card')) {
      let currentCardNumber = cardInfo.cardNumber;
      if (useExistingPayment && selectedPaymentId) {
        const selectedPayment = paymentMethods.find((p: any) => p.id === selectedPaymentId);
        if (selectedPayment) {
          currentCardNumber = selectedPayment.cardNumber.replace(/\*|-/g, '');
        }
      }

      const validation = validateCardPrefix(currentCardNumber);
      if (!validation.isValid) {
        alert('Invalid card details. Please check your card number and try again.');
        return;
      }
    }


    try {
      const orderData = {
        products: cart.map(item => ({
          productId: item.product.id.toString(),
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress,
        paymentMethod,
        cardInfo: (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') ? cardInfo : undefined,
        selectedPaymentId: useExistingPayment && selectedPaymentId ? parseInt(selectedPaymentId) : undefined,
        giftCardCode: giftCardCode || undefined,
        giftCardAmount: giftCardAmount || undefined
      };

      //console.log('Dispatching createOrder with data:', orderData);
      const result = await dispatch(createOrder(orderData));
      //console.log('Result from createOrder dispatch:', result);

      if (createOrder.fulfilled.match(result)) {
        console.log('Order creation fulfilled successfully!');
        console.log('Result payload:', result.payload);

        const orderId = result.payload.id;
        const actualCardNumber = paymentOption === 'existing' && selectedPaymentId
          ? paymentMethods.find((p: any) => p.id === selectedPaymentId)?.cardNumber.replace(/\*|-/g, '')
          : cardInfo.cardNumber;

        dispatch(clearCart());
        console.log('Cart cleared, redirecting to payment processing page.');

        router.push({
          pathname: '/payment-processing',
          query: {
            orderId: orderId,
            cardNumber: actualCardNumber || cardInfo.cardNumber
          }
        });
      } else {
        console.error('Order creation failed in Redux slice (not fulfilled):', result.payload);

        if (result.payload === 'CVV does not match') {
          setFormErrors((prev: any) => ({ ...prev, cvv: 'Invalid pin' }));
        } else {
          setFormErrors((prev: any) => ({ ...prev, general: result.payload || 'Order creation failed' }));
        }
      }
    }
    catch (error) {
      console.error('Checkout caught an unexpected error during order creation:', error);
      setFormErrors((prev: any) => ({ ...prev, general: 'An unexpected error occurred. Please try again.' }));
    }
  };

  if (!user) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Please log in to continue with checkout
        </Typography>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Log In
        </Button>
      </Paper>
    );
  }

  if (cart.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => router.push('/products')}>
          Continue Shopping
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {formErrors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formErrors.general}
        </Alert>
      )}
      {formErrors.cart && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formErrors.cart}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>

              {isAuthenticated && addresses.length > 0 && (
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    row
                    aria-label="address-option"
                    name="address-option"
                    value={addressOption}
                    onChange={(e) => setAddressOption(e.target.value as 'new' | 'existing')}
                  >
                    <FormControlLabel value="existing" control={<Radio />} label="Use Saved Address" />
                    <FormControlLabel value="new" control={<Radio />} label="Enter New Address" />
                  </RadioGroup>
                </FormControl>
              )}
              {addressOption === 'existing' && isAuthenticated && addresses.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.selectedAddress}>
                    <InputLabel id="select-address-label">Select Saved Address</InputLabel>
                    <Select
                      labelId="select-address-label"
                      value={selectedAddressId}
                      onChange={handleExistingAddressSelect}
                      label="Select Saved Address"
                    >
                      {addresses.map((address: any) => (
                        <MenuItem key={address.id} value={address.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Typography>
                              {address.street}, {address.city}, {address.state} {address.zipCode}
                              {address.isDefault && ' (Default)'}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address.id);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id); // Corrected to handleDeleteAddress
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              {(addressOption === 'new' || (addressOption === 'existing' && !addresses.length)) && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={shippingAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      required
                      error={!!formErrors.street}
                      helperText={formErrors.street}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                      error={!!formErrors.city}
                      helperText={formErrors.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      required
                      error={!!formErrors.state}
                      helperText={formErrors.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      required
                      error={!!formErrors.zipCode}
                      helperText={formErrors.zipCode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      required
                      error={!!formErrors.country}
                      helperText={formErrors.country}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setFormErrors((prev: any) => ({ ...prev, paymentMethod: '' }));
                  }}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>

              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Card Information
                  </Typography>

                  {isAuthenticated && paymentMethods.length > 0 && (
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <RadioGroup
                        row
                        aria-label="payment-option"
                        name="payment-option"
                        value={paymentOption}
                        onChange={(e) => setPaymentOption(e.target.value as 'new' | 'existing')}
                      >
                        <FormControlLabel value="existing" control={<Radio />} label="Use Saved Card" />
                        <FormControlLabel value="new" control={<Radio />} label="Enter New Card" />
                      </RadioGroup>
                    </FormControl>
                  )}
                  {paymentOption === 'existing' && isAuthenticated && paymentMethods.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <FormControl
                        fullWidth sx={{ mb: 2 }} error={!!formErrors.selectedPayment}>
                        <InputLabel id="select-payment-label">Select Saved Payment Method</InputLabel>
                        <Select
                          labelId="select-payment-label"
                          value={selectedPaymentId}
                          onChange={handleExistingPaymentSelect}
                          label="Select Saved Payment Method"
                        >
                          {paymentMethods.map((payment: any) => (
                            <MenuItem key={payment.id} value={payment.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography>
                                  {payment.cardNumber} - Expires {payment.expMonth}/{payment.expYear}
                                </Typography>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPayment(payment.id);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePayment(payment.id);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.selectedPayment && (
                          <Typography color="error" variant="caption">{formErrors.selectedPayment}</Typography>
                        )}
                      </FormControl>
                    </Box>
                  )}

                  {(paymentOption === 'new' || (paymentOption === 'existing' && !paymentMethods.length)) && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Card Number"
                          value={cardInfo.cardNumber}
                          onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                          inputProps={{ maxLength: 16 }}
                          required
                          error={!!formErrors.cardNumber}
                          helperText={formErrors.cardNumber}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Expiration Month"
                          type="number"
                          value={cardInfo.expMonth}
                          onChange={(e) => handleCardInfoChange('expMonth', e.target.value)}
                          inputProps={{ min: 1, max: 12 }}
                          required
                          error={!!formErrors.expMonth}
                          helperText={formErrors.expMonth}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Expiration Year"
                          type="number"
                          value={cardInfo.expYear}
                          onChange={(e) => handleCardInfoChange('expYear', e.target.value)}
                          inputProps={{ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }}
                          required
                          error={!!formErrors.expYear}
                          helperText={formErrors.expYear}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {/* CVV is always required for security regardless of new/existing card */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cardInfo.cvv}
                      onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                      inputProps={{ maxLength: 4 }}
                      required
                      error={!!formErrors.cvv}
                      helperText={formErrors.cvv || "Always required for security"}
                    />
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List>
                {cartItems.map((item) => (
                  <ListItem key={item.productId} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.product?.name}
                      secondary={`Quantity: ${item.quantity}`}
                    />
                    <Typography variant="body2">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Checkout;
