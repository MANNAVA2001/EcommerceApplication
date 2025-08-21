import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  IconButton,
  TextField
} from '@mui/material';
import { ShoppingCart, Add, Remove, Compare } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { fetchProducts } from '../../store/slices/productSlice';

interface ProductDetailProps {
  productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const product = products.find(p => p.id === parseInt(productId));

  useEffect(() => {
    console.log('Devin: ProductDetail useEffect - productId:', productId, 'product found:', !!product, 'products length:', products.length);
    if (!product && productId) {
      console.log('Devin: ProductDetail - dispatching fetchProducts');
      dispatch(fetchProducts({}));
    }
  }, [dispatch, product, productId]);

  useEffect(() => {
    if (product) {
      fetchRecommendations();
    }
  }, [product]);

  const fetchRecommendations = async () => {
    if (!product) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/products/${product.id}/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddToCart = () => {
    console.log('handleAddToCart called', { product, quantity });
    if (product) {
      console.log('Dispatching addToCart action');
      dispatch(addToCart({ product, quantity }));
      console.log('Navigating to cart');
      router.push('/cart');
    }
  };

  const handleCompare = () => {
    if (product) {
      router.push(`/compare?products=${product.id}`);
    }
  };

  if (!product) {
    console.log('Devin: ProductDetail - no product found, productId:', productId, 'products:', products.map(p => ({ id: p.id, name: p.name })));
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Product not found</Typography>
      </Container>
    );
  }

  const categoryFeatures = typeof product.categoryId === 'object' && product.categoryId?.comparisonFields
    ? product.categoryId.comparisonFields
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images?.[0] || '/placeholder-image.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          {product.images && product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 2}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={product.inStock ? 'In Stock' : 'Out of Stock'}
              color={product.inStock ? 'success' : 'error'}
            />
            {product.inStock && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {product.stockQuantity} available
              </Typography>
            )}
          </Box>

          <Typography variant="body1" paragraph>
            {product.description}
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
              inputProps={{ min: 1, max: product.stockQuantity }}
            />
            <IconButton
              onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
              disabled={quantity >= product.stockQuantity}
            >
              <Add />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="large"
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              startIcon={<Compare />}
              onClick={handleCompare}
            >
              Compare
            </Button>
          </Box>
        </Grid>
      </Grid>

      {categoryFeatures.length > 0 && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Product Features
          </Typography>
          <List>
            {categoryFeatures.map((field: any) => (
              <ListItem key={field.name} divider>
                <ListItemText
                  primary={field.name}
                  secondary={product.features?.[field.name] || 'Not specified'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {recommendations.length > 0 && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recommended Products
          </Typography>
          <Grid container spacing={2}>
            {recommendations.slice(0, 4).map((rec: any) => (
              <Grid item xs={12} sm={6} md={3} key={rec.id}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => router.push(`/products/${rec.id}`)}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={rec.images?.[0] || '/placeholder-image.jpg'}
                    alt={rec.name}
                  />
                  <CardContent>
                    <Typography variant="subtitle2" noWrap>
                      {rec.name}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${rec.price.toFixed(2)}
                    </Typography>
                    {rec.similarity_score && (
                      <Typography variant="caption" color="textSecondary">
                        {Math.round(rec.similarity_score * 100)}% match
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default ProductDetail;
