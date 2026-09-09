import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { useQueue } from '../../context/QueueContext';
import { useSocket } from '../../context/SocketContext';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

const QueueControls = ({ queue }) => {
  const theme = useTheme();
  const { callNext, pauseQueue, resumeQueue, resetQueue, completeService, abandonToken } = useQueue();
  const { socket, subscribeAsStaff } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentServing, setCurrentServing] = useState(queue?.servingToken || 0);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [tokenToComplete, setTokenToComplete] = useState('');

  // Subscribe to this queue's updates
  useEffect(() => {
    if (socket && queue) {
      subscribeAsStaff([queue.name]);
    }
  }, [socket, queue, subscribeAsStaff]);
  
  // Keep the currentServing state in sync with the queue prop
  useEffect(() => {
    if (queue && queue.servingToken !== undefined) {
      setCurrentServing(queue.servingToken);
    }
  }, [queue]);

  // Handle calling next token
  const handleCallNext = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await callNext(queue.name);
      
      if (result.data && result.data.serving) {
        setCurrentServing(result.data.serving);
      }
    } catch (err) {
      setError(err.message || 'Failed to call next token');
    } finally {
      setLoading(false);
    }
  };

  // Handle pause/resume
  const handleTogglePause = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (queue.isActive) {
        await pauseQueue(queue.name);
      } else {
        await resumeQueue(queue.name);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle queue state');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleResetConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await resetQueue(queue.name);
      setCurrentServing(0);
      setResetDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to reset queue');
    } finally {
      setLoading(false);
    }
  };

  // Handle marking service as complete
  const handleCompleteService = () => {
    // Make sure we're using the most up-to-date serving token from the queue
    const tokenToMark = queue.servingToken.toString();
    setTokenToComplete(tokenToMark);
    setCompleteDialogOpen(true);
  };

  const handleCompleteServiceConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await completeService(queue.name, tokenToComplete);
      setCompleteDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to complete service');
    } finally {
      setLoading(false);
    }
  };

  // Handle marking token as abandoned
  const handleAbandonToken = () => {
    setTokenToComplete(currentServing.toString());
    setAbandonDialogOpen(true);
  };

  const handleAbandonTokenConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await abandonToken(queue.name, tokenToComplete);
      setAbandonDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to abandon token');
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
                Desk
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25 }}>
                {queue.name}
              </Typography>
            </Box>
            <Chip
              label={queue.isActive ? 'Accepting tokens' : 'Paused'}
              color={queue.isActive ? 'success' : 'warning'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <ErrorAlert error={error} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mb: 3 }}
          >
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
              {queue.servingToken >= queue.lastToken && queue.lastToken > 0 ? (
                <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 700, mt: 0.5 }}>
                  None
                </Typography>
              ) : (
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}>
                  {queue.servingToken === 0 ? '—' : queue.servingToken}
                </Typography>
              )}
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
            Actions
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
            <Button
              onClick={handleCallNext}
              startIcon={<SkipNextIcon />}
              variant="contained"
              color="primary"
              size="large"
              disabled={!queue.isActive || waitingCount === 0}
              fullWidth
            >
              Call next
            </Button>
            <Button
              onClick={handleTogglePause}
              startIcon={queue.isActive ? <PauseIcon /> : <PlayArrowIcon />}
              variant="contained"
              color={queue.isActive ? 'warning' : 'success'}
              size="large"
              fullWidth
            >
              {queue.isActive ? 'Pause desk' : 'Resume desk'}
            </Button>
          </Stack>

          {currentServing > 0 && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
              <Button
                onClick={handleCompleteService}
                startIcon={<CheckCircleIcon />}
                variant="outlined"
                color="success"
                size="large"
                fullWidth
              >
                Complete service
              </Button>
              <Button
                onClick={handleAbandonToken}
                startIcon={<PersonOffIcon />}
                variant="outlined"
                color="error"
                size="large"
                fullWidth
              >
                Mark no-show
              </Button>
            </Stack>
          )}

          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={() => setResetDialogOpen(true)}
            fullWidth
            size="large"
          >
            Reset queue
          </Button>
        </CardContent>
      </Card>
      
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>
          Reset Queue
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the "{queue.name}" queue? This will clear all tokens and set the counter back to zero.
          </Typography>
          <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetConfirm} color="error">Reset</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>
          Complete Service
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Mark token #{tokenToComplete} as served (service completed)?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              autoFocus
              margin="dense"
              label="Token Number"
              type="number"
              variant="outlined"
              value={tokenToComplete}
              onChange={(e) => setTokenToComplete(e.target.value)}
              sx={{
                width: '100%',
                maxWidth: '300px',
                '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteServiceConfirm} color="success">Complete</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={abandonDialogOpen}
        onClose={() => setAbandonDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>
          Mark Token as No-show
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to mark token #{tokenToComplete} as abandoned (no-show)?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              autoFocus
              margin="dense"
              label="Token Number"
              type="number"
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: '300px',
                '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              }}
              value={tokenToComplete}
              onChange={(e) => setTokenToComplete(e.target.value)}
            />
          </Box>
          <Typography color="error" sx={{ mt: 2 }}>
            This will remove the token from the queue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbandonDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAbandonTokenConfirm} color="error">Mark as No-show</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QueueControls;