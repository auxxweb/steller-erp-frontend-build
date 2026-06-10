export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Stellar Camera Rentals ERP';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BRANCH_ADMIN: 'branch_admin',
  EMPLOYEE: 'employee',
  DELIVERY_STAFF: 'delivery_staff',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.BRANCH_ADMIN]: 'Branch Admin',
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.DELIVERY_STAFF]: 'Delivery Staff',
};
