import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorAlert from '../common/ErrorAlert';
import { useQueue } from '../../context/QueueContext';
import { calculateEstimatedWaitTime, formatWaitTime, getPositionInQueue } from '../../utils/helpers';
import { 
  validateCustomerName, 
  validateEmail, 
  validatePhone, 
  sanitizeName,
  sanitizeEmail,
  sanitizePhone
} from '../../utils/sanitize';

// Store dialog state OUTSIDE component to survive re-renders
let globalDialogState = {
  open: false,
  token: null,
  queueName: null
};

const JoinQueueForm = ({ queue }) => {
  const { joinQueue } = useQueue();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(globalDialogState.open);
  const [joinedToken, setJoinedToken] = useState(globalDialogState.token);
  const [copied, setCopied] = useState(false);
  const [customerData, setCustomerData] = useState({
    customerName: '',
    phone: '',
    email: ''
  });

  // Validation errors for each field
  const [validationErrors, setValidationErrors] = useState({
    customerName: '',
    phone: '',
    email: '',
  });

  // Touched fields to show errors only after user interacts
  const [touched, setTouched] = useState({
    customerName: false,
    phone: false,
    email: false,
  });

  // Sync with global state on mount and when it changes
  useEffect(() => {
    if (globalDialogState.open && globalDialogState.queueName === queue?.name) {
      setDialogOpen(true);
      setJoinedToken(globalDialogState.token);
    }
  }, [queue?.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'customerName') {
      sanitizedValue = sanitizeName(value);
    } else if (name === 'email') {
      sanitizedValue = sanitizeEmail(value);
    } else if (name === 'phone') {
      sanitizedValue = sanitizePhone(value);
    }
    
    setCustomerData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  // Handle field blur to mark as touched and validate
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, customerData[field]);
  };

  // Validate individual field
  const validateField = (field, value) => {
    let result = { isValid: true, error: '' };
    
    switch (field) {
      case 'customerName':
        result = validateCustomerName(value);
        break;
      case 'email':
        // Email is optional, only validate if provided
        if (value && value.trim()) {
          result = validateEmail(value);
        }
        break;
      case 'phone':
        // Phone is optional, only validate if provided
        if (value && value.trim()) {
          result = validatePhone(value);
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: result.error
    }));
    
    return result.isValid;
  };

  // Validate all fields
  const validateAllFields = () => {
    const nameResult = validateCustomerName(customerData.customerName);
    const emailResult = customerData.email.trim() ? validateEmail(customerData.email) : { isValid: true, error: '' };
    const phoneResult = customerData.phone.trim() ? validatePhone(customerData.phone) : { isValid: true, error: '' };
    
    setValidationErrors({
      customerName: nameResult.error,
      email: emailResult.error,
      phone: phoneResult.error,
    });
    
    setTouched({
      customerName: true,
      phone: true,
      email: true,
    });
    
    return nameResult.isValid && emailResult.isValid && phoneResult.isValid;
  };

  const handleJoinQueue = async () => {
    // Validate all fields
    if (!validateAllFields()) {
      setError('Please fix the errors before joining the queue');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Trim all fields before sending to backend
      const trimmedData = {
        customerName: customerData.customerName.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone.trim()
      };
      
      const response = await joinQueue(queue.name, trimmedData);
      
      if (response && response.token) {
        // Update global state FIRST
        globalDialogState = {
          open: true,
          token: response,
          queueName: queue.name
        };
        
        setJoinedToken(response);
        
        // Set local state
        setDialogOpen(true);
        
        // Store token info in localStorage for persistent notifications
        // This allows auto-reconnection even after page refresh
        const tokenInfo = {
          queueName: queue.name,
          tokenNumber: response.token,
          verificationKey: response.verificationKey,
          timestamp: Date.now()
        };
        localStorage.setItem('qms_active_token', JSON.stringify(tokenInfo));
        
        // Dispatch custom event to immediately notify AutoNotificationManager
        window.dispatchEvent(new CustomEvent('qms_token_joined', { detail: tokenInfo }));
        
        // Clear form after successful submission
        setCustomerData({
          customerName: '',
          phone: '',
          email: ''
        });
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    globalDialogState = { open: false, token: null, queueName: null };
    setDialogOpen(false);
    setJoinedToken(null);
    setCopied(false); // Reset copied state when closing dialog
  };

  // Copy verification key to clipboard
  const handleCopyVerificationKey = async () => {
    try {
      await navigator.clipboard.writeText(joinedToken?.verificationKey);
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy verification key:', err);
    }
  };

  // Calculate wait time estimates - use useMemo to prevent recalculation on every render
  const { waitTimeText, position } = useMemo(() => {
    const minutes = joinedToken
      ? calculateEstimatedWaitTime(joinedToken.token, queue.servingToken)
      : 0;
    const text = formatWaitTime(minutes);
    const pos = joinedToken ? getPositionInQueue(joinedToken.token, queue.servingToken) : 0;
    return { waitTimeText: text, position: pos };
  }, [joinedToken, queue?.servingToken]);

  if (!queue) {
    return null;
  }

  return (
    <>
      <Card 
        sx={{ 
          mb: 3,
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              mb: 3,
              color: 'primary.main'
            }}
          >
            Join {queue.name} Queue
          </Typography>
          
          <ErrorAlert error={error} />
          
          {/* Queue Status Section */}
          <Box 
            sx={{ 
              bgcolor: 'grey.50', 
              p: 3, 
              borderRadius: 2,
              mb: 4,
              border: '1px solid',
              borderColor: 'grey.300'
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                textAlign: 'center',
                mb: 2,
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              Current Queue Status
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Currently Serving
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {queue.servingToken}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Last Token Issued
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {queue.lastToken}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  People Waiting
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {Math.max(0, queue.lastToken - queue.servingToken)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Form Section */}
          <Box component="form" sx={{ mt: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                textAlign: 'center',
                mb: 3,
                fontWeight: 500
              }}
            >
              Enter Your Details
            </Typography>
            
            <Box sx={{ maxWidth: '500px', mx: 'auto' }}>
              <TextField
                fullWidth
                label="Your Name"
                name="customerName"
                value={customerData.customerName}
                onChange={handleInputChange}
                onBlur={() => handleBlur('customerName')}
                margin="normal"
                required
                placeholder="Enter your full name"
                helperText={
                  touched.customerName && validationErrors.customerName
                    ? validationErrors.customerName
                    : ""
                }
                error={touched.customerName && !!validationErrors.customerName}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  sx: { fontSize: '1rem' }
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={customerData.phone}
                onChange={handleInputChange}
                onBlur={() => handleBlur('phone')}
                margin="normal"
                placeholder="e.g., +1 234 567 8900"
                helperText={
                  touched.phone && validationErrors.phone
                    ? validationErrors.phone
                    : ""
                }
                error={touched.phone && !!validationErrors.phone}
                inputProps={{ maxLength: 20 }}
                InputProps={{
                  sx: { fontSize: '1rem' }
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={customerData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur('email')}
                margin="normal"
                placeholder="e.g., john@example.com"
                helperText={
                  touched.email && validationErrors.email
                    ? validationErrors.email
                    : ""
                }
                error={touched.email && !!validationErrors.email}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  sx: { fontSize: '1rem' }
                }}
                sx={{ mb: 3 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleJoinQueue}
              disabled={
                loading || 
                !queue.isActive || 
                !customerData.customerName.trim() ||
                customerData.customerName.trim().length < 3 ||
                !!validationErrors.customerName
              }
              sx={{ 
                minWidth: '250px',
                height: '56px',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              {loading ? 'Joining Queue...' : 'Get My Token Number'}
            </Button>
          </Box>
          
          {!queue.isActive && (
            <Typography 
              color="error" 
              variant="body1" 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                fontWeight: 500,
                bgcolor: 'error.light',
                color: 'error.dark',
                p: 1.5,
                borderRadius: 1
              }}
            >
              ⚠️ This queue is currently paused
            </Typography>
          )}
          
          {customerData.customerName.trim().length > 0 && customerData.customerName.trim().length < 3 && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                display: 'block',
                color: 'error.main'
              }}
            >
              Name must be at least 3 characters long
            </Typography>
          )}
          
          {!customerData.customerName.trim() && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                display: 'block',
                color: 'text.secondary'
              }}
            >
              Please enter your name to continue
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={dialogOpen && joinedToken !== null} 
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            bgcolor: 'success.main', 
            color: 'white',
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          ✓ Success!
        </DialogTitle>
        <DialogContent sx={{ mt: 2, pb: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Your token <strong>#{joinedToken?.token}</strong> for
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
              {queue.name}
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              py: 2,
              px: 3, 
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="h2" sx={{ fontWeight: 'bold', my: 1 }}>
                {joinedToken?.token}
              </Typography>
            </Box>

            {/* Verification Key Display */}
            <Box sx={{ 
              bgcolor: '#8D6E63',
              p: 2, 
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="caption" sx={{ color: '#FFF', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                🔐 SAVE YOUR VERIFICATION KEY
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFF', letterSpacing: 2, fontFamily: 'monospace' }}>
                  {joinedToken?.verificationKey}
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                  <IconButton 
                    onClick={handleCopyVerificationKey}
                    size="small"
                    sx={{ 
                      color: copied ? '#4CAF50' : '#FFF',
                      '&:hover': { bgcolor: '#5D4037', color: '#FFF' }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ color: '#FFF', display: 'block', mt: 0.5 }}>
                You'll need this key to track your token
              </Typography>
            </Box>

            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              textAlign: 'left'
            }}>
              <Typography variant="body2" gutterBottom color="text.primary">
                <strong>Currently Serving:</strong> #{queue.servingToken === 0 ? 'None' : queue.servingToken}
              </Typography>
              {position > 0 ? (
                <>
                  <Typography variant="body2" gutterBottom color="text.primary">
                    <strong>Position:</strong> {position}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    <strong>Est. Wait:</strong> {waitTimeText}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  🎉 It's your turn!
                </Typography>
              )}
            </Box>

            {/* Auto-notification info */}
            <Box sx={{ 
              bgcolor: 'white', 
              color: 'black',
              p: 1.5, 
              borderRadius: 1,
              mt: 2,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'grey.300'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                🔔 Notifications are automatically enabled!
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                You'll be notified when it's your turn, even if you close this page.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            sx={{ px: 4 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(JoinQueueForm, (prevProps, nextProps) => {
  // Only re-render if queue name changes, not if other queue properties change
  return prevProps.queue.name === nextProps.queue.name;
});