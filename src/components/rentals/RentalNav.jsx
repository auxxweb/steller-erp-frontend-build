import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import useRentalBasePath, { useCanOperateRentals } from '../../hooks/useRentalBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

function RentalNav() {
  const basePath = useRentalBasePath();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const canWrite = useCanOperateRentals();
  const isDelivery = user?.role === ROLES.DELIVERY_STAFF;

  const tabs = [
    { to: basePath, label: 'Overview', end: true },
    ...(!isDelivery
      ? [
          { to: `${basePath}/calendar`, label: 'Calendar' },
          { to: `${basePath}/active`, label: 'Active' },
        ]
      : []),
    { to: `${basePath}/pickup`, label: 'Prebook pickup' },
    { to: `${basePath}/return`, label: 'Return' },
    ...(canWrite && !isDelivery
      ? [{ to: `${basePath}/new`, label: 'New booking' }]
      : []),
  ];

  return (
    <nav
      className="-mx-stellar-4 flex gap-stellar-1 overflow-x-auto border-b border-stellar-border px-stellar-4 pb-px sm:mx-0 sm:px-0"
      aria-label="Rental sections"
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

export default RentalNav;
