import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Spinner from '../../components/ui/Spinner.jsx';

/**
 * Role guard — restricts child routes to allowed roles.
 */
function RoleRoute({ allowedRoles = [] }) {
  const { user, isHydrated } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          requiredRoles: allowedRoles,
          userRole: user.role,
        }}
      />
    );
  }

  return <Outlet context={{ role: user.role }} />;
}

export default RoleRoute;
