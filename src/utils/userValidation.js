import { ROLES } from './constants.js';
import { validatePasswordStrength } from './passwordValidation.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const ROLES_REQUIRING_BRANCH = [ROLES.BRANCH_ADMIN, ROLES.EMPLOYEE];

export const validateRegisterUserForm = (values) => {
  const errors = [];

  if (!values.name?.trim()) errors.push('Name is required');
  if (!values.email?.trim() || !EMAIL_REGEX.test(values.email.trim())) {
    errors.push('Valid email is required');
  }

  errors.push(...validatePasswordStrength(values.password));

  if (values.role && ROLES_REQUIRING_BRANCH.includes(values.role) && !values.branch) {
    errors.push('Branch is required for this role');
  }

  return errors;
};

/** Normalize axios / Error messages for display (e.g. toasts). */
export const getApiErrorMessage = (err, fallback = 'Request failed') => {
  if (!err) return fallback;
  const msg = err.message || '';
  if (/timeout exceeded|ECONNABORTED/i.test(msg)) {
    return 'Request timed out — check your connection or try a smaller file';
  }
  const data = err.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.join('. ');
  }
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
};

export const formatApiError = (err, fallback = 'Request failed') =>
  getApiErrorMessage(err, fallback);
