import React from 'react';
import { Typography, Container } from '@mui/material';

const CompareSimplePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Simple Product Comparison
      </Typography>
      <Typography variant="body1">
        This page is under development. Please use the main comparison page.
      </Typography>
    </Container>
  );
};

export default CompareSimplePage;
