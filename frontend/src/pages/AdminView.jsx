import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper
} from '@mui/material';
import { useQueue } from '../context/QueueContext';
import CreateQueueForm from '../components/admin/CreateQueueForm';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import AdminQueueControls from '../components/admin/AdminQueueControls';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const AdminView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');
  
  // Validate selectedQueue - ensure it exists in queues array
  const validatedSelectedQueue = queues.some(q => q.name === selectedQueue) ? selectedQueue : '';
  
  // Load queues on component mount
  useEffect(() => {
    fetchQueues(true); // Show loading on initial load
    
    // Refresh queues every 15 seconds (without showing loader)
    const intervalId = setInterval(() => fetchQueues(false), 15000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - fetchQueues is stable from useCallback
  
  // Find the currently selected queue object using validated value
  const currentQueue = queues.find(queue => queue.name === validatedSelectedQueue);
  
  // Clear selected queue if it no longer exists in the queues array
  useEffect(() => {
    if (selectedQueue && !validatedSelectedQueue) {
      setSelectedQueue('');
    }
  }, [selectedQueue, validatedSelectedQueue]);
  
  // Handle queue selection change
  const handleQueueChange = (event) => {
    setSelectedQueue(event.target.value);
  };

  return (
    <Container maxWidth="lg" className="page-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage queues, view analytics, and control system settings.
        </Typography>
      </Box>
      
      <AnalyticsDashboard />
      
      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create Queue
        </Typography>
        <CreateQueueForm />
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      <Box>
        <Typography variant="h5" gutterBottom>
          Manage Queues
        </Typography>
        
        {loading && <LoadingSpinner />}
        <ErrorAlert error={error} />
        
        {!loading && queues.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
            No queues have been created yet.
          </Typography>
        )}
        
        {queues.length > 0 && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Queue Management Controls
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Queue to Manage</InputLabel>
                <Select
                  value={validatedSelectedQueue}
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
              
              {validatedSelectedQueue && currentQueue ? (
                <AdminQueueControls queue={currentQueue} />
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Select a queue to manage from the dropdown above</Typography>
                </Paper>
              )}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminView;