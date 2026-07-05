import { ROLES } from './constants.js';

/** Super admin, branch admin, and sales staff may edit bill amount before first payment. */
export function canEditInvoiceBillAmount(user) {
  if (!user?.role) return false;
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.BRANCH_ADMIN) return true;
  if (user.role === ROLES.EMPLOYEE) {
    return user.employeePosition !== 'branch_manager';
  }
  return false;
}

export function lineItemsSubtotal(lineItems = []) {
  return lineItems.reduce((sum, line) => sum + (Number(line.lineTotal) || 0), 0);
}
