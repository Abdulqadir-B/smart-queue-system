/**
 * Notification Popup Component
 * Displays a prominent modal when user's turn comes up in the queue
 * 
 * Features:
 * - Full-screen overlay with animated modal
 * - Pulsing animation to grab attention
 * - Sound alert integration
 * - Auto-dismiss option
 * - Manual dismiss button
 */

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
} from '@mui/material';
import {
  NotificationsActive,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Pulsing animation for attention
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Slide transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const NotificationPopup = ({ 
  open, 
  onClose, 
  tokenNumber, 
  queueName,
  autoDismiss = false,
  autoDismissDelay = 10000, // 10 seconds default
}) => {
  // Auto-dismiss after delay if enabled
  useEffect(() => {
    if (open && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoDismiss, autoDismissDelay, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        },
      }}
    >
      {/* Close button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      {/* Header with icon */}
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 2,
          bgcolor: 'success.main',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <NotificationsActive 
            sx={{ 
              fontSize: 64, 
              mb: 1,
              animation: `${pulse} 1s ease-in-out infinite`,
            }} 
          />
          <Typography variant="h4" component="div" fontWeight="bold">
            It's Your Turn! 🎉
          </Typography>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          Token #{tokenNumber}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Queue: <strong>{queueName}</strong>
        </Typography>

        <Box
          sx={{
            bgcolor: 'success.light',
            color: 'success.contrastText',
            p: 3,
            borderRadius: 2,
            mt: 3,
            mb: 2,
          }}
        >
          <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            Please proceed to the service counter
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your turn has arrived. Please head to the counter now.
        </Typography>

        {autoDismiss && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
            This notification will auto-dismiss in {autoDismissDelay / 1000} seconds
          </Typography>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="success"
          size="large"
          sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
        >
          Got It!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup;
