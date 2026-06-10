import { NavLink } from 'react-router-dom';
import useTransferBasePath, { useCanManageTransfers } from '../../hooks/useTransferBasePath.js';

const linkClass = ({ isActive }) =>
  `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-stellar ${
    isActive
      ? 'bg-stellar-accent text-stellar-accent-fg'
      : 'text-stellar-text-muted hover:bg-stellar-surface-muted hover:text-stellar-text'
  }`;

function TransferNav() {
  const basePath = useTransferBasePath();
  const canManage = useCanManageTransfers();

  return (
    <nav
      className="flex gap-stellar-2 overflow-x-auto pb-stellar-1 scrollbar-stellar"
      aria-label="Transfer sections"
    >
      <NavLink to={basePath} end className={linkClass}>
        Overview
      </NavLink>
      <NavLink to={`${basePath}/requests`} className={linkClass}>
        Requests
      </NavLink>
      <NavLink to={`${basePath}/pending`} className={linkClass}>
        Pending
      </NavLink>
      <NavLink to={`${basePath}/tracking`} className={linkClass}>
        Tracking
      </NavLink>
      <NavLink to={`${basePath}/dispatch`} className={linkClass}>
        Dispatch
      </NavLink>
      <NavLink to={`${basePath}/delivery`} className={linkClass}>
        Delivery
      </NavLink>
      {canManage && (
        <NavLink to={`${basePath}/new`} className={linkClass}>
          New request
        </NavLink>
      )}
    </nav>
  );
}

export default TransferNav;
