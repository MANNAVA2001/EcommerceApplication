import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, fetchProductsByCategory } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { Product } from '../types';
// Added a button to share the products on social media
const ProductsPage: React.FC = () => {
  console.log('ProductsPage component starting to render');
  
  const router = useRouter();
  const { categoryId } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  console.log('About to call useSelector for products');
  const productsState = useSelector((state: RootState) => {
    console.log('useSelector products callback, state:', state);
    return state.products;
  });
  
  console.log('About to call useSelector for categories');
  const categoriesState = useSelector((state: RootState) => {
    console.log('useSelector categories callback, state:', state);
    return state.categories;
  });
  
  console.log('Products state:', productsState);
  console.log('Categories state:', categoriesState);
  
  const products = productsState?.products || [];
  const loading = productsState?.loading || false;
  const categories = categoriesState?.categories || [];
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId as string || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchCategories());
    if (categoryId && typeof categoryId === 'string') {
      dispatch(fetchProducts({ categoryId }));
      setSelectedCategory(categoryId);
    } else {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, categoryId]);

  const handleCategoryChange = (newCategoryId: string) => {
    setSelectedCategory(newCategoryId);
    if (newCategoryId) {
      dispatch(fetchProducts({ categoryId: newCategoryId }));
      router.push(`/products?categoryId=${newCategoryId}`, undefined, { shallow: true });
    } else {
      dispatch(fetchProducts({}));
      router.push('/products', undefined, { shallow: true });
    }
  };

  console.log('About to filter products:', products, 'Is array:', Array.isArray(products));
  
  const filteredProducts: Product[] = (products || []).filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (showInStockOnly && !product.inStock) {
      return false;
    }
    
    return true;
  });

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCategory_obj = Array.isArray(categories) ? categories.find(c => c.id.toString() === selectedCategory) : null;

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Products
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {Array.isArray(categories) ? categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                )) : []}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                />
              }
              label="In stock only"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            {selectedProducts.length >= 2 && selectedCategory && (
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push(`/compare?categoryId=${selectedCategory}&products=${selectedProducts.join(',')}`)}
              >
                Compare ({selectedProducts.length})
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom>
        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        {selectedCategory_obj && ` in ${selectedCategory_obj.name}`}
      </Typography>

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                border: selectedProducts.includes(product.id.toString()) ? 2 : 0,
                borderColor: 'primary.main',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {product.name}
                  </Typography>
                  {selectedCategory && (
                    <Checkbox
                      checked={selectedProducts.includes(product.id.toString())}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleProductSelect(product.id.toString());
                      }}
                      size="small"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                
                <Typography variant="h5" color="primary" gutterBottom>
                  ${product.price}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={product.inStock ? 'In Stock' : 'Out of Stock'}
                    size="small"
                    color={product.inStock ? 'success' : 'error'}
                  />
                  {product.stockQuantity && (
                    <Chip 
                      label={`${product.stockQuantity} available`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products/${product.id}`);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductsPage;
