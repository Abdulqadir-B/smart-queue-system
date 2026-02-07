import React from 'react';
import { Container, Typography, Box, Grid, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, hasRole } = useAuth();

  // Show staff card only if user is staff or admin
  const showStaffCard = isAuthenticated && (hasRole('staff') || hasRole('admin'));
  
  // Show admin card only if user is admin
  const showAdminCard = isAuthenticated && hasRole('admin');

  return (
    <Container maxWidth="lg" className="page-container">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Smart Queue Management System
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Customer Role */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
              },
            }}
          >
            <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Customer
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3, flexGrow: 1 }}>
              Join a queue and track your position in real-time.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/customer"
                sx={{ px: 4, py: 1, width: 'auto', minWidth: '180px' }}
              >
                Enter as Customer
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Staff Role - Only show if user is staff or admin */}
        {showStaffCard && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <BadgeIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Staff
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 3, flexGrow: 1 }}>
                Manage queues, call customers, and control service flow.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/staff"
                  sx={{ px: 4, py: 1, width: 'auto', minWidth: '180px' }}
                >
                  Enter as Staff
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Admin Role - Only show if user is admin */}
        {showAdminCard && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Admin
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 3, flexGrow: 1 }}>
                Create queues, view analytics, and manage the system.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  color="info"
                  size="large"
                  component={Link}
                  to="/admin"
                  sx={{ px: 4, py: 1, width: 'auto', minWidth: '180px' }}
                >
                  Enter as Admin
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Home;