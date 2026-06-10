import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { getRoleDashboardPath } from '../utils/roleRedirect.js';
import Spinner from '../components/ui/Spinner.jsx';

function DashboardRedirect() {
  const { user, isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
}

export default DashboardRedirect;
