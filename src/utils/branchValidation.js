import { BRANCH_STATUS } from './branchConstants.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const CODE_REGEX = /^[A-Z0-9_-]{2,20}$/;

export const validateBranchForm = (values, { isEdit = false } = {}) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Branch name is required';
  }

  if (!values.code?.trim()) {
    errors.code = 'Branch code is required';
  } else if (!CODE_REGEX.test(values.code.trim().toUpperCase())) {
    errors.code = 'Use 2–20 characters: letters, numbers, _ or -';
  }

  if (values.email?.trim() && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (values.phone && values.phone.length > 20) {
    errors.phone = 'Phone must not exceed 20 characters';
  }

  if (!values.address?.line1?.trim()) {
    errors['address.line1'] = 'Address line 1 is required';
  }

  if (values.status && !Object.values(BRANCH_STATUS).includes(values.status)) {
    errors.status = 'Invalid status';
  }

  if (!isEdit && !values.name?.trim() && !values.code?.trim()) {
    return errors;
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
