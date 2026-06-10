import { useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants.js';
import useAuth from './useAuth.js';

export function useTransferBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/delivery')) return '/delivery/transfers';
  if (pathname.startsWith('/employee')) return '/employee/transfers';
  if (pathname.startsWith('/branch')) return '/branch/transfers';
  return '/admin/transfers';
}

export function useCanManageTransfers() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN, ROLES.EMPLOYEE].includes(user?.role);
}

export function useCanApproveTransfers() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN].includes(user?.role);
}

export default useTransferBasePath;
