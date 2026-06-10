import { NavLink } from 'react-router-dom';
import NavIcon from './icons/NavIcon.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Floating action to open the workspace QR scan page from anywhere in the dashboard shell.
 */
function GlobalScanFab({ to }) {
  if (!to) return null;

  return (
    <NavLink
      to={to}
      title="QR Scan"
      aria-label="Open QR scan"
      className={({ isActive }) =>
        cn(
          'pointer-events-auto fixed bottom-6 right-6 z-[9000] flex h-14 w-14 items-center justify-center rounded-full shadow-stellar-elevated transition-stellar focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stellar-accent sm:bottom-8 sm:right-8 sm:h-16 sm:w-16',
          '[&_svg]:h-7 [&_svg]:w-7 sm:[&_svg]:h-8 sm:[&_svg]:w-8',
          isActive
            ? 'bg-stellar-accent text-stellar-accent-fg ring-2 ring-stellar-border ring-offset-2 ring-offset-stellar-bg'
            : 'bg-stellar-accent text-stellar-accent-fg hover:brightness-110',
        )
      }
    >
      <NavIcon name="scan" />
      <span className="sr-only">Open QR scan</span>
    </NavLink>
  );
}

export default GlobalScanFab;
