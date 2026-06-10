import { PRODUCT_STATUS } from './productConstants.js';

export const validateProductForm = (values, options = {}) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Product name is required';
  if (!values.category) errors.category = 'Category is required';

  if (options.requireBranch && !values.branch) {
    errors.branch = 'Select a branch or common inventory';
  }

  const pricing = values.pricing || {};
  const validateRateGroup = (group, key) => {
    const rates = group || {};
    ['dailyRate', 'weeklyRate', 'monthlyRate'].forEach((rateKey) => {
      const val = rates[rateKey];
      if (val !== '' && val !== undefined && (Number.isNaN(Number(val)) || Number(val) < 0)) {
        errors[`pricing.${key}.${rateKey}`] = 'Must be a non-negative number';
      }
    });
  };
  validateRateGroup(pricing.individual, 'individual');
  validateRateGroup(pricing.combo, 'combo');

  ['depositAmount', 'salePrice'].forEach((key) => {
    const val = pricing[key];
    if (val !== '' && val !== undefined && (Number.isNaN(Number(val)) || Number(val) < 0)) {
      errors[`pricing.${key}`] = 'Must be a non-negative number';
    }
  });

  const adv = values.advancePayment || {};
  if (adv.required) {
    const pct = adv.percentage;
    if (pct === '' || pct === undefined) {
      errors['advancePayment.percentage'] = 'Percentage is required';
    } else if (Number.isNaN(Number(pct)) || Number(pct) < 0 || Number(pct) > 100) {
      errors['advancePayment.percentage'] = 'Must be between 0 and 100';
    }
  }

  if (values.status && !Object.values(PRODUCT_STATUS).includes(values.status)) {
    errors.status = 'Invalid status';
  }

  if (values.serialUnits !== undefined) {
    if (!Array.isArray(values.serialUnits)) {
      errors.serialUnits = 'Serial units must be a list';
    } else {
      const unitErrors = [];
      values.serialUnits.forEach((u, idx) => {
        const e = {};
        if (!u?.serialNumber?.trim()) e.serialNumber = 'Serial number is required';
        if (u?.imageFiles && Array.isArray(u.imageFiles) && u.imageFiles.length > 2) {
          e.images = 'Maximum 2 images allowed';
        }
        if (Object.keys(e).length) unitErrors[idx] = e;
      });
      if (unitErrors.length) errors.serialUnits = unitErrors;
    }
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;

export const validateUnitForm = (values) => {
  const errors = {};
  if (!values.serialNumber?.trim()) errors.serialNumber = 'Serial number is required';
  return errors;
};
