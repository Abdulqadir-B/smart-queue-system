import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { 
  AddCircleOutline as AddCircleOutlineIcon, 
  TrackChanges as TrackChangesIcon 
} from '@mui/icons-material';
import { useQueue } from '../context/QueueContext';
import JoinQueueForm from '../components/customer/JoinQueueForm';
import TokenStatus from '../components/customer/TokenStatus';
import AutoNotificationManager from '../components/customer/AutoNotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const CustomerView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Refs for scrolling to sections
  const joinQueueRef = useRef(null);
  const trackTokenRef = useRef(null);
  
  // Load queues on component mount
  useEffect(() => {
    fetchQueues(true); // Show loading on initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - fetchQueues is stable
  
  // Smooth scroll to section
  const scrollToSection = (ref, tabIndex) => {
    setActiveTab(tabIndex);
    ref.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start'
    });
  };
  
  // Find the currently selected queue object - memoized to maintain stable reference
  const currentQueue = useMemo(() => {
    return queues.find(queue => queue.name === selectedQueue);
  }, [queues, selectedQueue]);
  
  // Handle queue selection change
  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  return (
    <Container maxWidth="lg" className="page-container">
      {/* Auto Notification Manager - runs in background */}
      <AutoNotificationManager />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join a queue or track your current token status.
        </Typography>
      </Box>
      
      {/* Navigation Tabs */}
      {!loading && queues.length > 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 4, 
            position: 'sticky', 
            top: 0, 
            zIndex: 100,
            backgroundColor: 'background.paper'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<AddCircleOutlineIcon />} 
              label="Join a Queue" 
              onClick={() => scrollToSection(joinQueueRef, 0)}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
            <Tab 
              icon={<TrackChangesIcon />} 
              label="Track Your Token" 
              onClick={() => scrollToSection(trackTokenRef, 1)}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            />
          </Tabs>
        </Paper>
      )}
      
      {loading && <LoadingSpinner />}
      <ErrorAlert error={error} />
      
      {!loading && queues.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
          No queues are currently available.
        </Typography>
      )}
      
      {!loading && queues.length > 0 && (
        <>
          {/* Join a Queue Section */}
          <Box ref={joinQueueRef} sx={{ mb: 4, scrollMarginTop: '100px' }}>
            <Typography variant="h6" gutterBottom>
              Join a Queue
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Queue</InputLabel>
              <Select
                value={selectedQueue}
                label="Select Queue"
                onChange={handleQueueChange}
              >
                <MenuItem value="" disabled>
                  <em>Select a queue to join</em>
                </MenuItem>
                {queues.map((queue) => (
                  <MenuItem 
                    key={queue.name} 
                    value={queue.name}
                    disabled={!queue.isActive}
                  >
                    {queue.name} {!queue.isActive && " (Paused)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedQueue && (
              <JoinQueueForm key={selectedQueue} queue={currentQueue || queues.find(q => q.name === selectedQueue)} selectedQueueName={selectedQueue} />
            )}
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Track Your Token Section */}
          <Box ref={trackTokenRef} sx={{ scrollMarginTop: '100px' }}>
            <Typography variant="h6" gutterBottom>
              Track Your Token
            </Typography>
            <TokenStatus />
          </Box>
        </>
      )}
    </Container>
  );
};

export default CustomerView;