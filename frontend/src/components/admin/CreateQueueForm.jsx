import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useQueue } from '../../context/QueueContext';
import { validateQueueName } from '../../utils/helpers';
import { sanitizeQueueName } from '../../utils/sanitize';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const CreateQueueForm = () => {
  const { createQueue, loading: globalLoading, error: globalError } = useQueue();
  const [queueName, setQueueName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Clear success message after 5 seconds
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Sanitize queue name
    const sanitized = sanitizeQueueName(queueName);
    
    // Validate queue name
    if (!sanitized.trim()) {
      setError('Queue name is required');
      return;
    }
    
    if (!validateQueueName(sanitized)) {
      setError('Queue name must be 2-50 characters and contain only letters, numbers, dashes, and underscores');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await createQueue(sanitized);
      
      setSuccess(`Queue "${sanitized}" created successfully`);
      setQueueName('');
    } catch (err) {
      setError(err.message || 'Failed to create queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        mb: 0,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
          Names appear to customers on the join screen. Use clear desk names (e.g. Passport, Counter A).
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
          <TextField
            label="Queue name"
            variant="outlined"
            fullWidth
            value={queueName}
            onChange={(e) => setQueueName(sanitizeQueueName(e.target.value))}
            error={!!error}
            helperText={error || 'Letters, numbers, dashes, underscores · 2–50 characters'}
            disabled={loading || globalLoading}
            inputProps={{ maxLength: 50 }}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || globalLoading}
            startIcon={<AddCircleOutlineIcon />}
            size="large"
          >
            Create queue
          </Button>
        </Box>

        {(loading || globalLoading) && <LoadingSpinner message="Creating queue…" />}
        {globalError && <ErrorAlert error={globalError} />}
        {success && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateQueueForm;