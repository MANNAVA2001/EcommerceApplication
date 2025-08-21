import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Container,
  Alert
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  features: Record<string, any>;
  images: string[];
  stockQuantity: number;
  inStock: boolean;
}

const ProductManagement: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);
  
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    features: {},
    images: [],
    stockQuantity: 0,
    inStock: true
  });

  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
    
    const { categoryId } = router.query;
    if (categoryId && typeof categoryId === 'string') {
      setFormData(prev => ({ ...prev, categoryId }));
    }
  }, [dispatch, router.query]);

  const handleOpen = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: typeof product.categoryId === 'string' ? product.categoryId : product.categoryId.toString(),
        features: product.features || {},
        images: product.images || [],
        stockQuantity: product.stockQuantity,
        inStock: product.inStock
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        features: {},
        images: [],
        stockQuantity: 0,
        inStock: true
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }
    
    if (!formData.categoryId) {
      setError('Category selection is required');
      return;
    }
    
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    try {
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId)
      };
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, data: productData })).unwrap();
      } else {
        const result = await dispatch(createProduct(productData)).unwrap();
        if (result && result.id) {
          router.push(`/admin/products/${result.id}`);
          return;
        }
      }
      handleClose();
      dispatch(fetchProducts({}));
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error?.message || error || 'Failed to save product. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId.toString())).unwrap();
        dispatch(fetchProducts({}));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const selectedCategory = categories.find(cat => cat.id.toString() === formData.categoryId);

  const handleFeatureChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [fieldName]: value
      }
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const productImages = Array.isArray(product.images) ? product.images : [];
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[0]}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: 50, height: 50, bgcolor: 'grey.200' }} />
                    )}
                  </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {typeof product.categoryId === 'string' 
                    ? product.categoryId 
                    : typeof product.categoryId === 'object' && product.categoryId?.name 
                      ? product.categoryId.name 
                      : categories.find(cat => cat.id === product.categoryId)?.name || 'Unknown'}
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <Chip
                    label={product.inStock ? 'In Stock' : 'Out of Stock'}
                    color={product.inStock ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                error={!formData.name.trim() && error !== null}
                helperText={!formData.name.trim() && error !== null ? 'Product name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                required
                error={formData.price <= 0 && error !== null}
                helperText={formData.price <= 0 && error !== null ? 'Price must be greater than 0' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                error={!formData.description.trim() && error !== null}
                helperText={!formData.description.trim() && error !== null ? 'Description is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!formData.categoryId && error !== null}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.categoryId}
                  label="Category *"
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  stockQuantity: parseInt(e.target.value),
                  inStock: parseInt(e.target.value) > 0
                }))}
              />
            </Grid>

            {selectedCategory && selectedCategory.comparisonFields && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Category Features
                </Typography>
                {selectedCategory.comparisonFields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.name} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label={field.name}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData.features[field.name] || ''}
                      onChange={(e) => handleFeatureChange(field.name, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              {(formData.images || []).map((image, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Image URL ${index + 1}`}
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                  />
                  <Button onClick={() => removeImageField(index)} color="error">
                    Remove
                  </Button>
                </Box>
              ))}
              <Button onClick={addImageField} variant="outlined">
                Add Image
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;
