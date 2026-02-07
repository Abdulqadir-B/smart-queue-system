import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

// Create axios instance with base settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    // Note: Token is read from localStorage here for API calls
    // Components should NOT access token directly - use AuthContext methods
    const token = localStorage.getItem("qms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors consistently
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    const status = error.response?.status;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Clear invalid token
      localStorage.removeItem("qms_token");
      localStorage.removeItem("qms_user");
      
      // Trigger logout event for components to react
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'token_expired', message: errorMessage } 
      }));
      
      // Only redirect to login if not already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = "/login?expired=true";
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (status === 403) {
      console.error("Access forbidden:", errorMessage);
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      return Promise.reject({
        message: retryAfter 
          ? `Too many requests. Please try again in ${retryAfter} seconds.`
          : "Too many requests. Please slow down and try again later.",
        status: 429,
        retryAfter,
        data: error.response?.data,
      });
    }

    // Handle 500+ Server errors
    if (status >= 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
        status,
        data: error.response?.data,
      });
    }

    // Log errors (remove in production or send to logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error("API Error:", errorMessage, status);
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
