import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NotFound = () => {
  return (
    <Container maxWidth="md" className="page-container">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404: Page Not Found
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/"
            size="large"
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;