import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorAlert = ({ error, severity = 'error' }) => {
  if (!error) return null;

  return (
    <Alert severity={severity} sx={{ mt: 2, mb: 2 }}>
      <AlertTitle>{severity === 'error' ? 'Error' : 'Warning'}</AlertTitle>
      {typeof error === 'string' ? error : error.message || 'An unknown error occurred'}
    </Alert>
  );
};

export default ErrorAlert;