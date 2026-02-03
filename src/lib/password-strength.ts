/**
 * Password strength calculation and labels for UI.
 * Used for real-time feedback on the Password Reset and Signup flows.
 */

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  score: number; // 0–4
  label: string;
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const LABELS: Record<PasswordStrengthLevel, string> = {
  empty: '',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

/**
 * Compute password strength from string. Uses length and character variety.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      level: 'empty',
      score: 0,
      label: LABELS.empty,
      minLength: false,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const minLength = password.length >= 8;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  score = Math.min(4, score);

  const level: PasswordStrengthLevel =
    score === 0 ? 'weak' : score === 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong';

  return {
    level,
    score,
    label: LABELS[level],
    minLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Tailwind/design-system color class for strength level (progress bar or text).
 */
export function getStrengthColorClass(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'empty':
      return 'bg-muted-foreground/30';
    case 'weak':
      return 'bg-destructive';
    case 'fair':
      return 'bg-warning';
    case 'good':
      return 'bg-accent';
    case 'strong':
      return 'bg-success';
    default:
      return 'bg-muted-foreground/30';
  }
}
