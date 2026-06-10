import { ROLES } from './constants.js';
import { ROLE_BASE_PATHS, ROLE_DEFAULT_ROUTE } from '../routes/config/routeConfig.js';

/** Role-based dashboard paths after login */
export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: `${ROLE_BASE_PATHS[ROLES.SUPER_ADMIN]}/${ROLE_DEFAULT_ROUTE}`,
  [ROLES.BRANCH_ADMIN]: `${ROLE_BASE_PATHS[ROLES.BRANCH_ADMIN]}/${ROLE_DEFAULT_ROUTE}`,
  [ROLES.EMPLOYEE]: `${ROLE_BASE_PATHS[ROLES.EMPLOYEE]}/${ROLE_DEFAULT_ROUTE}`,
  [ROLES.DELIVERY_STAFF]: `${ROLE_BASE_PATHS[ROLES.DELIVERY_STAFF]}/${ROLE_DEFAULT_ROUTE}`,
};

export const getRoleDashboardPath = (role) => {
  return ROLE_DASHBOARD_PATHS[role] || '/dashboard';
};

/**
 * Check if a user role may access a pathname.
 */
export const canAccessPath = (role, pathname) => {
  const prefixes = Object.values(ROLE_BASE_PATHS);
  const isRolePath = prefixes.some((p) => pathname.startsWith(p));

  if (!isRolePath) return true;

  const rolePrefix = ROLE_BASE_PATHS[role];
  return Boolean(rolePrefix && pathname.startsWith(rolePrefix));
};
