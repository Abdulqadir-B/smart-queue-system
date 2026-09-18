import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useQueue } from '../context/QueueContext';
import JoinQueueForm from '../components/customer/JoinQueueForm';
import TokenStatus from '../components/customer/TokenStatus';
import CustomerQueuePicker from '../components/customer/CustomerQueuePicker';
import AutoNotificationManager from '../components/customer/AutoNotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const CustomerView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');
  const [panel, setPanel] = useState('join');

  const queueList = useMemo(() => (Array.isArray(queues) ? queues : []), [queues]);

  useEffect(() => {
    fetchQueues(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQueue = useMemo(
    () => queueList.find((queue) => queue.name === selectedQueue),
    [queueList, selectedQueue]
  );

  const handlePanelChange = (_e, value) => {
    if (value) setPanel(value);
  };

  return (
    <Container maxWidth="lg" className="page-container">
      <AutoNotificationManager />

      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(120deg, rgba(13,148,136,0.1) 0%, rgba(30,58,95,0.06) 100%)'
              : 'linear-gradient(120deg, rgba(45,212,191,0.12) 0%, rgba(30,58,95,0.25) 100%)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.14em' }}>
          Customer portal
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 0.5 }}>
          Join a queue or track your token
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
          Choose a service on the left, then get your token. Already checked in? Switch to Track and enter your token
          details.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 0.5,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          display: 'inline-flex',
          flexWrap: 'wrap',
        }}
      >
        <ToggleButtonGroup
          value={panel}
          exclusive
          onChange={handlePanelChange}
          aria-label="Customer portal section"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              border: 'none',
              borderRadius: '10px !important',
            },
          }}
        >
          <ToggleButton value="join" aria-label="Join a queue">
            <ConfirmationNumberIcon sx={{ mr: 1, fontSize: 20 }} />
            Join a queue
          </ToggleButton>
          <ToggleButton value="track" aria-label="Track token">
            <TrackChangesIcon sx={{ mr: 1, fontSize: 20 }} />
            Track your token
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {loading && <LoadingSpinner />}
      <ErrorAlert error={error} />

      {!loading && queueList.length === 0 && panel === 'join' && (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }} color="text.secondary">
          No queues are currently available. Please check back later.
        </Typography>
      )}

      {!loading && queueList.length > 0 && panel === 'join' && (
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <CustomerQueuePicker
              queues={queueList}
              loading={loading}
              selectedQueueName={selectedQueue}
              onSelectQueue={setSelectedQueue}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            {selectedQueue && currentQueue ? (
              <JoinQueueForm key={selectedQueue} queue={currentQueue} />
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
                <ConfirmationNumberIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select a queue to continue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pick a service from the list. You will see live counts and can request your token on this side.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {!loading && panel === 'track' && (
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <TokenStatus />
        </Box>
      )}
    </Container>
  );
};

export default CustomerView;
