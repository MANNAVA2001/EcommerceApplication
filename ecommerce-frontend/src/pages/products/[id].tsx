import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  IconButton
} from '@mui/material';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProductById } from '../../store/slices/productSlice';
import { fetchCategoryById } from '../../store/slices/categorySlice';
import { addToCart } from '../../store/slices/cartSlice';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);
  
  const { selectedProduct, loading: productLoading } = useSelector((state: RootState) => state.products);
  const { selectedCategory, loading: categoryLoading } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.categoryId) {
      const categoryId = typeof selectedProduct.categoryId === 'string' 
        ? selectedProduct.categoryId 
        : typeof selectedProduct.categoryId === 'number'
          ? selectedProduct.categoryId.toString()
          : selectedProduct.categoryId.id.toString();
      dispatch(fetchCategoryById(categoryId));
    }
  }, [dispatch, selectedProduct]);

  if (productLoading || !selectedProduct) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading product...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        onClick={() => router.back()} 
        sx={{ mb: 2 }}
        variant="outlined"
      >
        ← Back
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {selectedProduct.name}
          </Typography>
          
          <Typography variant="h4" color="primary" gutterBottom>
            ${selectedProduct.price}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip 
              label={selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
              color={selectedProduct.inStock ? 'success' : 'error'}
            />
            {selectedProduct.stockQuantity && (
              <Chip 
                label={`${selectedProduct.stockQuantity} available`}
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedProduct.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body1">Quantity:</Typography>
            <IconButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Remove />
            </IconButton>
            <TextField
              size="small"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{ width: 80 }}
              inputProps={{ min: 1, max: selectedProduct.stockQuantity }}
            />
            <IconButton
              onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))}
              disabled={quantity >= selectedProduct.stockQuantity}
            >
              <Add />
            </IconButton>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              disabled={!selectedProduct.inStock}
              sx={{ mr: 2 }}
              startIcon={<ShoppingCart />}
              onClick={() => {
                console.log('Add to Cart clicked', { product: selectedProduct, quantity });
                dispatch(addToCart({ product: selectedProduct, quantity }));
                router.push('/cart');
              }}
            >
              Add to Cart
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => {
                const categoryId = typeof selectedProduct.categoryId === 'string' 
                  ? selectedProduct.categoryId 
                  : typeof selectedProduct.categoryId === 'number'
                    ? selectedProduct.categoryId.toString()
                    : selectedProduct.categoryId.id.toString();
                router.push(`/compare?categoryId=${categoryId}&products=${selectedProduct.id}`);
              }}
            >
              Compare Similar Products
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Specifications
            </Typography>
            
            {selectedCategory && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category: {selectedCategory.name}
                </Typography>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            <List dense>
              {Object.entries(selectedProduct.features || {}).map(([key, value]) => (
                <ListItem key={key} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {(!selectedProduct.features || Object.keys(selectedProduct.features).length === 0) && (
              <Typography variant="body2" color="text.secondary">
                No detailed specifications available.
              </Typography>
            )}
          </Paper>

          {selectedCategory && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparison Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This product can be compared using these attributes:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {[...selectedCategory.comparisonFields]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <Chip 
                      key={field.name}
                      label={field.name.replace(/([A-Z])/g, ' $1').trim()}
                      size="small"
                      variant="outlined"
                      color={field.required ? 'primary' : 'default'}
                    />
                  ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
