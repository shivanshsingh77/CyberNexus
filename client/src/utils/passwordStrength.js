/**
 * Client-Side Password Strength & Entropy Analyzer
 * 
 * SECURITY NOTE:
 * This logic runs 100% locally in the user's browser.
 * Passwords tested here are NEVER transmitted over the network or saved anywhere.
 */

// Common weak password patterns to detect
const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', 'admin', 'welcome', 'login', 'iloveyou',
  '12345678', '123456789', 'monkey', 'dragon', 'football', 'baseball',
  'shadow', 'master', 'superman', 'trustno1', 'secret', 'pass123'
];

/**
 * Format large seconds into human-readable crack time
 */
export const formatCrackTime = (seconds) => {
  if (seconds <= 0.001) return 'Instant (< 1 millisecond)';
  if (seconds < 1) return 'Less than a second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1000000) return `${(seconds / 31536000).toExponential(1)} years`;
  return 'Centuries (Mathematically Impractical)';
};

/**
 * Calculate password metrics, entropy, score, and crack times
 */
export const evaluatePasswordStrength = (pwd) => {
  if (!pwd || pwd.length === 0) {
    return {
      score: 0,
      label: 'Empty',
      color: '#64748b',
      entropyBits: 0,
      crackTime: 'Instant',
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        special: false,
      },
      suggestions: ['Start typing a password to evaluate its resistance to attacks.'],
      warnings: [],
      poolSize: 0,
    };
  }

  const length = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  // Calculate character pool size
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33;

  // Shannon Entropy: E = L * log2(R)
  const entropyBits = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  // Attack Model: Modern GPU cluster performing ~10 Billion (10^10) offline guesses/sec
  const combinations = poolSize > 0 ? Math.pow(poolSize, length) : 0;
  const guessesPerSecond = 1e10;
  const estimatedSeconds = combinations / (2 * guessesPerSecond); // average time is half the key space

  const warnings = [];
  const suggestions = [];

  // Pattern checks
  const lowerPwd = pwd.toLowerCase();
  for (const pattern of COMMON_PATTERNS) {
    if (lowerPwd.includes(pattern)) {
      warnings.push(`Contains predictable dictionary word/pattern ("${pattern}"). Attackers use automated wordlists.`);
      break;
    }
  }

  // Repeating characters check (e.g. 'aaaaa')
  if (/(.)\1{2,}/.test(pwd)) {
    warnings.push('Contains repeating identical characters (e.g., "aaa"). Reduces attack entropy.');
  }

  // Sequential character check (e.g. '123' or 'abc')
  if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def/i.test(pwd)) {
    warnings.push('Contains sequential numbers or letters which are heavily prioritized by cracking tools.');
  }

  // Actionable suggestions
  if (length < 8) {
    suggestions.push('Minimum length must be at least 8 characters (12-16+ recommended for critical accounts).');
  }
  if (!hasLower) suggestions.push('Include lowercase letters (a-z).');
  if (!hasUpper) suggestions.push('Include uppercase letters (A-Z).');
  if (!hasDigit) suggestions.push('Include numeric digits (0-9).');
  if (!hasSpecial) suggestions.push('Include symbols and special characters (@, $, !, %, *, #, etc.).');

  // Overall Score determination (0 to 5)
  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasDigit && hasSpecial) score += 1;
  if (entropyBits >= 60 && warnings.length === 0) score += 1;

  // Penalty for short passwords regardless of variety
  if (length < 8) score = Math.min(score, 1);
  if (warnings.length > 0) score = Math.max(0, score - 1);

  const STRENGTH_LEVELS = [
    { label: 'Very Weak', color: '#f43f5e' },
    { label: 'Weak', color: '#fb7185' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#38bdf8' },
    { label: 'Strong', color: '#10b981' },
    { label: 'Very Strong', color: '#00f2fe' },
  ];

  const currentLevel = STRENGTH_LEVELS[score] || STRENGTH_LEVELS[0];

  return {
    score,
    label: currentLevel.label,
    color: currentLevel.color,
    entropyBits,
    crackTime: formatCrackTime(estimatedSeconds),
    poolSize,
    checks: {
      length: length >= 8,
      lowercase: hasLower,
      uppercase: hasUpper,
      numbers: hasDigit,
      special: hasSpecial,
    },
    warnings,
    suggestions: suggestions.length > 0 ? suggestions : ['Password meets high-security strength standards.'],
  };
};
