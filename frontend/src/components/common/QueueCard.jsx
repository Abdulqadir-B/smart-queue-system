/**
 * Queue Card Component
 * Displays queue information in a card format
 *
 * XSS Protection:
 * - Queue names rendered safely via React JSX escaping
 * - All numeric data (tokens, counts) are numbers, not user strings
 * - No dangerouslySetInnerHTML used
 */

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { getQueueStatusInfo } from '../../utils/helpers';

const QueueCard = ({ queue }) => {
  const { text: statusText } = getQueueStatusInfo(queue.isActive);
  const waiting = Math.max(0, (queue.lastToken ?? 0) - (queue.servingToken ?? 0));

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        borderWidth: 1,
        transition: (theme) =>
          theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 12px 32px rgba(15, 23, 42, 0.08)'
              : '0 12px 32px rgba(0, 0, 0, 0.4)',
          borderColor: 'primary.light',
        },
      }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
          {queue.name}
        </Typography>
        <Chip
          label={statusText}
          size="small"
          color={queue.isActive ? 'success' : 'warning'}
          sx={{ fontWeight: 600, flexShrink: 0 }}
        />
      </Box>

      <CardContent sx={{ pt: 2.5, pb: 2, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, gap: 1 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Now serving
            </Typography>
            {queue.servingToken >= queue.lastToken && queue.lastToken > 0 ? (
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>
                None
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800, mt: 0.5 }}>
                {queue.servingToken === 0 ? '—' : queue.servingToken}
              </Typography>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Last token
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {queue.lastToken === 0 ? '—' : queue.lastToken}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Waiting
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: waiting > 0 ? 'secondary.main' : 'text.primary',
                fontWeight: 800,
                mt: 0.5,
              }}
            >
              {waiting}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QueueCard;
