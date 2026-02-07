/**
 * Login Page
 * User authentication interface
 */

import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import { LoginOutlined } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  // Validation errors for each field
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // Touched fields to show errors only after user interacts
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Check for session expiry message from URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      setSessionExpiredMessage("Your session has expired. Please login again.");
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Validation functions
  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  // Handle field blur to mark as touched
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validation as user types
  React.useEffect(() => {
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setValidationErrors(errors);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Check if there are any validation errors
    if (validationErrors.email || validationErrors.password) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect based on user role
        const { role } = result.user;
        const from = location.state?.from?.pathname;

        if (from) {
          navigate(from, { replace: true });
        } else if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "staff") {
          navigate("/staff", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 8,
        pb: 3,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <LoginOutlined sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />
            <Typography component="h1" variant="h5" fontWeight="bold">
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to your account
            </Typography>
          </Box>

          {sessionExpiredMessage && (
            <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setSessionExpiredMessage("")}>
              {sessionExpiredMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={loading}
              size="small"
              error={touched.email && !!validationErrors.email}
              helperText={touched.email && validationErrors.email}
              InputLabelProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              disabled={loading}
              size="small"
              error={touched.password && !!validationErrors.password}
              helperText={touched.password && validationErrors.password}
              InputLabelProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 1.5, py: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link component={RouterLink} to="/register" underline="hover">
                  Register here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
