const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "123456789",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "123123",
  "letmein",
  "welcome",
  "iloveyou",
  "admin",
]);

export const MIN_PASSWORD_LENGTH = 6;

export type PasswordChecks = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  notCommon: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  const normalized = password.trim();

  return {
    hasMinLength: normalized.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(normalized),
    hasLowercase: /[a-z]/.test(normalized),
    hasNumber: /\d/.test(normalized),
    hasSymbol: /[^A-Za-z0-9]/.test(normalized),
    notCommon: normalized.length > 0 && !COMMON_PASSWORDS.has(normalized.toLowerCase()),
  };
}

export function validatePassword(password: string): string[] {
  const checks = getPasswordChecks(password);
  const issues: string[] = [];

  if (!checks.hasMinLength) {
    issues.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (!checks.hasUppercase) {
    issues.push("Password must include at least one uppercase letter.");
  }
  if (!checks.hasLowercase) {
    issues.push("Password must include at least one lowercase letter.");
  }
  if (!checks.hasNumber) {
    issues.push("Password must include at least one digit.");
  }
  if (!checks.hasSymbol) {
    issues.push("Password must include at least one special character.");
  }
  if (!checks.notCommon) {
    issues.push("Password is too common and easily guessable.");
  }

  return issues;
}

export function passwordStrengthScore(password: string): number {
  const checks = getPasswordChecks(password);
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  return Math.round((passedChecks / totalChecks) * 100);
}
