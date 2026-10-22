import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter:
 * Restricts overall API requests to mitigate basic DoS and brute-force scanning.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Strict Authentication Rate Limiter:
 * Mitigates credential stuffing and brute-force password guessing attacks.
 * Limits login and registration attempts to 10 per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. For your security, this IP has been temporarily blocked for 15 minutes.',
  },
});
