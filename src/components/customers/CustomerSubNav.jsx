import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

const TABS = [
  { suffix: '', label: 'Profile' },
  { suffix: '/risk', label: 'Risk analysis' },
  { suffix: '/rentals', label: 'Rental history' },
];

function CustomerSubNav({ basePath, customerId }) {
  const { pathname } = useLocation();
  const root = `${basePath}/${customerId}`;

  return (
    <nav
      className="-mx-stellar-4 flex gap-stellar-1 overflow-x-auto border-b border-stellar-border px-stellar-4 pb-px sm:mx-0 sm:px-0"
      aria-label="Customer sections"
    >
      {TABS.map((tab) => {
        const to = `${root}${tab.suffix}`;
        const isActive =
          tab.suffix === ''
            ? pathname === root || pathname === `${root}/`
            : pathname.startsWith(to);

        return (
          <Link
            key={tab.suffix}
            to={to}
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

export default CustomerSubNav;
