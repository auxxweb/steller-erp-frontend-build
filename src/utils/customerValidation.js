import { CUSTOMER_TYPE } from './customerConstants.js';

export const validateCustomerForm = (values, { isEdit = false } = {}) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';
  if (!values.phone?.trim()) errors.phone = 'Phone is required';
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email';
  }
  if (values.customerType === CUSTOMER_TYPE.BUSINESS && !values.company?.trim()) {
    errors.company = 'Company name is required for business customers';
  }
  if (values.gstin && values.gstin.length !== 15) {
    errors.gstin = 'GSTIN must be 15 characters';
  }
  if (values.creditLimit !== '' && values.creditLimit != null) {
    const n = Number(values.creditLimit);
    if (Number.isNaN(n) || n < 0) errors.creditLimit = 'Credit limit must be zero or more';
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
