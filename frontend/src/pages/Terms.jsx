import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

const sections = [
  {
    title: 'Use of the System',
    body:
      'This system is provided for academic and demonstration purposes. You may use it only in a lawful and responsible manner.',
  },
  {
    title: 'User Accounts',
    body:
      'You are responsible for maintaining the confidentiality of your login details and for the activity carried out through your account.',
  },
  {
    title: 'Acceptable Conduct',
    body:
      'Users must not misuse the application, interfere with normal operation, attempt unauthorized access, or submit harmful or misleading information.',
  },
  {
    title: 'Availability',
    body:
      'The system may be modified, suspended, or discontinued at any time without notice because it is part of an academic project.',
  },
  {
    title: 'No Warranty',
    body:
      'This project is provided on an as-is basis without guarantees of uninterrupted service, accuracy, or fitness for any particular purpose.',
  },
  {
    title: 'Limitation of Liability',
    body:
      'The project owner and associated academic institution are not liable for any loss, damage, or inconvenience arising from the use of this system.',
  },
  {
    title: 'Changes to These Terms',
    body:
      'These terms may be updated as the project evolves. Continued use of the system after changes means you accept the revised terms.',
  },
  {
    title: 'Contact',
    body:
      'If you have questions about these Terms and Conditions, please contact the project owner or academic supervisor associated with this project.',
  },
];

const Terms = () => {
  return (
    <Container maxWidth="md" className="page-container">
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Terms and Conditions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Last updated: April 11, 2026
            </Typography>
          </Box>

          <Typography variant="body1">
            These Terms and Conditions govern the use of the Smart Queue Management System developed as an academic project.
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

export default Terms;
