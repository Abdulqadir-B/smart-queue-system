import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
} from '@mui/material';
import AnalyticsService from '../../services/AnalyticsService';
import { useSocket } from '../../context/SocketContext';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket, subscribeAsAdmin } = useSocket();

  const fetchAnalytics = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await AnalyticsService.getAnalyticsCounts();
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (socket) {
      subscribeAsAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    fetchAnalytics(true);
    const intervalId = setInterval(() => fetchAnalytics(false), 60000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = () => {
      fetchAnalytics(false);
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:called', handleQueueUpdate);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:called', handleQueueUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const StatCard = ({ title, value, color }) => (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 2,
        textAlign: 'left',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 8px 24px rgba(15, 23, 42, 0.06)'
              : '0 8px 24px rgba(0, 0, 0, 0.35)',
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ color, fontWeight: 800, mt: 0.75, lineHeight: 1.1 }}>
        {value !== undefined ? value : '—'}
      </Typography>
    </Paper>
  );

  return (
    <Card
      sx={{
        mb: 4,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
          Overview
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 2 }}>
          System analytics
        </Typography>

        {loading && !analytics && <LoadingSpinner message="Loading analytics…" />}
        <ErrorAlert error={error} />

        {analytics && (
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total queues" value={analytics.totalQueues} color="primary.main" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Active queues" value={analytics.activeQueues} color="success.main" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Tokens issued" value={analytics.totalTokensIssued} color="secondary.main" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total served" value={analytics.totalTokensServed} color="info.main" />
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
