import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { fetchUserCheckoutData } from '../store/slices/userCheckoutSlice';  
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import { Address, CheckoutPaymentMethod } from '../types';
import {CheckoutData} from '../store/slices/userCheckoutSlice';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const checkoutData = useSelector((state: RootState) => state.userCheckout.data);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
  if (user) {
    dispatch(fetchUserCheckoutData()); 
  }
}, [dispatch, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            My Profile
          </Typography>
          
          {updateSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              value={user.email || ''}
              margin="normal"
              disabled
              helperText="Email cannot be changed"
            />
            <Box sx={{ mt: 4 }}>  
  <Typography variant="h6" gutterBottom>  
    Saved Addresses  
  </Typography>  
  {checkoutData?.addresses?.map((address) => (
    <Card key={address.id} sx={{ mb: 2 }}>  
      <CardContent>  
        <Typography>  
          {address.street}, {address.city}, {address.state} {address.zipCode}  
        </Typography>  
        {address.isDefault && <Chip label="Default" size="small" />}  
      </CardContent>  
    </Card>  
  ))}  
</Box>  
  
  <Box sx={{ mt: 4 }}>  
    <Typography variant="h6" gutterBottom>  
      Saved Payment Methods  
    </Typography>  
     {checkoutData?.paymentMethods?.map((payment) => (   
      <Card key={payment.id} sx={{ mb: 2 }}>  
        <CardContent>  
          <Typography>  
            {payment.cardNumber} - Expires {payment.expMonth}/{payment.expYear}  
          </Typography>  
        </CardContent>  
      </Card>  
    ))}  
  </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>

            <Box textAlign="center">
              <Button
                variant="outlined"
                onClick={() => router.push('/orders')}
                sx={{ mr: 1 }}
              >
                My Orders
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => router.push('/products')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
