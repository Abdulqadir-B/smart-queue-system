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
  Stack,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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

  const waitingCount = Math.max(0, (queue.lastToken ?? 0) - (queue.servingToken ?? 0));

  return (
    <>
      <Card
        sx={{
          mb: 4,
          position: 'relative',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.82),
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LoadingSpinner message="Processing…" />
          </Box>
        )}

        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
                Queue
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25 }}>
                {queue.name}
              </Typography>
            </Box>
            <Chip
              label={queue.isActive ? 'Active' : 'Paused'}
              color={queue.isActive ? 'success' : 'warning'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <ErrorAlert error={error} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
            <Box
              sx={{
                flex: 1,
                px: 2,
                py: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Now serving
              </Typography>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}>
                {queue.servingToken === 0 ? '—' : queue.servingToken}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                px: 2,
                py: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Last issued
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}>
                {queue.lastToken === 0 ? '—' : queue.lastToken}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                px: 2,
                py: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Waiting
              </Typography>
              <Typography
                variant="h3"
                color={waitingCount > 0 ? 'secondary.main' : 'text.primary'}
                sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}
              >
                {waitingCount}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
            Admin actions
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <Button
              onClick={() => setResetDialogOpen(true)}
              startIcon={<RestartAltIcon />}
              variant="contained"
              color="warning"
              size="large"
              fullWidth
            >
              Reset queue
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              size="large"
              fullWidth
            >
              Delete queue
            </Button>
          </Stack>

          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Day-to-day operations—call next, pause, complete service—live in the{' '}
              <strong>staff desk</strong>.
            </Typography>
          </Alert>
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
