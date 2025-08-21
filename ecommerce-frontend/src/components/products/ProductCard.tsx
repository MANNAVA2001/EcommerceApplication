import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { ShoppingCart, Visibility, Compare } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect?: (productId: string) => void;
  isSelected?: boolean;
  showCompareButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isSelected = false,
  showCompareButton = false
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleViewProduct = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.images?.[0] || '/placeholder-image.jpg'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Chip
            label={product.inStock ? 'In Stock' : 'Out of Stock'}
            color={product.inStock ? 'success' : 'error'}
            size="small"
          />
        </Box>
        {product.inStock && (
          <Typography variant="body2" color="text.secondary">
            {product.stockQuantity} available
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <IconButton onClick={handleViewProduct} color="primary">
            <Visibility />
          </IconButton>
          {showCompareButton && onSelect && (
            <IconButton
              onClick={() => onSelect(product.id.toString())}
              color={isSelected ? 'secondary' : 'default'}
            >
              <Compare />
            </IconButton>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          size="small"
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
