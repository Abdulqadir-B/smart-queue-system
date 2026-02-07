import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
  TextField,
} from '@mui/material';
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

  // Calculate waiting customers
  const waitingCount = Math.max(0, queue.lastToken - queue.servingToken);

  return (
    <>
      <Card sx={{ mb: 4, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner message="Processing..." />
          </Box>
        )}
        
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Queue: {queue.name}
          </Typography>
          
          <ErrorAlert error={error} />
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              my: 2,
              p: 2,
              bgcolor: theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Now Serving
              </Typography>
              {queue.servingToken >= queue.lastToken && queue.lastToken > 0 ? (
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'normal' }}>
                  None
                </Typography>
              ) : (
                <Typography variant="h3" color="primary.main">
                  {queue.servingToken === 0 ? "-" : queue.servingToken}
                </Typography>
              )}
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Issued
              </Typography>
              <Typography variant="h3">
                {queue.lastToken === 0 ? "-" : queue.lastToken}
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Waiting
              </Typography>
              <Typography variant="h3" color={waitingCount > 0 ? "secondary.main" : "text.primary"}>
                {waitingCount}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Queue Controls
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ButtonGroup 
                variant="contained" 
                aria-label="queue control buttons" 
                size="large"
                sx={{ 
                  maxWidth: '600px', 
                  width: 'auto',
                  '& .MuiButton-root': {
                    borderRadius: 0,
                  },
                  '& .MuiButton-root:first-of-type': {
                    borderTopLeftRadius: '4px',
                    borderBottomLeftRadius: '4px',
                  },
                  '& .MuiButton-root:last-of-type': {
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '4px',
                  },
                }}
              >
                <Button 
                  onClick={handleCallNext}
                  startIcon={<SkipNextIcon />}
                  color="primary"
                  disabled={!queue.isActive || waitingCount === 0}
                  sx={{ px: 3, border: 'none' }}
                >
                  Call Next
                </Button>
                
                <Button 
                  onClick={handleTogglePause}
                  startIcon={queue.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                  color={queue.isActive ? "warning" : "success"}
                  sx={{ px: 3, border: 'none' }}
                >
                  {queue.isActive ? "Pause" : "Resume"}
                </Button>
              </ButtonGroup>
            </Box>
            
            {currentServing > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ButtonGroup 
                  variant="outlined" 
                  aria-label="service control buttons" 
                  size="medium"
                >
                  <Button 
                    onClick={handleCompleteService}
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    sx={{ px: 2 }}
                  >
                    Complete Service
                  </Button>
                  
                  <Button 
                    onClick={handleAbandonToken}
                    startIcon={<PersonOffIcon />}
                    color="error"
                    sx={{ px: 2 }}
                  >
                    Mark as No-show
                  </Button>
                </ButtonGroup>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<RestartAltIcon />}
                onClick={() => setResetDialogOpen(true)}
                sx={{ px: 3, width: 'auto', minWidth: '180px' }}
              >
                Reset Queue
              </Button>
            </Box>
          </Box>
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
              sx={{ width: '100%', maxWidth: '300px' }}
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
              sx={{ width: '100%', maxWidth: '300px' }}
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