import React from 'react';
import Checkout from '../components/checkout/Checkout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const CheckoutPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  );
};

export default CheckoutPage;
