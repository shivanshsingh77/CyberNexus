import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
} from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth rate limiting to registration and login to prevent brute force
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
