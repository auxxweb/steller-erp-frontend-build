import { useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants.js';
import useAuth from './useAuth.js';

export function useProductBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/employee')) return '/employee/products';
  if (pathname.startsWith('/branch')) return '/branch/products';
  return '/admin/products';
}

export function useInventoryBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/branch')) return '/branch/inventory';
  return '/admin/inventory';
}

export function useIsBranchWorkspace() {
  const { pathname } = useLocation();
  return pathname.startsWith('/branch');
}

export function useCanManageProducts() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN].includes(user?.role);
}

export default useProductBasePath;
