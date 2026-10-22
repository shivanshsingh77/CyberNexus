import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using JWT stored in HTTP-Only cookie or Authorization header.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first (preferred browser method)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fall back to Authorization: Bearer <token> header (API testing & clients without cookies)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cybernexus_super_secure_jwt_token_secret_key_2026_dev'
    );

    // Fetch user without password hash
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid. The user for this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication processing error.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.',
      });
    }
    next();
  };
};
