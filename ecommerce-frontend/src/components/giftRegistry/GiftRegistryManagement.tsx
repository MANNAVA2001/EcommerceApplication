import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchUserGiftRegistries, 
  createGiftRegistry, 
  updateGiftRegistry, 
  deleteGiftRegistry,
  shareGiftRegistry 
} from '../../store/slices/giftRegistrySlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const GiftRegistryManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { registries: giftRegistries, loading, error } = useSelector((state: RootState) => state.giftRegistry);
  const { user } = useSelector((state: RootState) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<any>(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchUserGiftRegistries() as any);
    }
  }, [dispatch, user]);

  const handleCreateRegistry = () => {
    setEditingRegistry(null);
    setFormData({ name: '', description: '', isPublic: false });
    setOpenDialog(true);
  };

  const handleEditRegistry = (registry: any) => {
    setEditingRegistry(registry);
    setFormData({
      name: registry.name,
      description: registry.description || '',
      isPublic: registry.isPublic
    });
    setOpenDialog(true);
  };

  const handleSaveRegistry = async () => {
    try {
      if (editingRegistry) {
        await dispatch(updateGiftRegistry({
          id: editingRegistry.id,
          data: formData
        }) as any);
      } else {
        await dispatch(createGiftRegistry(formData) as any);
      }
      setOpenDialog(false);
      dispatch(fetchUserGiftRegistries() as any);
    } catch (error) {
      console.error('Failed to save registry:', error);
    }
  };

  const handleDeleteRegistry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this gift registry?')) {
      try {
        await dispatch(deleteGiftRegistry(id) as any);
        dispatch(fetchUserGiftRegistries() as any);
      } catch (error) {
        console.error('Failed to delete registry:', error);
      }
    }
  };

  const handleShareRegistry = (registry: any) => {
    setEditingRegistry(registry);
    setShareEmails('');
    setShareMessage('');
    setShareDialog(true);
  };

  const handleSendShare = async () => {
    if (!editingRegistry || !shareEmails.trim()) return;

    const emails = shareEmails.split(',').map(email => email.trim()).filter(email => email);
    
    try {
      await dispatch(shareGiftRegistry({
        id: editingRegistry.id,
        recipientEmails: emails,
        message: shareMessage
      }) as any);
      setShareDialog(false);
    } catch (error) {
      console.error('Failed to share registry:', error);
    }
  };

  const copyShareableUrl = (registry: any) => {
    const url = `${window.location.origin}/gift-registries/${registry.shareableUrl}`;
    navigator.clipboard.writeText(url);
    alert('Shareable URL copied to clipboard!');
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Please log in to manage your gift registries.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Gift Registries</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRegistry}
        >
          Create Registry
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {giftRegistries.map((registry) => (
          <Grid item xs={12} md={6} lg={4} key={registry.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {registry.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {registry.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={registry.isPublic ? 'Public' : 'Private'} 
                    color={registry.isPublic ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Items: {registry.items?.length || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditRegistry(registry)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteRegistry(registry.id)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleShareRegistry(registry)}
                    title="Share"
                  >
                    <ShareIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => copyShareableUrl(registry)}
                    title="Copy URL"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {giftRegistries.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No gift registries yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first gift registry to get started
          </Typography>
          <Button variant="contained" onClick={handleCreateRegistry}>
            Create Registry
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRegistry ? 'Edit Gift Registry' : 'Create Gift Registry'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Registry Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
            }
            label="Make this registry public"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRegistry} variant="contained">
            {editingRegistry ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Gift Registry</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share "{editingRegistry?.name}" with others
          </Typography>
          <TextField
            margin="dense"
            label="Email addresses (comma separated)"
            fullWidth
            variant="outlined"
            value={shareEmails}
            onChange={(e) => setShareEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Message (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button onClick={handleSendShare} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GiftRegistryManagement;
