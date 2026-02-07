/**
 * Register Page
 * User registration interface
 */

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import { PersonAddOutlined } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors for each field
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Touched fields to show errors only after user interacts
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Track which field is currently focused
  const [focused, setFocused] = useState({
    password: false,
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/customer", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validation functions
  const validateUsername = (value) => {
    if (!value.trim()) {
      return "Username is required";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must not exceed 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

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
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(value)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&#])/.test(value)) {
      return "Password must contain at least one special character (@$!%*?&#)";
    }
    if (/\s/.test(value)) {
      return "Password cannot contain spaces";
    }
    return "";
  };

  const validateConfirmPassword = (value, passwordValue) => {
    if (!value) {
      return "Please confirm your password";
    }
    if (value !== passwordValue) {
      return "Passwords do not match";
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
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setValidationErrors(errors);
  }, [username, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if there are any validation errors
    if (
      validationErrors.username ||
      validationErrors.email ||
      validationErrors.password ||
      validationErrors.confirmPassword
    ) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, email, password);

      if (result.success) {
        // Redirect to customer view (default role is 'user')
        navigate("/customer", { replace: true });
      } else {
        setError(result.message || "Registration failed");
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
            <PersonAddOutlined sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />
            <Typography component="h1" variant="h5" fontWeight="bold">
              Register
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create a new account
            </Typography>
          </Box>

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
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur("username")}
              disabled={loading}
              size="small"
              error={touched.username && !!validationErrors.username}
              helperText={touched.username && validationErrors.username}
              InputLabelProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
              onBlur={() => {
                handleBlur("password");
                setFocused((prev) => ({ ...prev, password: false }));
              }}
              disabled={loading}
              error={touched.password && !!validationErrors.password}
              helperText={
                touched.password && validationErrors.password
                  ? validationErrors.password
                  : focused.password || (touched.password && !validationErrors.password)
                    ? "Must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&#)"
                    : ""
              }
              size="small"
              InputLabelProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              disabled={loading}
              size="small"
              error={touched.confirmPassword && !!validationErrors.confirmPassword}
              helperText={touched.confirmPassword && validationErrors.confirmPassword}
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
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link component={RouterLink} to="/login" underline="hover">
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
