import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'cybernexus_super_secure_jwt_token_secret_key_2026_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

/**
 * Configure secure HTTP-Only cookie options
 */
const getCookieOptions = () => ({
  httpOnly: true, // Prevents client-side JS (XSS) from reading the auth token
  secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
  sameSite: 'lax', // CSRF mitigation
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account with hashed password
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    // Create user (password is automatically hashed via pre-save hook)
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    // Set HTTP-Only Cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token, // Also return in body for headless testing/Bearer usage
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, verify password hash, and issue session token
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Query user by email, explicitly including password field which is hidden by default
    const user = await User.findOne({ email }).select('+password');

    // Generic error message prevents account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    // Securely compare password hash using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Set HTTP-Only cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate user session by clearing auth cookie
 * @access  Public
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully. Session invalidated.',
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};
