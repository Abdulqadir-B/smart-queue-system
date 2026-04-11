import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

const sections = [
  {
    title: 'Information We Collect',
    body:
      'This academic project may collect basic information such as your name, email address, login details, and queue-related actions when you use the system.',
  },
  {
    title: 'How We Use Information',
    body:
      'The information is used only to operate the Smart Queue Management System, manage queues, authenticate users, and support project demonstration or evaluation.',
  },
  {
    title: 'Data Sharing',
    body:
      'We do not intentionally sell or share personal information with third parties. Data may be visible to authorized staff or administrators within the system for project functionality.',
  },
  {
    title: 'Data Security',
    body:
      'Reasonable efforts are made to protect stored information, but this project is intended for academic use and should not be considered a production-grade service.',
  },
  {
    title: 'Data Retention',
    body:
      'Information may be stored for as long as needed for project use, testing, or academic review, and may be deleted when the project is no longer maintained.',
  },
  {
    title: 'Your Responsibility',
    body:
      'Please avoid submitting sensitive personal, financial, or confidential information through this system.',
  },
  {
    title: 'Contact',
    body:
      'If you have questions about this Privacy Policy, please contact the project owner or academic supervisor associated with this project.',
  },
];

const Privacy = () => {
  return (
    <Container maxWidth="md" className="page-container">
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Privacy Policy
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Last updated: April 11, 2026
            </Typography>
          </Box>

          <Typography variant="body1">
            This Privacy Policy describes how the Smart Queue Management System handles information collected through this academic project.
          </Typography>

          {sections.map((section) => (
            <Box key={section.title}>
              <Typography variant="h6" component="h2" gutterBottom>
                {section.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {section.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default Privacy;
