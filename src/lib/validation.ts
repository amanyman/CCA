/**
 * Validates password strength. Returns error message or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 10) return 'Password must be at least 10 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include a number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) return 'Password must include a special character';

  // Check for common weak passwords
  const lower = password.toLowerCase();
  const commonPatterns = ['password', '12345678', 'qwerty', 'abcdefgh', 'letmein', 'welcome'];
  for (const pattern of commonPatterns) {
    if (lower.includes(pattern)) return 'Password is too common. Please choose a stronger one.';
  }

  return null;
}

/**
 * Sanitizes a text string by trimming and removing control characters.
 */
export function sanitizeText(input: string): string {
  // Remove control characters (except newlines/tabs for text areas)
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Simple client-side rate limiter. Returns true if the action should be blocked.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return true;
  }

  return false;
}
