import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getRoleDashboardPath } from '../../utils/roleRedirect.js';
import Spinner from '../../components/ui/Spinner.jsx';

/**
 * Guest guard — redirects authenticated users away from auth pages.
 */
function GuestRoute() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    const from = location.state?.from?.pathname;
    const isInternal =
      from &&
      from !== '/auth' &&
      from !== '/login' &&
      !from.startsWith('/auth');

    const target = isInternal ? from : getRoleDashboardPath(user.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
