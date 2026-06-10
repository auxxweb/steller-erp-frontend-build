import { useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants.js';
import useAuth from './useAuth.js';

export function useCustomerBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/employee')) return '/employee/customers';
  if (pathname.startsWith('/branch')) return '/branch/customers';
  return '/admin/customers';
}

export function useIsBranchWorkspace() {
  const { pathname } = useLocation();
  return pathname.startsWith('/branch');
}

export function useCanManageCustomers() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN].includes(user?.role);
}

export default useCustomerBasePath;
