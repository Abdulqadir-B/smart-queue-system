import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { formatWaitTime, calculateEstimatedWaitTime } from '../../utils/helpers';

function QueueStat({ label, value, color = 'text.primary' }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

const CustomerQueuePicker = ({
  queues,
  loading,
  selectedQueueName,
  onSelectQueue,
  title = 'Select a service',
  searchPlaceholder = 'Search queues…',
  allowPausedSelection = false,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return queues;
    return queues.filter((queue) => queue.name.toLowerCase().includes(q));
  }, [queues, query]);

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        {title}
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxHeight: { xs: 'none', md: 'min(70vh, 640px)' },
          overflowY: { xs: 'visible', md: 'auto' },
          pr: { md: 0.5 },
        }}
      >
        {loading &&
          [1, 2, 3].map((k) => (
            <Card key={k} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Skeleton width="60%" height={28} />
                <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                <Skeleton width="100%" height={40} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ))}

        {!loading && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No queues match your search.
          </Typography>
        )}

        {!loading &&
          filtered.map((queue) => {
            const last = queue.lastToken;
            const serving = queue.servingToken;
            const lastN = last ?? 0;
            const servingN = serving ?? 0;
            const waiting = Math.max(0, lastN - servingN);
            const estNext = lastN + 1;
            const estMinutes = calculateEstimatedWaitTime(estNext, servingN);
            const waitLabel =
              queue.isActive && waiting > 0 ? formatWaitTime(estMinutes) : '—';
            const selected = selectedQueueName === queue.name;

            return (
              <Card
                key={queue.name}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? 'action.selected' : 'background.paper',
                  transition: (theme) =>
                    theme.transitions.create(['border-color', 'box-shadow', 'background-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  boxShadow: selected ? 2 : 0,
                }}
              >
                <CardActionArea
                  onClick={() => onSelectQueue(queue.name)}
                  disabled={!allowPausedSelection && !queue.isActive}
                >
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, pr: 1 }}>
                        {queue.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={queue.isActive ? 'Active' : 'Paused'}
                        color={queue.isActive ? 'success' : 'warning'}
                        variant={queue.isActive ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, flexShrink: 0 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                      <PeopleOutlineIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        {waiting} waiting
                        {queue.isActive && waiting > 0 ? ` · Est. wait ${waitLabel}` : ''}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <QueueStat label="Now serving" value={serving ?? '—'} color="success.main" />
                      <QueueStat label="Last token" value={last ?? '—'} color="primary.main" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
      </Box>
    </Box>
  );
};

export default CustomerQueuePicker;
