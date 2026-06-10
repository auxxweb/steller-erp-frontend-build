/** Mirrors backend/utils/password.js rules for admin-created accounts */
export const PASSWORD_HINT =
  'At least 8 characters with uppercase, lowercase, and a number.';

export const validatePasswordStrength = (password = '') => {
  const errors = [];
  const value = String(password);

  if (value.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (value.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  if (!/[a-z]/.test(value)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[A-Z]/.test(value)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(value)) {
    errors.push('Password must contain a number');
  }

  return errors;
};
