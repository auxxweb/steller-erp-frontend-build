import ThemeToggle from '../ui/ThemeToggle.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import useUiStore from '../../store/uiStore.js';

function DashboardNavbar({ workspace, basePath, profilePath }) {
  const openMobileDrawer = useUiStore((s) => s.openMobileDrawer);

  return (
    <header className="dashboard-header shrink-0 pt-[env(safe-area-inset-top)]">
      <div className="flex h-full min-h-[var(--header-height)] items-center gap-stellar-2 px-stellar-3 sm:gap-stellar-4 sm:px-stellar-6">
        <button
          type="button"
          onClick={openMobileDrawer}
          className="btn-icon btn-ghost -ml-stellar-1 flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs basePath={basePath} workspaceTitle={workspace.title} />
        </div>

        <div className="flex shrink-0 items-center gap-stellar-1 sm:gap-stellar-2">
          <ThemeToggle />
          <NotificationDropdown />
          <ProfileDropdown profilePath={profilePath} />
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
