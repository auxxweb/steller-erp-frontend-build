import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Spinner from '../../components/ui/Spinner.jsx';

/**
 * Route guard — requires authenticated session with valid tokens.
 */
function ProtectedRoute() {
  const { isAuthenticated, isHydrated, sessionExpired } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stellar-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || sessionExpired) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: location,
          expired: sessionExpired,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
