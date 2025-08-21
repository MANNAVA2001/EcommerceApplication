import React, { useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchCategoryById } from '../../../store/slices/categorySlice';
import { fetchProductsByCategory } from '../../../store/slices/productSlice';

const AdminCategoryDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedCategory, loading: categoryLoading } = useSelector((state: RootState) => state.categories);
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchCategoryById(id));
      dispatch(fetchProductsByCategory(id));
    }
  }, [dispatch, id]);

  if (categoryLoading || !selectedCategory) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading category...</Typography>
      </Box>
    );
  }

  const categoryProducts = products.filter(p => p.categoryId === selectedCategory.id);

  return (
    <Box>
      <Button 
        onClick={() => router.push('/admin/categories')} 
        sx={{ mb: 2 }}
        variant="outlined"
      >
        ← Back to Category Management
      </Button>

      <Typography variant="h3" component="h1" gutterBottom>
        {selectedCategory.name}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {selectedCategory.description}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comparison Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Compare products in this category using these attributes:
              </Typography>
              
              <List dense>
                {selectedCategory.comparisonFields && Array.isArray(selectedCategory.comparisonFields) ? 
                  [...selectedCategory.comparisonFields]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((field) => (
                      <ListItem key={field.name} sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {field.name.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Chip 
                                label={field.type} 
                                size="small" 
                                variant="outlined"
                                color={field.required ? 'primary' : 'default'}
                              />
                            </Box>
                          }
                          secondary={field.unit && `Unit: ${field.unit}`}
                        />
                      </ListItem>
                    )) : (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="No comparison fields defined" />
                      </ListItem>
                    )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Products ({categoryProducts.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained"
                onClick={() => router.push(`/admin/products/new?categoryId=${selectedCategory.id}`)}
              >
                Create Product in this Category
              </Button>
              <Button 
                variant="outlined"
                onClick={() => router.push(`/admin/products`)}
              >
                Manage All Products
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {categoryProducts.slice(0, 6).map((product) => (
              <Grid item xs={12} sm={6} key={product.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 }
                  }}
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={product.inStock ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        color={product.inStock ? 'success' : 'error'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {categoryProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No products available in this category yet.
              </Typography>
              <Button 
                variant="contained"
                onClick={() => router.push(`/admin/products/new?categoryId=${selectedCategory.id}`)}
                sx={{ mt: 2 }}
              >
                Create First Product
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminCategoryDetailPage;
