import React, { useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  CardMedia
} from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchProductById } from '../../../store/slices/productSlice';
import { fetchCategoryById } from '../../../store/slices/categorySlice';

const AdminProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedProduct, loading: productLoading } = useSelector((state: RootState) => state.products);
  const { selectedCategory } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.categoryId) {
      dispatch(fetchCategoryById(selectedProduct.categoryId.toString()));
    }
  }, [dispatch, selectedProduct]);

  if (productLoading || !selectedProduct) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading product...</Typography>
      </Box>
    );
  }

  console.log('AdminProductDetailPage - selectedProduct:', selectedProduct);
  console.log('AdminProductDetailPage - selectedProduct.images:', selectedProduct.images);

  return (
    <Box>
      <Button 
        onClick={() => router.push('/admin/products')} 
        sx={{ mb: 2 }}
        variant="outlined"
      >
        ← Back to Product Management
      </Button>

      <Typography variant="h3" component="h1" gutterBottom>
        {selectedProduct.name}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {selectedProduct.description}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h5" color="primary">
                  ${selectedProduct.price}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {selectedCategory?.name || 'Loading...'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Stock Quantity
                </Typography>
                <Typography variant="body1">
                  {selectedProduct.stockQuantity}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                  size="small"
                  color={selectedProduct.inStock ? 'success' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              
              {(selectedProduct.images || []).length > 0 ? (
                <Grid container spacing={2}>
                  {(selectedProduct.images || []).map((image, index) => (
                    <Grid item xs={6} key={index}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No images available for this product.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained"
              onClick={() => router.push(`/admin/products`)}
            >
              Edit Product
            </Button>
            <Button 
              variant="outlined"
              onClick={() => router.push(`/products/${selectedProduct.id}`)}
            >
              View Public Page
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProductDetailPage;
