import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useQueue } from '../context/QueueContext';
import CustomerQueuePicker from '../components/customer/CustomerQueuePicker';
import QueueControls from '../components/staff/QueueControls';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const StaffView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');

  useEffect(() => {
    fetchQueues(true);
    const intervalId = setInterval(() => fetchQueues(false), 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQueue = useMemo(
    () => queues.find((q) => q.name === selectedQueue),
    [queues, selectedQueue]
  );

  return (
    <Container maxWidth="lg" className="page-container">
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(120deg, rgba(30,58,95,0.1) 0%, rgba(13,148,136,0.08) 100%)'
              : 'linear-gradient(120deg, rgba(30,58,95,0.35) 0%, rgba(45,212,191,0.1) 100%)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.14em' }}>
          Staff desk
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 0.5 }}>
          Run the counter
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          Pick a queue, call the next person, pause when needed, and close out service, all from one place.
        </Typography>
      </Box>

      {loading && queues.length === 0 && <LoadingSpinner />}
      <ErrorAlert error={error} />

      {!loading && queues.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }} color="text.secondary">
          No queues are available to manage yet.
        </Typography>
      )}

      {queues.length > 0 && (
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <CustomerQueuePicker
              queues={queues}
              loading={loading && queues.length === 0}
              selectedQueueName={selectedQueue}
              onSelectQueue={setSelectedQueue}
              title="Select a queue"
              searchPlaceholder="Search by queue name…"
              allowPausedSelection
            />
          </Grid>
          <Grid item xs={12} md={7}>
            {selectedQueue && currentQueue ? (
              <QueueControls key={selectedQueue} queue={currentQueue} />
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                }}
              >
                <TouchAppIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Choose a queue to open controls
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paused queues can still be selected so you can resume or inspect status.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StaffView;
