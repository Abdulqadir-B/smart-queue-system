/**
 * Authentication Controller
 * Handles user registration, login, and logout
 */

const { User, QueueToken, Token } = require("../models");

/**
 * Register a new user
 * POST /api/auth/register
 * Public route - anyone can register (defaults to 'user' role)
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields (backup validation)
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    // Validate password strength (backup validation - validators should catch this)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Additional password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      username,
      email,
      password,
      role: "user", // Default role for public registration
    });

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user profile (without password)
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: user.getProfile(),
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Public route
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password field (normally excluded)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login timestamp
    await user.updateLoginTimestamp();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.getProfile(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Protected route - requires authentication
 */
const getMe = async (req, res) => {
  try {
    // req.user is attached by auth middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user.getProfile(),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Protected route - requires authentication
 * Note: With JWT, logout is primarily client-side (remove token from storage)
 * This endpoint is provided for consistency and future token blacklisting
 */
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you could:
    // 1. Add token to blacklist in database/redis
    // 2. Track active sessions
    // For now, just send success response
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/**
 * Delete user account
 * DELETE /api/auth/delete-account
 * Protected route - requires authentication
 * Permanently deletes the user account and all associated data
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user's tokens first
    await Token.deleteMany({ user: userId });

    // Delete queue tokens associated with the user
    await QueueToken.deleteMany({ user: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  deleteAccount,
};
