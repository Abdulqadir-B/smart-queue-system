import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useQueue } from '../context/QueueContext';
import CustomerQueuePicker from '../components/customer/CustomerQueuePicker';
import CreateQueueForm from '../components/admin/CreateQueueForm';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import AdminQueueControls from '../components/admin/AdminQueueControls';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const AdminView = () => {
  const { queues, loading, error, fetchQueues } = useQueue();
  const [selectedQueue, setSelectedQueue] = useState('');

  const validatedSelectedQueue = queues.some((q) => q.name === selectedQueue) ? selectedQueue : '';

  useEffect(() => {
    fetchQueues(true);
    const intervalId = setInterval(() => fetchQueues(false), 15000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedQueue && !validatedSelectedQueue) {
      setSelectedQueue('');
    }
  }, [selectedQueue, validatedSelectedQueue]);

  const currentQueue = useMemo(
    () => queues.find((q) => q.name === validatedSelectedQueue),
    [queues, validatedSelectedQueue]
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
              ? 'linear-gradient(120deg, rgba(3,105,161,0.08) 0%, rgba(13,148,136,0.1) 100%)'
              : 'linear-gradient(120deg, rgba(3,105,161,0.2) 0%, rgba(45,212,191,0.08) 100%)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.14em' }}>
          Administration
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 0.5 }}>
          System overview and queue setup
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
          Review activity, create new desks, and perform reset or delete operations when needed. Day-to-day serving
          stays in the staff portal.
        </Typography>
      </Box>

      <AnalyticsDashboard />

      <Box sx={{ my: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
          Provisioning
        </Typography>
        <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 0.5 }}>
          Create a queue
        </Typography>
        <CreateQueueForm />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
          Lifecycle
        </Typography>
        <Typography variant="h5" component="h2" sx={{ mb: 0.5, mt: 0.5 }}>
          Manage queues
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
          Select a queue for reset or permanent delete. Use the staff desk for calling tokens and pausing lines.
        </Typography>

        {loading && queues.length === 0 && <LoadingSpinner />}
        <ErrorAlert error={error} />

        {!loading && queues.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }} color="text.secondary">
            No queues have been created yet. Add one above.
          </Typography>
        )}

        {queues.length > 0 && (
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <CustomerQueuePicker
                queues={queues}
                loading={false}
                selectedQueueName={validatedSelectedQueue}
                onSelectQueue={setSelectedQueue}
                title="Select a queue"
                searchPlaceholder="Search by queue name…"
                allowPausedSelection
              />
            </Grid>
            <Grid item xs={12} md={7}>
              {validatedSelectedQueue && currentQueue ? (
                <AdminQueueControls key={validatedSelectedQueue} queue={currentQueue} />
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
                  <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Select a queue for admin actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reset clears tokens for that desk. Delete removes the queue entirely.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default AdminView;
