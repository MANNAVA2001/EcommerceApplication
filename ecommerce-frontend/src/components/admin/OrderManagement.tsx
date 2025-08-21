import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Container,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
const OrderManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  useEffect(() => {
    dispatch(getAllOrders({}));
  }, [dispatch]);
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdateError(null);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Authorization': `Bearer ${Cookies.get('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
      dispatch(getAllOrders({}));
    } catch (error: any) {
      setStatusUpdateError(error.message || 'Failed to update order status');
    }
  };
  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'shipped':
        return 'info';
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {statusUpdateError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {statusUpdateError}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id.toString().slice(-8).toUpperCase()}</TableCell>
                <TableCell>
                  {typeof order.user === 'object' && order.user?.firstName && order.user?.lastName 
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : typeof order.user === 'object' && order.user?.email 
                      ? order.user.email 
                      : 'Unknown Customer'}
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.products.length} items</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id.toString(), e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(order)} size="small">
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - #{selectedOrder?.id.toString().slice(-8).toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {typeof selectedOrder.user === 'object' && selectedOrder.user?.firstName && selectedOrder.user?.lastName 
                    ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` 
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {typeof selectedOrder.user === 'object' && selectedOrder.user?.email 
                    ? selectedOrder.user.email 
                    : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Shipping Address:</strong>
                </Typography>
                <Typography variant="body2">
                  {selectedOrder.shippingAddress.street}<br/>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br/>
                  {selectedOrder.shippingAddress.country}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Order Information
                </Typography>
                <Typography variant="body2">
                  <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> 
                  <Chip
                    label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Products
                </Typography>
                <List>
                  {selectedOrder.products.map((item: any, index: number) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={item.productId?.name || 'Product Name Unavailable'}
                          secondary={`Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`}
                        />
                      </ListItem>
                      {index < selectedOrder.products.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default OrderManagement;
