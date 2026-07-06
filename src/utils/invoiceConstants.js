export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
  VOID: 'void',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LABELS = {
  draft: 'Draft',
  issued: 'Issued',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
  cancelled: 'Cancelled',
};

export const INVOICE_PAYMENT_TYPE = {
  CASH: 'cash',
  ONLINE: 'online',
  SPLIT: 'split',
};

export const INVOICE_PAYMENT_LABELS = {
  cash: 'Cash',
  online: 'Online',
  split: 'Cash + Online',
};

export const INVOICE_PAYMENT_OPTIONS = Object.values(INVOICE_PAYMENT_TYPE).map((value) => ({
  value,
  label: INVOICE_PAYMENT_LABELS[value],
}));

export { DATE_PERIOD_OPTIONS as INVOICE_PERIOD_OPTIONS } from './listConstants.js';
