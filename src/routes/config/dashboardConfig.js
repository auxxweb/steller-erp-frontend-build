import { ROLES } from '../../utils/constants.js';
import { ROLE_BASE_PATHS } from './routeConfig.js';

/** Quick actions per role (paths relative to role base). */
export const getDashboardQuickActions = (role) => {
  const base = ROLE_BASE_PATHS[role];
  if (!base) return [];

  const actions = {
    [ROLES.SUPER_ADMIN]: [
      { label: 'New booking', to: `${base}/rentals/new`, description: 'Create a rental reservation', accent: true },
      { label: 'Leave requests', to: `${base}/leaves`, description: 'Approve employee leave' },
      { label: 'Reports', to: `${base}/reports`, description: 'Rental jobs and sales reports' },
      { label: 'Invoices', to: `${base}/invoices`, description: 'View and close invoices' },
      { label: 'Users', to: `${base}/users`, description: 'Manage staff accounts' },
      { label: 'Branches', to: `${base}/branches`, description: 'Branch locations and settings' },
      { label: 'Transfers', to: `${base}/transfers`, description: 'Inter-branch stock movement' },
    ],
    [ROLES.BRANCH_ADMIN]: [
      { label: 'New booking', to: `${base}/rentals/new`, description: 'Create a rental reservation', accent: true },
      { label: 'Reports', to: `${base}/reports`, description: 'Branch rental and sales reports' },
      { label: 'Active rentals', to: `${base}/rentals/active`, description: 'Jobs out on rent now' },
      { label: 'Invoices', to: `${base}/invoices`, description: 'Billing and close job' },
      { label: 'Customers', to: `${base}/customers`, description: 'Customer directory' },
      { label: 'Leave requests', to: `${base}/leaves`, description: 'Approve employee leave' },
      { label: 'Attendance & leave', to: `${base}/attendance`, description: 'Your attendance; leave needs super admin' },
    ],
    [ROLES.EMPLOYEE]: [
      { label: 'New job', to: `${base}/rentals/new`, description: 'Create a rental booking', accent: true },
      { label: 'My jobs', to: `${base}/rentals`, description: 'Jobs you created or handled' },
      { label: 'Active jobs', to: `${base}/rentals/active`, description: 'Your active rentals' },
      { label: 'Pickup', to: `${base}/rentals/pickup`, description: 'Mark prebook pickup' },
      { label: 'Return', to: `${base}/rentals/return`, description: 'Mark gear returned' },
      { label: 'My invoices', to: `${base}/invoices`, description: 'Invoices you generated' },
      { label: 'Attendance', to: `${base}/attendance`, description: 'View attendance and apply leave' },
    ],
    [ROLES.DELIVERY_STAFF]: [
      { label: 'Prebook pickup', to: `${base}/rentals/pickup`, description: 'Hand over reserved gear', accent: true },
      { label: 'Return', to: `${base}/rentals/return`, description: 'Check in returns', accent: true },
      { label: 'Transfer tracking', to: `${base}/transfers/tracking`, description: 'Shipments in progress' },
      { label: 'Dispatch scan', to: `${base}/transfers/dispatch`, description: 'Scan outgoing units' },
      { label: 'Delivery scan', to: `${base}/transfers/delivery`, description: 'Confirm received units' },
      { label: 'QR scan', to: `${base}/scan`, description: 'Quick unit lookup' },
    ],
  };

  return actions[role] || [];
};

export const DASHBOARD_TAB_LABELS = {
  overview: 'Overview',
  activity: 'Activity',
};

/** Workspace metadata per role */
export const DASHBOARD_WORKSPACES = {
  [ROLES.SUPER_ADMIN]: {
    id: ROLES.SUPER_ADMIN,
    title: 'Super Admin',
    subtitle: 'System control',
    basePath: ROLE_BASE_PATHS[ROLES.SUPER_ADMIN],
  },
  [ROLES.BRANCH_ADMIN]: {
    id: ROLES.BRANCH_ADMIN,
    title: 'Branch Admin',
    subtitle: 'Branch operations',
    basePath: ROLE_BASE_PATHS[ROLES.BRANCH_ADMIN],
  },
  [ROLES.EMPLOYEE]: {
    id: ROLES.EMPLOYEE,
    title: 'Employee',
    subtitle: 'Daily operations',
    basePath: ROLE_BASE_PATHS[ROLES.EMPLOYEE],
  },
  [ROLES.DELIVERY_STAFF]: {
    id: ROLES.DELIVERY_STAFF,
    title: 'Delivery',
    subtitle: 'Field logistics',
    basePath: ROLE_BASE_PATHS[ROLES.DELIVERY_STAFF],
  },
};

/** Breadcrumb labels for path segments */
export const BREADCRUMB_LABELS = {
  dashboard: 'Dashboard',
  users: 'Users',
  branches: 'Branches',
  categories: 'Categories',
  customers: 'Customers',
  combos: 'Combos',
  products: 'Products',
  risk: 'Risk analysis',
  units: 'Units',
  availability: 'Availability',
  scan: 'QR Scan',
  new: 'New',
  edit: 'Edit',
  settings: 'Settings',
  team: 'Team',
  inventory: 'Inventory',
  transfers: 'Transfers',
  requests: 'Transfer requests',
  pending: 'Pending transfers',
  tracking: 'Transfer tracking',
  dispatch: 'Dispatch scan',
  delivery: 'Delivery scan',
  incoming: 'Incoming',
  outgoing: 'Outgoing',
  list: 'All transfers',
  rentals: 'Rentals',
  calendar: 'Calendar',
  active: 'Active rentals',
  pickup: 'Pickup',
  return: 'Return',
  equipment: 'Equipment',
  attendance: 'Attendance',
  leaves: 'Leave requests',
  assignments: 'Assignments',
  routes: 'Routes',
  profile: 'My Profile',
  notifications: 'Notifications',
  reports: 'Reports',
  'rental-jobs': 'Rental jobs',
  sales: 'Sales',
};
