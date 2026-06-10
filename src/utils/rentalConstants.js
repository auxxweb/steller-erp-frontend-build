export const RENTAL_TYPE = {
  PREBOOK: 'prebook',
  DIRECT: 'direct',
};

export const RENTAL_TYPE_OPTIONS = [
  {
    value: RENTAL_TYPE.PREBOOK,
    label: 'Prebook',
    description:
      'Reserve from the company-wide pool. Branch on each serial shows where it is stored; assign at pickup.',
  },
  {
    value: RENTAL_TYPE.DIRECT,
    label: 'Direct rental',
    description: 'Customer takes gear now — select serials and the rental goes active immediately.',
  },
];

export const RENTAL_STATUS = {
  DRAFT: 'draft',
  RESERVED: 'reserved',
  CONFIRMED: 'confirmed',
  PICKED_UP: 'picked_up',
  ACTIVE: 'active',
  OVERDUE: 'overdue',
  PARTIALLY_RETURNED: 'partially_returned',
  RETURNED: 'returned',
  MAINTENANCE: 'maintenance',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
};

export const ACTIVE_RENTAL_STATUSES = [
  RENTAL_STATUS.RESERVED,
  RENTAL_STATUS.CONFIRMED,
  RENTAL_STATUS.PICKED_UP,
  RENTAL_STATUS.ACTIVE,
  RENTAL_STATUS.OVERDUE,
  RENTAL_STATUS.MAINTENANCE,
  RENTAL_STATUS.PARTIALLY_RETURNED,
];

export const PICKUP_STATUSES = [RENTAL_STATUS.RESERVED, RENTAL_STATUS.CONFIRMED];

export const RETURN_STATUSES = [
  RENTAL_STATUS.PICKED_UP,
  RENTAL_STATUS.ACTIVE,
  RENTAL_STATUS.OVERDUE,
  RENTAL_STATUS.MAINTENANCE,
  RENTAL_STATUS.PARTIALLY_RETURNED,
];

export const RENTAL_STATUS_META = {
  [RENTAL_STATUS.DRAFT]: {
    label: 'Draft',
    className: 'bg-stellar-surface-muted text-stellar-text-muted',
  },
  [RENTAL_STATUS.RESERVED]: {
    label: 'Reserved',
    className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  },
  [RENTAL_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  },
  [RENTAL_STATUS.PICKED_UP]: {
    label: 'Picked up',
    className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  },
  [RENTAL_STATUS.ACTIVE]: {
    label: 'Active',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  [RENTAL_STATUS.OVERDUE]: {
    label: 'Overdue',
    className: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
  [RENTAL_STATUS.PARTIALLY_RETURNED]: {
    label: 'Partial return',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  [RENTAL_STATUS.RETURNED]: {
    label: 'Returned',
    className: 'bg-stellar-surface-muted text-stellar-text-muted',
  },
  [RENTAL_STATUS.MAINTENANCE]: {
    label: 'Maintenance',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  [RENTAL_STATUS.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-stellar-surface-muted text-stellar-text-muted line-through',
  },
  [RENTAL_STATUS.CLOSED]: {
    label: 'Closed',
    className: 'bg-stellar-surface-muted text-stellar-text-muted',
  },
};

export const RATE_TYPE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'flat', label: 'Flat' },
];

export const toDatetimeLocalValue = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromDatetimeLocalValue = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const defaultBookingWindow = () => {
  const start = new Date();
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    scheduledStartAt: toDatetimeLocalValue(start),
    scheduledEndAt: toDatetimeLocalValue(end),
  };
};

export const directRentalPickupNow = () => toDatetimeLocalValue(new Date());
