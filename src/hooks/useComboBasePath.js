import { useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants.js';
import useAuth from './useAuth.js';

export function useComboBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/branch')) return '/branch/combos';
  return '/admin/combos';
}

export function useCanManageCombos() {
  const { user } = useAuth();
  return [ROLES.SUPER_ADMIN, ROLES.BRANCH_ADMIN].includes(user?.role);
}

export default useComboBasePath;
