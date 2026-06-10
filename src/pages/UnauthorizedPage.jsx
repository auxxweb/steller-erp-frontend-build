import { Link, useLocation, Navigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import { getRoleDashboardPath } from '../utils/roleRedirect.js';
import { ROLE_LABELS } from '../utils/constants.js';

function UnauthorizedPage() {
  const location = useLocation();
  const { isAuthenticated, user, isHydrated } = useAuth();

  const requiredRoles = location.state?.requiredRoles || [];
  const userRole = location.state?.userRole || user?.role;
  const fromPath = location.state?.from;

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const dashboardPath = user?.role ? getRoleDashboardPath(user.role) : '/';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-stellar-4 text-center animate-fade-up opacity-0-start">
      <p className="text-7xl font-bold text-stellar-text-subtle">403</p>
      <h1 className="mt-stellar-4 text-2xl font-semibold tracking-tight text-stellar-text">
        Access denied
      </h1>
      <p className="mt-stellar-3 max-w-md text-sm text-stellar-text-muted leading-relaxed">
        You don&apos;t have permission to view this page.
        {userRole && (
          <>
            {' '}
            Signed in as <strong>{ROLE_LABELS[userRole] || userRole}</strong>.
          </>
        )}
      </p>

      {requiredRoles.length > 0 && (
        <p className="mt-stellar-2 text-xs text-stellar-text-subtle">
          Required role:{' '}
          {requiredRoles.map((r) => ROLE_LABELS[r] || r).join(', ')}
        </p>
      )}

      {fromPath && (
        <p className="mt-stellar-1 text-xs text-stellar-text-subtle">
          Attempted: <code className="text-stellar-text-muted">{fromPath}</code>
        </p>
      )}

      <div className="mt-stellar-8 flex flex-wrap justify-center gap-stellar-3">
        <Link to={dashboardPath}>
          <Button variant="primary">Go to my dashboard</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
