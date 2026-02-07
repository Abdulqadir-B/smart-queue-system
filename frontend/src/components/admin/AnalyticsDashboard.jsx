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

  // Fetch analytics data
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

  // Subscribe as admin for real-time updates (only once when socket connects)
  useEffect(() => {
    if (socket) {
      subscribeAsAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]); // Only re-run when socket instance changes

  // Fetch analytics on initial load
  useEffect(() => {
    fetchAnalytics(true); // Show loading on initial load
    
    // Refresh analytics every minute (without showing loader)
    const intervalId = setInterval(() => fetchAnalytics(false), 60000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - fetchAnalytics is stable

  // Listen for real-time updates that might affect analytics
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = () => {
      fetchAnalytics(false); // Don't show loading on real-time updates
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:called', handleQueueUpdate);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:called', handleQueueUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Analytics card component
  const StatCard = ({ title, value, color }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ color }}>
        {value !== undefined ? value : '-'}
      </Typography>
    </Paper>
  );

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Analytics
        </Typography>

        {loading && !analytics && <LoadingSpinner message="Loading analytics..." />}
        <ErrorAlert error={error} />

        {analytics && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Queues"
                  value={analytics.totalQueues}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Queues"
                  value={analytics.activeQueues}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Tokens Issued"
                  value={analytics.totalTokensIssued}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Served"
                  value={analytics.totalTokensServed}
                  color="info.main"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;