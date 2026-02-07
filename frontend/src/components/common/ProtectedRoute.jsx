/**
 * Protected Route Component
 * Redirects to login if not authenticated or doesn't have required role
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to unauthorized page if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
