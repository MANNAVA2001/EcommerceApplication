import React, { useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories } from '../store/slices/categorySlice';

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Product Categories
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Browse our product categories and compare items to find the perfect match
      </Typography>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={() => router.push(`/categories/${category.id}`)}
            >
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Comparison Features:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {category.comparisonFields.slice(0, 4).map((field) => (
                      <Chip 
                        key={field.name}
                        label={field.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {category.comparisonFields.length > 4 && (
                      <Chip 
                        label={`+${category.comparisonFields.length - 4} more`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/categories/${category.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products?categoryId=${category.id}`);
                    }}
                  >
                    Browse Products
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No categories available yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesPage;
