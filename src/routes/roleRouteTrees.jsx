import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleRoute from './guards/RoleRoute.jsx';
import SuperAdminLayout from '../layouts/dashboard/SuperAdminLayout.jsx';
import BranchAdminLayout from '../layouts/dashboard/BranchAdminLayout.jsx';
import EmployeeLayout from '../layouts/dashboard/EmployeeLayout.jsx';
import { ROLES } from '../utils/constants.js';

const WorkspaceDashboard = lazy(() => import('../pages/dashboard/WorkspaceDashboard.jsx'));
const BranchListPage = lazy(() => import('../pages/branches/BranchListPage.jsx'));
const BranchFormPage = lazy(() => import('../pages/branches/BranchFormPage.jsx'));
const BranchDetailPage = lazy(() => import('../pages/branches/BranchDetailPage.jsx'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'));
const QrCodesAdminPage = lazy(() => import('../pages/admin/QrCodesAdminPage.jsx'));
const CategoryListPage = lazy(() => import('../pages/categories/CategoryListPage.jsx'));
const CategoryFormPage = lazy(() => import('../pages/categories/CategoryFormPage.jsx'));
const ProductListPage = lazy(() => import('../pages/products/ProductListPage.jsx'));
const ProductFormPage = lazy(() => import('../pages/products/ProductFormPage.jsx'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage.jsx'));
const ProductAvailabilityPage = lazy(() => import('../pages/products/ProductAvailabilityPage.jsx'));
const ProductUnitsPage = lazy(() => import('../pages/products/ProductUnitsPage.jsx'));
const ProductInventoryPage = lazy(() => import('../pages/products/ProductInventoryPage.jsx'));
const QrScanPage = lazy(() => import('../pages/qr/QrScanPage.jsx'));
const CustomerListPage = lazy(() => import('../pages/customers/CustomerListPage.jsx'));
const CustomerFormPage = lazy(() => import('../pages/customers/CustomerFormPage.jsx'));
const CustomerProfilePage = lazy(() => import('../pages/customers/CustomerProfilePage.jsx'));
const CustomerRiskPage = lazy(() => import('../pages/customers/CustomerRiskPage.jsx'));
const CustomerRentalsPage = lazy(() => import('../pages/customers/CustomerRentalsPage.jsx'));
const RentalHubPage = lazy(() => import('../pages/rentals/RentalHubPage.jsx'));
const RentalCreatePage = lazy(() => import('../pages/rentals/RentalCreatePage.jsx'));
const RentalCalendarPage = lazy(() => import('../pages/rentals/RentalCalendarPage.jsx'));
const RentalActivePage = lazy(() => import('../pages/rentals/RentalActivePage.jsx'));
const RentalPickupPage = lazy(() => import('../pages/rentals/RentalPickupPage.jsx'));
const RentalReturnPage = lazy(() => import('../pages/rentals/RentalReturnPage.jsx'));
const RentalDetailPage = lazy(() => import('../pages/rentals/RentalDetailPage.jsx'));
const ComboListPage = lazy(() => import('../pages/combos/ComboListPage.jsx'));
const ComboFormPage = lazy(() => import('../pages/combos/ComboFormPage.jsx'));
const ComboDetailPage = lazy(() => import('../pages/combos/ComboDetailPage.jsx'));
const InvoiceListPage = lazy(() => import('../pages/invoices/InvoiceListPage.jsx'));
const InvoiceDetailPage = lazy(() => import('../pages/invoices/InvoiceDetailPage.jsx'));
const RentalJobReportPage = lazy(() => import('../pages/reports/RentalJobReportPage.jsx'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage.jsx'));
const BranchTeamPage = lazy(() => import('../pages/team/BranchTeamPage.jsx'));
const EmployeeAttendancePage = lazy(() => import('../pages/attendance/EmployeeAttendancePage.jsx'));
const LeaveApprovalsPage = lazy(() => import('../pages/attendance/LeaveApprovalsPage.jsx'));

const dashboardElement = (role, title) => <WorkspaceDashboard title={title} />;

/** Super Admin protected routes */
export const superAdminRoutes = (
  <Route
    path="/admin"
    element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}
  >
    <Route element={<SuperAdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route
        path="dashboard"
        element={dashboardElement(ROLES.SUPER_ADMIN, 'Super Admin Dashboard')}
      />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="shifts" element={<Navigate to="/admin/users" replace />} />
      <Route path="branches" element={<BranchListPage />} />
      <Route path="branches/new" element={<BranchFormPage />} />
      <Route path="branches/:id" element={<BranchDetailPage />} />
      <Route path="branches/:id/edit" element={<BranchFormPage />} />
      <Route path="products" element={<ProductListPage />} />
      <Route path="qr-codes" element={<QrCodesAdminPage />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id" element={<ProductDetailPage />} />
      <Route path="products/:id/edit" element={<ProductFormPage />} />
      <Route path="products/:id/units" element={<ProductUnitsPage />} />
      <Route path="products/:id/inventory" element={<ProductInventoryPage />} />
      <Route path="products/:id/availability" element={<ProductAvailabilityPage />} />
      <Route path="inventory" element={<Navigate to="/admin/products" replace />} />
      <Route path="leaves" element={<LeaveApprovalsPage title="Leave requests" />} />
      <Route path="scan" element={<QrScanPage />} />
      <Route path="categories" element={<CategoryListPage />} />
      <Route path="categories/new" element={<CategoryFormPage />} />
      <Route path="categories/:id/edit" element={<CategoryFormPage />} />
      <Route path="customers" element={<CustomerListPage />} />
      <Route path="customers/new" element={<CustomerFormPage />} />
      <Route path="customers/:id" element={<CustomerProfilePage />} />
      <Route path="customers/:id/edit" element={<CustomerFormPage />} />
      <Route path="customers/:id/risk" element={<CustomerRiskPage />} />
      <Route path="customers/:id/rentals" element={<CustomerRentalsPage />} />
      <Route path="combos" element={<ComboListPage />} />
      <Route path="combos/new" element={<ComboFormPage />} />
      <Route path="combos/:id" element={<ComboDetailPage />} />
      <Route path="combos/:id/edit" element={<ComboFormPage />} />
      <Route path="rentals" element={<RentalHubPage />} />
      <Route path="rentals/new" element={<RentalCreatePage />} />
      <Route path="rentals/calendar" element={<RentalCalendarPage />} />
      <Route path="rentals/active" element={<RentalActivePage />} />
      <Route path="rentals/pickup" element={<RentalPickupPage />} />
      <Route path="rentals/return" element={<RentalReturnPage />} />
      <Route path="rentals/:id" element={<RentalDetailPage />} />
      <Route path="invoices" element={<InvoiceListPage />} />
      <Route path="invoices/:id" element={<InvoiceDetailPage />} />
      <Route path="reports" element={<Navigate to="rental-jobs" replace />} />
      <Route path="reports/rental-jobs" element={<RentalJobReportPage />} />
      <Route path="reports/sales" element={<Navigate to="../rental-jobs" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="profile" element={<Navigate to="/admin/settings" replace />} />
    </Route>
  </Route>
);

/** Branch Admin protected routes */
export const branchAdminRoutes = (
  <Route
    path="/branch"
    element={<RoleRoute allowedRoles={[ROLES.BRANCH_ADMIN]} />}
  >
    <Route element={<BranchAdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={dashboardElement(ROLES.BRANCH_ADMIN, 'Branch dashboard')} />
      <Route path="rentals" element={<RentalHubPage />} />
      <Route path="rentals/new" element={<RentalCreatePage />} />
      <Route path="rentals/calendar" element={<RentalCalendarPage />} />
      <Route path="rentals/active" element={<RentalActivePage />} />
      <Route path="rentals/pickup" element={<RentalPickupPage />} />
      <Route path="rentals/return" element={<RentalReturnPage />} />
      <Route path="rentals/:id" element={<RentalDetailPage />} />
      <Route path="team" element={<BranchTeamPage />} />
      <Route path="products" element={<ProductListPage />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id" element={<ProductDetailPage />} />
      <Route path="products/:id/edit" element={<ProductFormPage />} />
      <Route path="products/:id/units" element={<ProductUnitsPage />} />
      <Route path="products/:id/inventory" element={<ProductInventoryPage />} />
      <Route path="products/:id/availability" element={<ProductAvailabilityPage />} />
      <Route path="inventory" element={<Navigate to="/branch/products" replace />} />
      <Route path="leaves" element={<LeaveApprovalsPage title="Leave requests" />} />
      <Route path="scan" element={<QrScanPage />} />
      <Route path="categories" element={<CategoryListPage />} />
      <Route path="categories/new" element={<CategoryFormPage />} />
      <Route path="categories/:id/edit" element={<CategoryFormPage />} />
      <Route path="customers" element={<CustomerListPage />} />
      <Route path="customers/new" element={<CustomerFormPage />} />
      <Route path="customers/:id" element={<CustomerProfilePage />} />
      <Route path="customers/:id/edit" element={<CustomerFormPage />} />
      <Route path="customers/:id/risk" element={<CustomerRiskPage />} />
      <Route path="customers/:id/rentals" element={<CustomerRentalsPage />} />
      <Route path="combos" element={<ComboListPage />} />
      <Route path="combos/new" element={<ComboFormPage />} />
      <Route path="combos/:id" element={<ComboDetailPage />} />
      <Route path="combos/:id/edit" element={<ComboFormPage />} />
      <Route path="invoices" element={<InvoiceListPage />} />
      <Route path="invoices/:id" element={<InvoiceDetailPage />} />
      <Route path="reports" element={<Navigate to="rental-jobs" replace />} />
      <Route path="reports/rental-jobs" element={<RentalJobReportPage />} />
      <Route path="reports/sales" element={<Navigate to="../rental-jobs" replace />} />
      <Route path="attendance" element={<EmployeeAttendancePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="profile" element={<Navigate to="/branch/settings" replace />} />
    </Route>
  </Route>
);

/** Employee protected routes */
export const employeeRoutes = (
  <Route path="/employee" element={<RoleRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
    <Route element={<EmployeeLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={dashboardElement(ROLES.EMPLOYEE, 'Employee Dashboard')} />
      <Route path="rentals" element={<RentalHubPage />} />
      <Route path="rentals/new" element={<RentalCreatePage />} />
      <Route path="rentals/calendar" element={<RentalCalendarPage />} />
      <Route path="rentals/active" element={<RentalActivePage />} />
      <Route path="rentals/pickup" element={<RentalPickupPage />} />
      <Route path="rentals/return" element={<RentalReturnPage />} />
      <Route path="rentals/:id" element={<RentalDetailPage />} />
      <Route path="invoices" element={<InvoiceListPage />} />
      <Route path="invoices/:id" element={<InvoiceDetailPage />} />
      <Route path="attendance" element={<EmployeeAttendancePage />} />
      <Route path="products/*" element={<Navigate to="/employee/rentals" replace />} />
      <Route path="customers/*" element={<Navigate to="/employee/rentals" replace />} />
      <Route path="combos/*" element={<Navigate to="/employee/rentals" replace />} />
      <Route path="scan" element={<Navigate to="/employee/rentals" replace />} />
      <Route path="equipment" element={<Navigate to="/employee/rentals" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="profile" element={<Navigate to="/employee/settings" replace />} />
    </Route>
  </Route>
);
