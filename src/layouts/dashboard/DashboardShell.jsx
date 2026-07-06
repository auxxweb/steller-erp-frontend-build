import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar.jsx';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar.jsx';
import MobileDrawer from '../../components/dashboard/MobileDrawer.jsx';
import PageLoadingFallback from '../../components/ui/PageLoadingFallback.jsx';
import useAuth from '../../hooks/useAuth.js';
import useUiStore from '../../store/uiStore.js';
import { ROLE_NAV_ITEMS } from '../../routes/config/routeConfig.js';
import { DASHBOARD_WORKSPACES } from '../../routes/config/dashboardConfig.js';

/**
 * Shared premium dashboard shell — used by all role layouts.
 */
function DashboardShell({ role }) {
  const { user } = useAuth();
  const location = useLocation();
  const workspace = DASHBOARD_WORKSPACES[role];
  const navItems = ROLE_NAV_ITEMS[role] || [];

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileDrawerOpen = useUiStore((s) => s.mobileDrawerOpen);
  const closeMobileDrawer = useUiStore((s) => s.closeMobileDrawer);

  const basePath = workspace?.basePath || '';
  const profilePath = `${basePath}/settings`;
  const homePath = `${basePath}/dashboard`;
  const scanPath = null;

  useEffect(() => {
    closeMobileDrawer();
  }, [location.pathname, closeMobileDrawer]);

  if (!workspace) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-stellar-8">
        <p className="text-stellar-text-muted">Unknown workspace role.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-app flex h-[100dvh] min-h-0 w-full overflow-hidden bg-stellar-bg">
      <Sidebar
        navItems={navItems}
        workspace={workspace}
        homePath={homePath}
        collapsed={sidebarCollapsed}
        scanPath={scanPath}
      />

      <MobileDrawer
        navItems={navItems}
        workspace={workspace}
        homePath={homePath}
        open={mobileDrawerOpen}
        onClose={closeMobileDrawer}
        scanPath={scanPath}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardNavbar workspace={workspace} profilePath={profilePath} />

        <main className="dashboard-content scrollbar-stellar flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="dashboard-content-inner mx-auto w-full max-w-dashboard p-stellar-4 safe-area-bottom sm:p-stellar-6 lg:p-stellar-8">
            <Suspense fallback={<PageLoadingFallback />}>
              <Outlet context={{ role, workspace, user }} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
