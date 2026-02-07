import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Alert,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueue } from '../../context/QueueContext';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminQueueControls = ({ queue }) => {
  const theme = useTheme();
  const { resetQueue, deleteQueue } = useQueue();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle reset
  const handleResetConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await resetQueue(queue.name);
      setResetDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to reset queue');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteQueue(queue.name);
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete queue');
    } finally {
      setLoading(false);
    }
  };

  if (!queue) return null;

  // Calculate waiting customers
  const waitingCount = Math.max(0, queue.lastToken - queue.servingToken);

  return (
    <>
      <Card sx={{ mb: 4, position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            zIndex: 2, 
            backgroundColor: 'rgba(255,255,255,0.7)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <LoadingSpinner message="Processing..." />
          </Box>
        )}
        
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Queue: {queue.name}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Status: <strong>{queue.isActive ? 'Active' : 'Paused'}</strong>
          </Alert>
          
          <ErrorAlert error={error} />
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              my: 3,
              p: 3,
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Now Serving
              </Typography>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {queue.servingToken}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Issued
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'medium' }}>
                {queue.lastToken}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Waiting
              </Typography>
              <Typography 
                variant="h3" 
                color={waitingCount > 0 ? "secondary.main" : "text.primary"}
                sx={{ fontWeight: waitingCount > 0 ? 'bold' : 'medium' }}
              >
                {waitingCount}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Admin Actions
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                onClick={() => setResetDialogOpen(true)}
                startIcon={<RestartAltIcon />}
                variant="outlined"
                color="warning"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Reset Queue
              </Button>
              
              <Button 
                onClick={() => setDeleteDialogOpen(true)}
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Delete Queue
              </Button>
            </Box>
            
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Use Staff Portal for day-to-day queue operations like calling next customer, 
                pausing/resuming, and marking service complete.
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>Reset Queue?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset <strong>{queue.name}</strong>? 
            This will set both serving token and last token back to 0. 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleResetConfirm} color="warning" variant="contained" autoFocus>
            Reset Queue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Queue?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete <strong>{queue.name}</strong>? 
            This will remove the queue and all associated tokens. 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete Queue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminQueueControls;
