import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, hasRole } = useAuth();

  const showStaffCard = isAuthenticated && (hasRole('staff') || hasRole('admin'));
  const showAdminCard = isAuthenticated && hasRole('admin');

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(30,58,95,0.08) 50%, rgba(240,244,248,0) 100%)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" className="page-container" sx={{ py: { xs: 5, md: 7 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Smart Queue Management"
                size="small"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Skip the line.
                <Box component="span" sx={{ display: 'block', color: 'primary.main', mt: 0.5 }}>
                  Join the queue from your phone.
                </Box>
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mb: 3, fontSize: '1.05rem' }}>
                Get a token, track your place in real time, and get notified when it is your turn—ideal for public
                service counters and busy offices.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/customer"
                  sx={{ px: 3, py: 1.25, minWidth: { sm: 200 } }}
                >
                  Get started
                </Button>
                <Button variant="outlined" color="secondary" size="large" component={Link} to="/login" sx={{ px: 3 }}>
                  Staff sign in
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PhoneAndroidIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Remote check-in
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join without standing in a physical line.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GroupsIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Live queue position
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        See estimated wait and when you are called.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" className="page-container" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
          Portals
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          Choose how you are using the system
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                transition: (theme) =>
                  theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                  borderColor: 'primary.light',
                },
              }}
            >
              <PersonIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Customer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                Pick a service, take a token, and track your turn with optional browser notifications.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/customer" fullWidth size="large">
                Enter as customer
              </Button>
            </Paper>
          </Grid>

          {showStaffCard && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  transition: (theme) =>
                    theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                    borderColor: 'secondary.light',
                  },
                }}
              >
                <BadgeIcon sx={{ fontSize: 44, color: 'secondary.main', mb: 1.5 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Staff
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  Call the next person, pause queues, and keep the desk moving smoothly.
                </Typography>
                <Button variant="contained" color="secondary" component={Link} to="/staff" fullWidth size="large">
                  Enter as staff
                </Button>
              </Paper>
            </Grid>
          )}

          {showAdminCard && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  transition: (theme) =>
                    theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                    borderColor: 'info.light',
                  },
                }}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 44, color: 'info.main', mb: 1.5 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Admin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  Create queues, review activity, and manage controls from one dashboard.
                </Typography>
                <Button variant="contained" color="info" component={Link} to="/admin" fullWidth size="large">
                  Enter as admin
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
