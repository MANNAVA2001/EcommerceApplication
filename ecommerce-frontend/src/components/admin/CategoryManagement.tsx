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
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';

interface ComparisonField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  unit?: string;
  displayOrder: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  comparisonFields: ComparisonField[];
}

const CategoryManagement: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.categories);
  
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    comparisonFields: []
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpen = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        comparisonFields: category.comparisonFields?.map((field: any, index: number) => ({
          ...field,
          displayOrder: field.displayOrder ?? index
        })) || []
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        comparisonFields: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Category description is required');
      return;
    }
    
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id.toString(), data: formData })).unwrap();
      } else {
        const result = await dispatch(createCategory(formData)).unwrap();
        //const newCategoryId = result.data?.id || result.id;
        const newCategoryId = result.id;

        if (newCategoryId) {
          router.push(`/admin/categories/${newCategoryId}`);
          return;
        }
      }
      handleClose();
      dispatch(fetchCategories());
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error?.message || error || 'Failed to save category. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      try {
        await dispatch(deleteCategory(categoryId.toString())).unwrap();
        dispatch(fetchCategories());
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const addComparisonField = () => {
    setFormData(prev => ({
      ...prev,
      comparisonFields: [
        ...prev.comparisonFields,
        { name: '', type: 'text', required: false, displayOrder: prev.comparisonFields.length }
      ]
    }));
  };

  const updateComparisonField = (index: number, field: Partial<ComparisonField>) => {
    setFormData(prev => ({
      ...prev,
      comparisonFields: prev.comparisonFields.map((f, i) => 
        i === index ? { ...f, ...field } : f
      )
    }));
  };

  const removeComparisonField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      comparisonFields: prev.comparisonFields.filter((_, i) => i !== index)
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Comparison Fields</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {category.comparisonFields?.map((field, index) => (
                      <Chip
                        key={index}
                        label={`${field.name} (${field.type})`}
                        size="small"
                        variant="outlined"
                      />
                    )) || 'No fields defined'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(category)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                error={!formData.name.trim() && error !== null}
                helperText={!formData.name.trim() && error !== null ? 'Category name is required' : ''}
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
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Comparison Fields
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Define the features that products in this category can be compared by
              </Typography>
              
              {formData.comparisonFields.map((field, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Field Name"
                        value={field.name}
                        onChange={(e) => updateComparisonField(index, { name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={field.type}
                          label="Type"
                          onChange={(e) => updateComparisonField(index, { type: e.target.value as any })}
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="boolean">Boolean</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Required</InputLabel>
                        <Select
                          value={field.required ? 'true' : 'false'}
                          label="Required"
                          onChange={(e) => updateComparisonField(index, { required: e.target.value === 'true' })}
                        >
                          <MenuItem value="true">Yes</MenuItem>
                          <MenuItem value="false">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        onClick={() => removeComparisonField(index)}
                        color="error"
                        variant="outlined"
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              
              <Button
                onClick={addComparisonField}
                variant="outlined"
                startIcon={<Add />}
              >
                Add Comparison Field
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManagement;
