export const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const TRANSFER_ITEM_STATUS = {
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
};

export const TRANSFER_STATUS_META = {
  [TRANSFER_STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  [TRANSFER_STATUS.APPROVED]: {
    label: 'Approved',
    className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  },
  [TRANSFER_STATUS.IN_TRANSIT]: {
    label: 'In transit',
    className: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  },
  [TRANSFER_STATUS.DELIVERED]: {
    label: 'Delivered',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  [TRANSFER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-stellar-surface-muted text-stellar-text-muted',
  },
};

export const TRANSFER_STATUS_OPTIONS = Object.entries(TRANSFER_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
