import React, { useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchGiftRegistryByUrl } from '../../store/slices/giftRegistrySlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';

interface Props {
  shareableUrl: string;
}

const SharedGiftRegistryPage: NextPage<Props> = ({ shareableUrl }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentRegistry, loading, error } = useSelector((state: RootState) => state.giftRegistry);

  useEffect(() => {
    if (shareableUrl) {
      dispatch(fetchGiftRegistryByUrl(shareableUrl) as any);
    }
  }, [dispatch, shareableUrl]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={() => router.push('/')} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Box>
    );
  }

  if (!currentRegistry) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Gift registry not found
        </Typography>
        <Button onClick={() => router.push('/')} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{currentRegistry.name} - Gift Registry</title>
        <meta name="description" content={`Gift registry: ${currentRegistry.name}`} />
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {currentRegistry.name}
            </Typography>
            {currentRegistry.description && (
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {currentRegistry.description}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Created by: {currentRegistry.user?.firstName} {currentRegistry.user?.lastName}
              </Typography>
              <Chip 
                label={currentRegistry.isPublic ? 'Public Registry' : 'Private Registry'} 
                color="primary"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom>
          Registry Items ({currentRegistry.items?.length || 0})
        </Typography>

        {currentRegistry.items && currentRegistry.items.length > 0 ? (
          <Grid container spacing={3}>
            {currentRegistry.items.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.product?.name || `Product ID: ${item.productId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Priority: {item.priority}
                    </Typography>
                    {item.product?.price && (
                      <Typography variant="h6" color="primary">
                        ${item.product.price}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No items in this registry yet
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  return {
    props: {
      shareableUrl: id as string,
    },
  };
};

export default SharedGiftRegistryPage;
