// API base URL - from environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Socket URL - from environment variables
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Queue refresh interval (in milliseconds)
export const QUEUE_REFRESH_INTERVAL = parseInt(
  import.meta.env.VITE_QUEUE_REFRESH_INTERVAL || "10000"
); // defaults to 10 seconds

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  CUSTOMER: "customer",
};

// Status colors for visual indicators
export const STATUS_COLORS = {
  active: "#4caf50", // green
  inactive: "#f44336", // red
  waiting: "#2196f3", // blue
  called: "#ff9800", // orange
};

// Token status
export const TOKEN_STATUS = {
  WAITING: "waiting",
  CALLED: "called",
  SERVED: "served",
  SKIPPED: "skipped",
};
