import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { Store, Category, CardGiftcard } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const router = useRouter();

  const navigationCards = [
    {
      title: 'Products',
      description: 'Browse our wide selection of products',
      icon: <Store sx={{ fontSize: 48, color: 'primary.main' }} />,
      path: '/products',
      color: 'primary.main'
    },
    {
      title: 'Categories',
      description: 'Explore products by category',
      icon: <Category sx={{ fontSize: 48, color: 'secondary.main' }} />,
      path: '/categories',
      color: 'secondary.main'
    },
    {
      title: 'Gift Registers',
      description: 'Create and manage gift registries',
      icon: <CardGiftcard sx={{ fontSize: 48, color: 'success.main' }} />,
      path: '/gift-registries',
      color: 'success.main'
    },
    {
      title: 'Gift Cards',
      description: 'Create and manage gift cards',
      icon: <CardGiftcard sx={{ fontSize: 48, color: 'success.main' }} />,
      path: '/gift-cards',
      color: 'success.main'
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to E-Commerce Store
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your one-stop shop for all your needs
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {navigationCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                textAlign: 'center',
                p: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}
              onClick={() => router.push(card.path)}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {card.description}
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(card.path);
                  }}
                >
                  Go to {card.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
