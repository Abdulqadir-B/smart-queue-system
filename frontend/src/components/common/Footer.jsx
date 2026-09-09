import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: { xs: 'center', sm: 'left' },
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            © {new Date().getFullYear()} Smart Queue Management System (SQM). All rights reserved.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              gap: { xs: 2, sm: 2.5 },
              alignItems: 'center',
            }}
          >
            <Link
              color="text.secondary"
              component={RouterLink}
              to="/customer"
              underline="hover"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 500, '&:hover': { color: 'primary.main' } }}
            >
              Get Token
            </Link>
            <Link
              color="text.secondary"
              component={RouterLink}
              to="/privacy"
              underline="hover"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 500, '&:hover': { color: 'primary.main' } }}
            >
              Privacy Policy
            </Link>
            <Link
              color="text.secondary"
              component={RouterLink}
              to="/terms"
              underline="hover"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 500, '&:hover': { color: 'primary.main' } }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
