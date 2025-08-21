import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { getAllOrders } from '../../store/slices/orderSlice';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { products } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
    dispatch(getAllOrders({ page: 1, limit: 100 }));
  }, [dispatch, user, router]);

  if (user?.role !== 'admin') {
    return null;
  }

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(product => product.stockQuantity < 10);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h5" component="div">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h5" component="div">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" component="div">
                {orders?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h5" component="div" color="error">
                {lowStockProducts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/admin/products')}
              >
                Manage Products
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push('/admin/categories')}
              >
                Manage Categories
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/admin/orders')}
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order) => (
                <ListItem key={order.id} divider>
                  <ListItemText
                    primary={`Order #${order.id.toString().slice(-6)}`}
                    secondary={`${order.products.length} items - $${order.totalAmount.toFixed(2)}`}
                  />
                  <Chip
                    label={order.status}
                    color={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'cancelled' ? 'error' :
                      order.status === 'shipped' ? 'info' : 'default'
                    }
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {lowStockProducts.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="error">
                Low Stock Alert
              </Typography>
              <List>
                {lowStockProducts.map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.stockQuantity} units`}
                    />
                    <Chip
                      label={`${product.stockQuantity} left`}
                      color="error"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
