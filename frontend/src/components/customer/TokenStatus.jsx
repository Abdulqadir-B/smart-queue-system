/**
 * Token Status Component
 * Allows customers to track their token status
 * 
 * XSS Protection:
 * - React automatically escapes all JSX content ({status.customer.name}, etc.)
 * - Customer data (name, email, phone) rendered safely via JSX expressions
 * - No dangerouslySetInnerHTML usage
 * - Input validation via verificationKey check (6-digit code)
 * - Queue names and token numbers sanitized before API submission
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { NotificationsActive, NotificationsOff } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/FiberManualRecord';
import { useSocket } from '../../context/SocketContext';
import { useQueue } from '../../context/QueueContext';
import { getPositionInQueue, formatWaitTime, calculateEstimatedWaitTime } from '../../utils/helpers';
import NotificationPopup from '../common/NotificationPopup';
import useNotification from '../../hooks/useNotification';

const TokenStatus = () => {
  const { socket, isConnected, subscribeAsCustomer } = useSocket();
  const { getTokenStatus, queues, fetchQueues } = useQueue();
  const isTrackingRef = useRef(false);

  // Fetch queues on mount if fetchQueues is available
  useEffect(() => {
    if (fetchQueues) {
      fetchQueues();
    }
  }, [fetchQueues]);

  // Filter active queues only
  const activeQueues = useMemo(() => {
    return (queues || []).filter((q) => q.isActive !== false);
  }, [queues]);
  
  // Notification system
  const { 
    isGranted, 
    requestPermission, 
    notifyYourTurn, 
    playSound 
  } = useNotification();
  
  const [tokenInfo, setTokenInfo] = useState({
    queueName: '',
    tokenNumber: '',
    verificationKey: '',
  });

  // Auto-select first active queue if not set
  useEffect(() => {
    if (!tokenInfo.queueName && activeQueues.length > 0) {
      setTokenInfo((prev) => ({ ...prev, queueName: activeQueues[0].name }));
    }
  }, [activeQueues, tokenInfo.queueName]);

  const [status, setStatus] = useState({
    isTracking: false,
    isCalled: false,
    position: 0,
    estimatedWait: 0,
    currentServing: 0,
    customer: null,
    tokenStatus: '',
    waitTime: null,
    serviceTime: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Handle form input
  const handleChange = (e) => {
    setTokenInfo({
      ...tokenInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Start tracking token
  const handleStartTracking = async () => {
    if (!tokenInfo.queueName || !tokenInfo.tokenNumber || !tokenInfo.verificationKey) {
      setError('Please enter queue name, token number, and verification key');
      return;
    }
    
    // Convert token to number
    const tokenNumber = parseInt(tokenInfo.tokenNumber, 10);
    if (isNaN(tokenNumber)) {
      setError('Token must be a number');
      return;
    }

    // Validate verification key format (6 digits)
    if (!/^\d{6}$/.test(tokenInfo.verificationKey)) {
      setError('Verification key must be a 6-digit number');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Get token status from API with verification key
      const tokenData = await getTokenStatus(tokenInfo.queueName, tokenNumber, tokenInfo.verificationKey);
      
      // IMPORTANT: Set tracking ref FIRST before any state updates
      isTrackingRef.current = true;
      
      // Subscribe to socket updates IMMEDIATELY
      subscribeAsCustomer(tokenInfo.queueName, tokenNumber);
      
      // Update status with API data (this will trigger the socket useEffect)
      setStatus({
        isTracking: true,
        isCalled: tokenData.status === 'serving',
        position: tokenData.position || 0,
        estimatedWait: tokenData.estimatedWaitTime || 0,
        currentServing: tokenData.status === 'serving' ? tokenNumber : 0,
        customer: tokenData.customer,
        tokenStatus: tokenData.status,
        waitTime: tokenData.waitTime,
        serviceTime: tokenData.serviceTime
      });
      
    } catch (err) {
      isTrackingRef.current = false;
      setError('Failed to get token status: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Stop tracking token
  const handleStopTracking = () => {
    isTrackingRef.current = false;
    setStatus({
      isTracking: false,
      isCalled: false,
      position: 0,
      estimatedWait: 0,
      currentServing: 0,
    });
    setTokenInfo({
      queueName: '',
      tokenNumber: '',
      verificationKey: '',
    });
  };

  // Listen for socket events
  useEffect(() => {
    if (!socket || !isConnected || !status.isTracking || !tokenInfo.queueName || !tokenInfo.tokenNumber) {
      return;
    }

    // Capture current values to avoid stale closures
    const currentQueueName = tokenInfo.queueName;
    const currentTokenNumber = parseInt(tokenInfo.tokenNumber, 10);

    // Listen for subscription confirmation
    const handleCustomerJoined = () => {
      // Subscription confirmed
    };

    // Listen for token updates
    const handleTokenCalled = (data) => {
      if (data.queueName === currentQueueName) {
        const currentServing = data.token || data.tokenNumber;
        const position = getPositionInQueue(currentTokenNumber, currentServing);
        const estimatedWait = calculateEstimatedWaitTime(currentTokenNumber, currentServing);
        const isCalled = currentTokenNumber === currentServing;

        setStatus(prevStatus => ({
          ...prevStatus,
          currentServing,
          position,
          estimatedWait,
          isCalled,
        }));
      }
    };

    // Listen for your specific token being called
    const handleYourTurn = (data) => {
      if (
        data.queueName === currentQueueName &&
        data.tokenNumber === currentTokenNumber
      ) {
        setStatus(prevStatus => ({
          ...prevStatus,
          isCalled: true,
          position: 0,
          estimatedWait: 0,
        }));
        
        // Show notification popup
        setShowPopup(true);
        
        // Play sound alert
        playSound();
        
        // Show browser notification (if permission granted)
        notifyYourTurn({
          tokenNumber: data.tokenNumber,
          queueName: data.queueName,
        });
      }
    };

    socket.on('customer:joined', handleCustomerJoined);
    socket.on('token:called', handleTokenCalled);
    socket.on('token:your-turn', handleYourTurn);

    return () => {
      socket.off('customer:joined', handleCustomerJoined);
      socket.off('token:called', handleTokenCalled);
      socket.off('token:your-turn', handleYourTurn);
    };
  }, [socket, isConnected, status.isTracking, tokenInfo.queueName, tokenInfo.tokenNumber, playSound, notifyYourTurn]);

  return (
    <>
      {/* Notification Popup */}
      <NotificationPopup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        tokenNumber={tokenInfo.tokenNumber}
        queueName={tokenInfo.queueName}
        autoDismiss={false}
      />

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
                Status
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                Track your token
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Enter the details from your token receipt to follow your place in line.
              </Typography>
            </Box>

            {status.isTracking && (
              <Chip
                icon={isGranted ? <NotificationsActive /> : <NotificationsOff />}
                label={isGranted ? 'Notifications on' : 'Notifications off'}
                color={isGranted ? 'success' : 'default'}
                size="small"
                onClick={() => {
                  if (!isGranted) {
                    requestPermission();
                  }
                }}
                sx={{ cursor: isGranted ? 'default' : 'pointer', flexShrink: 0 }}
              />
            )}
          </Box>

          {!status.isTracking ? (
            <Box component="form" sx={{ mt: 2 }}>
              {activeQueues.length === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No active queues are currently available to track. Please check back later.
                </Alert>
              )}
              <TextField
                select
                name="queueName"
                label="Select Queue"
                variant="outlined"
                fullWidth
                margin="normal"
                value={tokenInfo.queueName}
                onChange={handleChange}
                required
                error={!!error && !tokenInfo.queueName}
                size="small"
                disabled={activeQueues.length === 0}
                helperText={
                  activeQueues.length === 0
                    ? 'No active queues available to track'
                    : 'Select an active queue to track your token'
                }
              >
                {activeQueues.length === 0 ? (
                  <MenuItem value="" disabled>
                    No active queues available
                  </MenuItem>
                ) : (
                  activeQueues.map((q) => (
                    <MenuItem key={q._id || q.id || q.name} value={q.name}>
                      {q.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField
                name="tokenNumber"
                label="Token Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={tokenInfo.tokenNumber}
                onChange={handleChange}
                required
                error={!!error && !tokenInfo.tokenNumber}
                type="number"
                size="small"
                sx={{
                  '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
              <TextField
                name="verificationKey"
                label="Verification Key"
                variant="outlined"
                fullWidth
                margin="normal"
                value={tokenInfo.verificationKey}
                onChange={handleChange}
                required
                error={!!error && !tokenInfo.verificationKey}
                type="text"
                size="small"
                placeholder="Enter 6-digit key"
                helperText="Enter the 6-digit key you received when joining the queue"
                inputProps={{ 
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              
              {/* Notification Permission Alert */}
              {!isGranted && (
                <Alert severity="info" sx={{ mt: 2 }} action={
                  <Button color="inherit" size="small" onClick={requestPermission}>
                    Enable
                  </Button>
                }>
                  <Typography variant="body2">
                    Enable notifications to get alerts when it's your turn
                  </Typography>
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="medium"
                sx={{ mt: 2, px: 4, py: 1 }}
                onClick={handleStartTracking}
                disabled={!isConnected || activeQueues.length === 0}
              >
              Start Tracking
            </Button>
            {!isConnected && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                Not connected to server. Please try again later.
              </Typography>
            )}
          </Box>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                mb: 2,
                textAlign: 'center',
                borderRadius: 3,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(145deg, rgba(13,148,136,0.12) 0%, rgba(30,58,95,0.1) 100%)'
                    : 'linear-gradient(145deg, rgba(45,212,191,0.15) 0%, rgba(30,58,95,0.35) 100%)',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <CircleIcon
                  sx={{
                    fontSize: 12,
                    color: isConnected ? 'success.main' : 'text.disabled',
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {isConnected ? 'Live updates' : 'Reconnecting…'}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {tokenInfo.queueName}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  my: 1.5,
                  color: 'primary.main',
                }}
              >
                {tokenInfo.tokenNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                State: <strong>{status.tokenStatus || 'Unknown'}</strong>
              </Typography>

              {status.customer && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                    On file
                  </Typography>
                  <Typography variant="body2">Name: {status.customer.name}</Typography>
                  {status.customer.phone && <Typography variant="body2">Phone: {status.customer.phone}</Typography>}
                  {status.customer.email && <Typography variant="body2">Email: {status.customer.email}</Typography>}
                </Box>
              )}
            </Paper>

            {status.tokenStatus === 'serving' ? (
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  p: 2,
                  borderRadius: 1,
                  textAlign: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h6">It's your turn now!</Typography>
                <Typography variant="body1">Please proceed to the counter</Typography>
              </Box>
            ) : status.tokenStatus === 'waiting' ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Position in queue: <strong>{status.position || 'Unknown'}</strong>
                </Typography>
                <Typography variant="body1">
                  Estimated wait time:{' '}
                  <strong>{formatWaitTime(status.estimatedWait) || 'Calculating...'}</strong>
                </Typography>
              </Box>
            ) : status.tokenStatus === 'served' ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Your service has been completed!
                </Typography>
                {status.waitTime && (
                  <Typography variant="body2">
                    You waited for: {formatWaitTime(status.waitTime)}
                  </Typography>
                )}
                {status.serviceTime && (
                  <Typography variant="body2">
                    Service time: {formatWaitTime(status.serviceTime)}
                  </Typography>
                )}
              </Alert>
            ) : status.tokenStatus === 'abandoned' ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  This token has been marked as abandoned
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Position in queue: <strong>{status.position || 'Unknown'}</strong>
                </Typography>
                <Typography variant="body1">
                  Estimated wait time:{' '}
                  <strong>{formatWaitTime(status.estimatedWait) || 'Calculating...'}</strong>
                </Typography>
              </Box>
            )}

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleStopTracking}
            >
              Stop Tracking
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default TokenStatus;