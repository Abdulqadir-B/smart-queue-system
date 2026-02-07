/**
 * Unauthorized Page
 * Shown when user tries to access routes they don't have permission for
 * Shows minimal information without header/footer
 */

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 3 }} />
      
      <Typography variant="h3" component="h1" gutterBottom align="center">
        404
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }} align="center">
        The page you're looking for doesn't exist.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
        size="large"
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default Unauthorized;
