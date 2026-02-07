import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
  Paper
} from '@mui/material';
import { useQueue } from '../context/QueueContext';
import QueueControls from '../components/staff/QueueControls';
import QueueCard from '../components/common/QueueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const StaffView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');
  
  // Load queues on component mount
  useEffect(() => {
    fetchQueues(true); // Show loading on initial load
    
    // Refresh queues every 10 seconds (without showing loader)
    const intervalId = setInterval(() => fetchQueues(false), 10000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - fetchQueues is stable from useCallback
  
  // Find the currently selected queue object
  const currentQueue = queues.find(queue => queue.name === selectedQueue);
  
  // Handle queue selection change
  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  return (
    <Container maxWidth="lg" className="page-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage queues and serve customers efficiently.
        </Typography>
      </Box>
      
      {loading && queues.length === 0 && <LoadingSpinner />}
      <ErrorAlert error={error} />
      
      {!loading && queues.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
          No queues are available to manage.
        </Typography>
      )}
      
      {queues.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Queue Status Overview
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {queues.map((queue) => (
              <Grid item xs={12} sm={6} md={4} key={queue.name}>
                <QueueCard queue={queue} />
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Queue Management
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Queue to Manage</InputLabel>
              <Select
                value={selectedQueue}
                label="Select Queue to Manage"
                onChange={handleQueueChange}
              >
                <MenuItem value="" disabled>
                  <em>Select a queue to manage</em>
                </MenuItem>
                {queues.map((queue) => (
                  <MenuItem key={queue.name} value={queue.name}>
                    {queue.name} - {queue.isActive ? 'Active' : 'Paused'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedQueue && currentQueue ? (
              <QueueControls queue={currentQueue} />
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Select a queue to manage from the dropdown above</Typography>
              </Paper>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default StaffView;