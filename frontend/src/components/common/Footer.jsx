import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Smart Queue Management System'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          <Link color="inherit" href="https://github.com">
            GitHub
          </Link>{' | '}
          <Link color="inherit" href="/privacy">
            Privacy
          </Link>{' | '}
          <Link color="inherit" href="/terms">
            Terms
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;