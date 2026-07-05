import { Navigate, Route } from 'react-router-dom';
import RoleRoute from './guards/RoleRoute.jsx';
import SuperAdminLayout from '../layouts/dashboard/SuperAdminLayout.jsx';
import BranchAdminLayout from '../layouts/dashboard/BranchAdminLayout.jsx';
import EmployeeLayout from '../layouts/dashboard/EmployeeLayout.jsx';
import WorkspaceDashboard from '../pages/dashboard/WorkspaceDashboard.jsx';
import BranchListPage from '../pages/branches/BranchListPage.jsx';
import BranchFormPage from '../pages/branches/BranchFormPage.jsx';
import BranchDetailPage from '../pages/branches/BranchDetailPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import QrCodesAdminPage from '../pages/admin/QrCodesAdminPage.jsx';
import CategoryListPage from '../pages/categories/CategoryListPage.jsx';
import CategoryFormPage from '../pages/categories/CategoryFormPage.jsx';
import ProductListPage from '../pages/products/ProductListPage.jsx';
import ProductFormPage from '../pages/products/ProductFormPage.jsx';
import ProductDetailPage from '../pages/products/ProductDetailPage.jsx';
import ProductAvailabilityPage from '../pages/products/ProductAvailabilityPage.jsx';
import ProductUnitsPage from '../pages/products/ProductUnitsPage.jsx';
import ProductInventoryPage from '../pages/products/ProductInventoryPage.jsx';
import QrScanPage from '../pages/qr/QrScanPage.jsx';
import CustomerListPage from '../pages/customers/CustomerListPage.jsx';
import CustomerFormPage from '../pages/customers/CustomerFormPage.jsx';
import CustomerProfilePage from '../pages/customers/CustomerProfilePage.jsx';
import CustomerRiskPage from '../pages/customers/CustomerRiskPage.jsx';
import CustomerRentalsPage from '../pages/customers/CustomerRentalsPage.jsx';
import RentalHubPage from '../pages/rentals/RentalHubPage.jsx';
import RentalCreatePage from '../pages/rentals/RentalCreatePage.jsx';
import RentalCalendarPage from '../pages/rentals/RentalCalendarPage.jsx';
import RentalActivePage from '../pages/rentals/RentalActivePage.jsx';
import RentalPickupPage from '../pages/rentals/RentalPickupPage.jsx';
import RentalReturnPage from '../pages/rentals/RentalReturnPage.jsx';
import RentalDetailPage from '../pages/rentals/RentalDetailPage.jsx';
import ComboListPage from '../pages/combos/ComboListPage.jsx';
import ComboFormPage from '../pages/combos/ComboFormPage.jsx';
import ComboDetailPage from '../pages/combos/ComboDetailPage.jsx';
import InvoiceListPage from '../pages/invoices/InvoiceListPage.jsx';
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage.jsx';
import RentalJobReportPage from '../pages/reports/RentalJobReportPage.jsx';
import SettingsPage from '../pages/settings/SettingsPage.jsx';
import BranchTeamPage from '../pages/team/BranchTeamPage.jsx';
import EmployeeAttendancePage from '../pages/attendance/EmployeeAttendancePage.jsx';
import LeaveApprovalsPage from '../pages/attendance/LeaveApprovalsPage.jsx';
import { ROLES } from '../utils/constants.js';

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
