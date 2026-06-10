import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import useReportBasePath from '../../hooks/useReportBasePath.js';

function ReportsNav() {
  const basePath = useReportBasePath();
  const { pathname } = useLocation();

  const tabs = [
    { to: basePath, label: 'Overview', end: true },
    { to: `${basePath}/rental-jobs`, label: 'Rental jobs' },
    { to: `${basePath}/sales`, label: 'Sales' },
  ];

  return (
    <nav
      className="-mx-stellar-4 flex gap-stellar-1 overflow-x-auto border-b border-stellar-border px-stellar-4 pb-px sm:mx-0 sm:px-0"
      aria-label="Reports"
    >
      {tabs.map((tab) => {
        const isActive = tab.end
          ? pathname === tab.to || pathname === `${tab.to}/`
          : pathname.startsWith(tab.to);

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              'shrink-0 border-b-2 px-stellar-3 py-stellar-2 text-sm font-medium transition-stellar',
              isActive
                ? 'border-stellar-accent text-stellar-text'
                : 'border-transparent text-stellar-text-muted hover:text-stellar-text',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default ReportsNav;
