/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/ApiService";

const AuthContext = createContext(null);

// Local storage keys
const TOKEN_KEY = "qms_token";
const USER_KEY = "qms_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Handle double-nested user object (if present from backend)
          const userData = parsedUser.user || parsedUser;
          
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);

          // Validate token on app load (background verification)
          // This ensures stored token is still valid
          validateTokenSilently(storedToken, userData);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error parsing stored user:", error);
        }
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        // Always set loading to false after synchronous initialization
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Helper to validate token without blocking app load
  const validateTokenSilently = async (tokenToValidate, currentUser) => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.success) {
        // Extract user from nested structure (backend returns data.user)
        const updatedUser = response.data.data.user || response.data.data;
        if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      // Token is invalid - will be handled by API interceptor
      // which will trigger auth:logout event
      if (process.env.NODE_ENV === "development") {
        console.log("Stored token is invalid or expired");
      }
    }
  };

  // Listen for auth:logout events (triggered by API interceptor on 401)
  useEffect(() => {
    const handleAuthLogout = (event) => {
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Show notification if available
      const reason = event.detail?.reason;
      if (reason === "token_expired") {
        // Don't log sensitive session info in production
        if (process.env.NODE_ENV === "development") {
          console.log("Session expired. Redirecting to login.");
        }
      }
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store in state
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return { success: true, user, token };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Login error:", error);
      }
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  /**
   * Register new user
   * @param {string} username - Username
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  const register = async (username, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store in state
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return { success: true, user, token };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Register error:", error);
      }
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call backend logout endpoint (optional, for logging/blacklisting)
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Logout error:", error);
      }
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  /**
   * Delete user account
   * Permanently deletes the user account and all associated data
   * @returns {Promise<Object>} Result of deletion
   */
  const deleteAccount = async () => {
    try {
      const response = await api.delete("/auth/delete-account");

      if (response.data.success) {
        // Clear state
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);

        // Clear localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Delete account error:", error);
      }
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete account",
      };
    }
  };

  /**
   * Check if user has required role
   * @param {string|Array<string>} roles - Required role(s)
   * @returns {boolean} True if user has role
   */
  const hasRole = (roles) => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  /**
   * Get current auth token (for internal use only - API interceptor)
   * @returns {string|null} JWT token
   * @private - Should not be used directly in components
   */
  const getToken = () => token;

  /**
   * Validate token and refresh user state
   * Used to verify token is still valid on app load
   */
  const validateToken = async () => {
    if (!token) return false;

    try {
      // Call a protected endpoint to verify token
      const response = await api.get("/auth/me");
      if (response.data.success) {
        // Extract user from nested structure (backend returns data.user)
        const updatedUser = response.data.data.user || response.data.data;
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      // Token is invalid, clear everything
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return false;
    }
  };

  const value = {
    user,
    // Note: token is intentionally NOT exposed here
    // Components should not access token directly
    // API interceptor will handle token automatically
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    deleteAccount,
    hasRole,
    getToken, // For API interceptor only
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
