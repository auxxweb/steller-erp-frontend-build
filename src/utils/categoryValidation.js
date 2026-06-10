import { CATEGORY_STATUS } from './categoryConstants.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /^(https?:\/\/|\/)[^\s]+$/i;

export const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);

export const validateCategoryForm = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Category name is required';
  }

  const slug = (values.slug?.trim() || slugify(values.name)).toLowerCase();
  if (values.slug?.trim() && !SLUG_REGEX.test(slug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only';
  }

  if (values.description && values.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  if (values.image?.trim() && !URL_REGEX.test(values.image.trim())) {
    errors.image = 'Enter a valid image URL or path';
  }

  if (values.status && !Object.values(CATEGORY_STATUS).includes(values.status)) {
    errors.status = 'Invalid status';
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
