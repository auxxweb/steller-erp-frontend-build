import { Outlet, Link, NavLink } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Button from '../components/ui/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import { getRoleDashboardPath } from '../utils/roleRedirect.js';
import { cn } from '../utils/cn.js';

const navLinkClass = ({ isActive }) =>
  cn('nav-link', isActive && 'nav-link-active');

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="dashboard-shell flex min-h-screen flex-col">
      <header className="dashboard-header">
        <div className="mx-auto flex h-full max-w-dashboard items-center justify-between px-stellar-4 sm:px-stellar-6 lg:px-stellar-8">
          <Link to="/" className="flex items-center transition-stellar hover:opacity-90">
            <Logo variant="compact" />
          </Link>

          <nav className="flex items-center gap-stellar-2 sm:gap-stellar-4">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            {isAuthenticated && user?.role && (
              <NavLink to={getRoleDashboardPath(user.role)} className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="secondary" size="sm" onClick={logout}>
                Sign out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="primary" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </nav>
        </div>
        {user?.name && <p className="sr-only">Signed in as {user.name}</p>}
      </header>

      <main className="dashboard-main scrollbar-stellar">
        <Outlet />
      </main>

      <footer className="border-t border-stellar-border py-stellar-6 text-center text-xs text-stellar-text-muted">
        © {new Date().getFullYear()} Stellar Camera Rentals
      </footer>
    </div>
  );
}

export default MainLayout;
