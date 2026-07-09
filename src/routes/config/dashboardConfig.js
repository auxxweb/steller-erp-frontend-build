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
      { label: 'Bills', to: `${base}/invoices`, description: 'View and close bills' },
      { label: 'Users', to: `${base}/users`, description: 'Manage staff accounts' },
      { label: 'Branches', to: `${base}/branches`, description: 'Branch locations and settings' },
    ],
    [ROLES.BRANCH_ADMIN]: [
      { label: 'New booking', to: `${base}/rentals/new`, description: 'Create a rental reservation', accent: true },
      { label: 'Reports', to: `${base}/reports`, description: 'Branch rental and sales reports' },
      { label: 'Active rentals', to: `${base}/rentals/active`, description: 'Jobs out on rent now' },
      { label: 'Bills', to: `${base}/invoices`, description: 'Billing and close job' },
      { label: 'Customers', to: `${base}/customers`, description: 'Customer directory' },
      { label: 'Leave requests', to: `${base}/leaves`, description: 'Approve employee leave' },
      { label: 'Attendance & leave', to: `${base}/attendance`, description: 'Your attendance; leave needs super admin' },
    ],
    [ROLES.EMPLOYEE]: [
      { label: 'New job', to: `${base}/rentals/new`, description: 'Create a rental booking', accent: true },
      { label: 'Rentals', to: `${base}/rentals`, description: 'Bookings, pickup, return and billing' },
      { label: 'Bills', to: `${base}/invoices`, description: 'Finalize bills after return' },
      { label: 'Active jobs', to: `${base}/rentals/active`, description: 'Active rentals at your branch' },
      { label: 'Pickup', to: `${base}/rentals/pickup`, description: 'Mark prebook pickup' },
      { label: 'Return', to: `${base}/rentals/return`, description: 'Mark gear returned' },
      { label: 'Attendance', to: `${base}/attendance`, description: 'View attendance and apply leave' },
    ],
  };

  return actions[role] || [];
};

/** KPI cards should open the most relevant workspace page for that metric. */
export const getDashboardKpiLink = (role, kpiId) => {
  const base = ROLE_BASE_PATHS[role];
  if (!base) return null;

  const links = {
    [ROLES.SUPER_ADMIN]: {
      branches: `${base}/branches`,
      users: `${base}/users`,
      activeRentals: `${base}/rentals/active`,
      rentalsMonth: `${base}/rentals`,
      salesMonth: `${base}/invoices`,
      customers: `${base}/customers`,
      products: `${base}/products`,
    },
    [ROLES.BRANCH_ADMIN]: {
      activeRentals: `${base}/rentals/active`,
      rentalsMonth: `${base}/rentals`,
      salesMonth: `${base}/invoices`,
      customers: `${base}/customers`,
      products: `${base}/products`,
      staff: `${base}/team`,
    },
    [ROLES.EMPLOYEE]: {
      activeRentals: `${base}/rentals/active`,
      jobsMonth: `${base}/rentals`,
      invoices: `${base}/invoices`,
      returns: `${base}/rentals/return`,
    },
  };

  return links[role]?.[kpiId] || null;
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
  rentals: 'Rentals',
  calendar: 'Calendar',
  active: 'Active rentals',
  pickup: 'Pickup',
  return: 'Return',
  equipment: 'Equipment',
  attendance: 'Attendance',
  leaves: 'Leave requests',
  profile: 'My Profile',
  notifications: 'Notifications',
  reports: 'Reports',
  'rental-jobs': 'Rental jobs',
  sales: 'Sales',
};
