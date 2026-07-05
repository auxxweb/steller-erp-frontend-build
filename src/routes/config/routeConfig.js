import { ROLES } from '../../utils/constants.js';

/** Base path prefix per role */
export const ROLE_BASE_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin',
  [ROLES.BRANCH_ADMIN]: '/branch',
  [ROLES.EMPLOYEE]: '/employee',
};

/** Default landing route segment per role (under base path) */
export const ROLE_DEFAULT_ROUTE = 'dashboard';

/** Role → allowed route prefixes (for guard checks) */
export const ROLE_ROUTE_ACCESS = {
  [ROLES.SUPER_ADMIN]: ['/admin'],
  [ROLES.BRANCH_ADMIN]: ['/branch'],
  [ROLES.EMPLOYEE]: ['/employee'],
};

/** Navigation items per role workspace */
export const ROLE_NAV_ITEMS = {
  [ROLES.SUPER_ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard', end: true, icon: 'dashboard' },
    { to: '/admin/rentals', label: 'Rentals', icon: 'rentals' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/leaves', label: 'Leave requests', icon: 'leaves' },
    { to: '/admin/branches', label: 'Branches', icon: 'branches' },
    { to: '/admin/products', label: 'Products', icon: 'products' },
    { to: '/admin/qr-codes', label: 'QR codes', icon: 'scan' },
    { to: '/admin/categories', label: 'Categories', icon: 'categories' },
    { to: '/admin/customers', label: 'Customers', icon: 'customers' },
    { to: '/admin/combos', label: 'Combos', icon: 'combos' },
    { to: '/admin/invoices', label: 'Bills', icon: 'invoices' },
    { to: '/admin/reports', label: 'Reports', icon: 'reports' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
  ],
  [ROLES.BRANCH_ADMIN]: [
    { to: '/branch/dashboard', label: 'Dashboard', end: true, icon: 'dashboard' },
    { to: '/branch/rentals', label: 'Rentals', icon: 'rentals' },
    { to: '/branch/team', label: 'Team', icon: 'team' },
    { to: '/branch/leaves', label: 'Leave requests', icon: 'leaves' },
    { to: '/branch/products', label: 'Products', icon: 'products' },
    { to: '/branch/categories', label: 'Categories', icon: 'categories' },
    { to: '/branch/customers', label: 'Customers', icon: 'customers' },
    { to: '/branch/combos', label: 'Combos', icon: 'combos' },
    { to: '/branch/invoices', label: 'Bills', icon: 'invoices' },
    { to: '/branch/reports', label: 'Reports', icon: 'reports' },
    { to: '/branch/attendance', label: 'Attendance', icon: 'attendance' },
    { to: '/branch/settings', label: 'Settings', icon: 'settings' },
  ],
  [ROLES.EMPLOYEE]: [
    { to: '/employee/dashboard', label: 'Dashboard', end: true, icon: 'dashboard' },
    { to: '/employee/rentals', label: 'Rentals', icon: 'rentals' },
    { to: '/employee/invoices', label: 'Bills', icon: 'invoices' },
    { to: '/employee/attendance', label: 'Attendance', icon: 'attendance' },
    { to: '/employee/settings', label: 'Settings', icon: 'settings' },
  ],
};

export const PUBLIC_PATHS = ['/', '/auth', '/login', '/reset-password', '/unauthorized'];

export const AUTH_PATHS = ['/auth', '/login', '/reset-password'];
