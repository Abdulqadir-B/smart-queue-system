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
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip
} from '@mui/material';
import { getQueueStatusInfo } from '../../utils/helpers';

const QueueCard = ({ queue }) => {
  const { text: statusText, color: statusColor } = getQueueStatusInfo(queue.isActive);
  
  // Calculate waiting tokens
  const waiting = Math.max(0, queue.lastToken - queue.servingToken);
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        borderRadius: '12px',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Box 
        sx={{ 
          py: 1.5, 
          px: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          {queue.name}
        </Typography>
        <Chip 
          label={statusText} 
          size="small"
          sx={{ 
            bgcolor: 'white', 
            color: statusColor, 
            fontWeight: 'bold',
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>
      
      <CardContent sx={{ pt: 3, pb: 2 }}>        
        <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Now Serving
            </Typography>
            {queue.servingToken >= queue.lastToken && queue.lastToken > 0 ? (
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
                None
              </Typography>
            ) : (
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {queue.servingToken === 0 ? "-" : queue.servingToken}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Last Token
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              {queue.lastToken === 0 ? "-" : queue.lastToken}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Waiting
            </Typography>
            <Typography variant="h4" sx={{ 
              color: waiting > 0 ? "secondary.main" : "text.primary",
              fontWeight: waiting > 0 ? 'bold' : 'medium'
            }}>
              {waiting}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QueueCard;