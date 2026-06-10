import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import GuestRoute from './guards/GuestRoute.jsx';
import DashboardRedirect from './DashboardRedirect.jsx';
import ResetPasswordRedirect from './ResetPasswordRedirect.jsx';
import {
  superAdminRoutes,
  branchAdminRoutes,
  employeeRoutes,
  deliveryRoutes,
} from './roleRouteTrees.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="dashboard" element={<DashboardRedirect />} />
      </Route>

      {/* Protected role workspaces */}
      <Route element={<ProtectedRoute />}>
        {superAdminRoutes}
        {branchAdminRoutes}
        {employeeRoutes}
        {deliveryRoutes}
      </Route>

      {/* Auth (guest only) */}
      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="auth" element={<AuthPage />} />
          <Route path="login" element={<Navigate to="/auth" replace />} />
          <Route path="reset-password" element={<ResetPasswordRedirect />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
