/**
 * Format a date for display.
 */
export const formatDate = (value, options = {}) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
};

/**
 * Capitalize first letter of each word.
 */
export const titleCase = (str = '') =>
  str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatCurrency = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};
