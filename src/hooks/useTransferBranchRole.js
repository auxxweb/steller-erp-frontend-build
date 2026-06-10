import useAuth from './useAuth.js';
import { ROLES } from '../utils/constants.js';

/**
 * Whether the current user's branch is source, destination, or neither on a transfer.
 */
export function useTransferBranchRole(transfer) {
  const { user } = useAuth();
  const branchId = user?.branch;
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  if (!transfer) {
    return { isSource: false, isDestination: false, role: null, isSuperAdmin };
  }

  const fromId = transfer.fromBranch?.id || transfer.fromBranch;
  const toId = transfer.toBranch?.id || transfer.toBranch;
  const isSource = Boolean(branchId && fromId && fromId === branchId);
  const isDestination = Boolean(branchId && toId && toId === branchId);

  let role = 'other';
  if (isSuperAdmin) role = 'admin';
  else if (isSource) role = 'source';
  else if (isDestination) role = 'destination';

  return { isSource, isDestination, role, isSuperAdmin };
}

export default useTransferBranchRole;
