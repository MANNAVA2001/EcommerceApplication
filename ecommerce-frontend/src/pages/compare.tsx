import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip
} from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, compareProducts, compareExternalPrices } from '../store/slices/productSlice';
import { fetchCategories, fetchCategoryById } from '../store/slices/categorySlice';
import { addToCart } from '../store/slices/cartSlice';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const ComparePage: React.FC = () => {
  const router = useRouter();
  const { categoryId, products: productIds } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { products, comparisonData, externalPriceData, loading } = useSelector((state: RootState) => state.products);
  const { categories, selectedCategory } = useSelector((state: RootState) => state.categories);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId as string || '');

  useEffect(() => {
    dispatch(fetchCategories());
    if (categoryId && typeof categoryId === 'string') {
      dispatch(fetchCategoryById(categoryId));
      dispatch(fetchProducts({ categoryId }));
      setSelectedCategoryId(categoryId);
    } else {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (productIds && typeof productIds === 'string') {
      setSelectedProducts(productIds.split(','));
    }
  }, [productIds]);

  const handleCategoryChange = useCallback((newCategoryId: string) => {
    setSelectedCategoryId(newCategoryId);
    setSelectedProducts([]);
    if (newCategoryId) {
      dispatch(fetchCategoryById(newCategoryId));
      dispatch(fetchProducts({ categoryId: newCategoryId }));
      router.push(`/compare?categoryId=${newCategoryId}`, undefined, { shallow: true });
    } else {
      dispatch(fetchProducts({}));
      router.push('/compare', undefined, { shallow: true });
    }
  }, [dispatch, router]);

  const handleProductSelection = useCallback((productIds: string[]) => {
    setSelectedProducts(productIds);
    if (productIds.length > 0) {
      const queryParams = new URLSearchParams();
      if (selectedCategoryId) queryParams.set('categoryId', selectedCategoryId);
      queryParams.set('products', productIds.join(','));
      router.push(`/compare?${queryParams.toString()}`, undefined, { shallow: true });
    }
  }, [selectedCategoryId, router]);

  const handleCompare = useCallback(() => {
    if (selectedProducts.length >= 2 && selectedCategoryId) {
      dispatch(compareProducts({
        categoryId: selectedCategoryId,
        productIds: selectedProducts
      }));
    }
  }, [selectedProducts, selectedCategoryId, dispatch]);

  const handleExternalCompare = useCallback(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (selectedProducts.length === 1) {
      const product = products.find(p => p.id.toString() === selectedProducts[0]);
      if (product) {
        dispatch(compareExternalPrices({
          productId: product.id.toString(),
          productName: product.name
        }));
      }
    }
  }, [selectedProducts, products, dispatch, user, router]);

  const categoryProducts = useMemo(() => products.filter(p => {
    if (!selectedCategoryId) return true;
    const productCategoryId = typeof p.categoryId === 'string' 
      ? p.categoryId 
      : typeof p.categoryId === 'number'
        ? p.categoryId.toString()
        : p.categoryId.id.toString();
    return productCategoryId === selectedCategoryId;
  }), [products, selectedCategoryId]);

  const productsToCompare = useMemo(() => 
    products.filter(p => selectedProducts.includes(p.id.toString())), 
    [products, selectedProducts]
  );

  const handleAddToCart = useCallback((product: any) => {
    dispatch(addToCart({
      product: product,
      quantity: 1
    }));
    router.push('/cart');
  }, [dispatch, router]);

  const handleViewDetails = useCallback((productId: string | number) => {
    router.push(`/products/${productId}`);
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Product Comparison
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Select products from the same category to compare their features
        </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategoryId}
              label="Category"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedCategoryId}>
            <InputLabel>Products to Compare</InputLabel>
            <Select
              multiple
              value={selectedProducts}
              label="Products to Compare"
              onChange={(e) => handleProductSelection(e.target.value as string[])}
              renderValue={(selected) => 
                `${selected.length} product${selected.length !== 1 ? 's' : ''} selected`
              }
            >
              {categoryProducts.map((product) => (
                <MenuItem key={product.id} value={product.id.toString()}>
                  <Checkbox checked={selectedProducts.includes(product.id.toString())} />
                  <ListItemText primary={product.name} secondary={`$${product.price}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedProducts.length >= 2 && (
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleCompare}
            disabled={!selectedCategoryId}
          >
            Compare Selected Products ({selectedProducts.length})
          </Button>
        </Box>
      )}

      {selectedProducts.length === 1 && (
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleExternalCompare}
          >
            Compare Price with External Retailers
          </Button>
        </Box>
      )}

      {selectedProducts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Selected Products
          </Typography>
          <Grid container spacing={2}>
            {productsToCompare.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      ${product.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Chip 
                      label={product.inStock ? 'In Stock' : 'Out of Stock'}
                      size="small"
                      color={product.inStock ? 'success' : 'error'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {comparisonData && comparisonData.category && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Comparison Results
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Feature</strong></TableCell>
                  {comparisonData?.products?.map((product) => (
                    <TableCell key={product.id} align="center">
                      <strong>{product.name}</strong>
                      <br />
                      <Typography variant="body2" color="primary">
                        ${product.price}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Description</strong></TableCell>
                  {comparisonData?.products?.map((product) => (
                    <TableCell key={product.id}>
                      {product.description}
                    </TableCell>
                  ))}
                </TableRow>
                
                {[...comparisonData?.category?.comparisonFields || []]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <TableRow key={field.name}>
                      <TableCell>
                        <strong>{field.name.replace(/([A-Z])/g, ' $1').trim()}</strong>
                        {field.unit && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ({field.unit})
                          </Typography>
                        )}
                      </TableCell>
                      {comparisonData?.products?.map((product) => (
                        <TableCell key={product.id} align="center">
                          {product.features?.[field.name] || 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                <TableRow>
                  <TableCell><strong>Stock Status</strong></TableCell>
                  {comparisonData?.products?.map((product) => (
                    <TableCell key={product.id} align="center">
                      <Chip 
                        label={product.inStock ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        color={product.inStock ? 'success' : 'error'}
                      />
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell><strong>Actions</strong></TableCell>
                  {comparisonData?.products?.map((product) => (
                    <TableCell key={product.id} align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewDetails(product.id)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {selectedProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Select products to compare their features side by side
          </Typography>
        </Box>
      )}

      {selectedProducts.length === 1 && !externalPriceData && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Click "Compare Price with External Retailers" to see pricing from other stores
          </Typography>
        </Box>
      )}

      {externalPriceData && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            External Price Comparison for "{externalPriceData.productName}"
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Retailer</strong></TableCell>
                  <TableCell align="center"><strong>Price</strong></TableCell>
                  <TableCell align="center"><strong>Availability</strong></TableCell>
                  <TableCell align="center"><strong>Last Updated</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {externalPriceData.retailers.map((retailer) => (
                  <TableRow key={retailer.name}>
                    <TableCell>
                      <Typography variant="h6">{retailer.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" color="primary">
                        ${retailer.price}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={retailer.availability ? 'Available' : 'Out of Stock'}
                        size="small"
                        color={retailer.availability ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(retailer.lastUpdated).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {retailer.url && (
                        <Button 
                          variant="outlined" 
                          size="small"
                          href={retailer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on {retailer.name}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      </Box>
    </ProtectedRoute>
  );
};

export default ComparePage;
