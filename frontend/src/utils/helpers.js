// Format date to locale string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Calculate estimated wait time based on queue statistics
export const calculateEstimatedWaitTime = (currentToken, servingToken, avgServiceTime = 5) => {
  if (currentToken <= servingToken) return 0;
  const tokensAhead = currentToken - servingToken;
  return tokensAhead * avgServiceTime; // minutes
};

// Format wait time to display string
export const formatWaitTime = (minutes) => {
  if (minutes < 1) return 'Less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  let result = `${hours} hour${hours > 1 ? 's' : ''}`;
  if (remainingMinutes > 0) {
    result += ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }
  
  return result;
};

// Validate queue name format
export const validateQueueName = (name) => {
  // Must be 2-50 characters and only contain alphanumeric, dash, or underscore
  const regex = /^[a-zA-Z0-9_-]{2,50}$/;
  return regex.test(name);
};

// Get position in queue
export const getPositionInQueue = (tokenNumber, servingToken) => {
  if (tokenNumber <= servingToken) return 0;
  return tokenNumber - servingToken;
};

// Get queue status text and color
export const getQueueStatusInfo = (isActive) => {
  return {
    text: isActive ? 'Active' : 'Paused',
    color: isActive ? 'success.main' : 'error.main',
  };
};