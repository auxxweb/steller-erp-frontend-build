import { useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants.js';
import useAuth from './useAuth.js';

export function useRentalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/delivery')) return '/delivery/rentals';
  if (pathname.startsWith('/employee')) return '/employee/rentals';
  if (pathname.startsWith('/branch')) return '/branch/rentals';
  return '/admin/rentals';
}

export function useCanWriteRentals() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.EMPLOYEE].includes(user?.role);
}

export function useCanOperateRentals() {
  const { user } = useAuth();
  return [
    ROLES.SUPER_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.EMPLOYEE,
    ROLES.DELIVERY_STAFF,
  ].includes(user?.role);
}

export default useRentalBasePath;
