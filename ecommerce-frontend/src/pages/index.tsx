import React, { useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories } from '../store/slices/categorySlice';

const HomePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to E-Commerce Store
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Compare products across categories and find the perfect match for your needs
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/categories')}
          sx={{ mt: 2 }}
        >
          Browse Categories
        </Button>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom>
        Featured Categories
      </Typography>
      
      <Grid container spacing={3}>
        {categories.slice(0, 6).map((category) => (
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
                <Typography variant="h6" component="h3" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products?categoryId=${category.id}`);
                  }}
                >
                  View Products
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No categories available yet. Check back soon!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
