import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import NavIcon from './icons/NavIcon.jsx';
import SidebarBrand from './SidebarBrand.jsx';
import { cn } from '../../utils/cn.js';

const linkClass = ({ isActive }) =>
  cn(
    'flex min-h-[3rem] items-center gap-stellar-3 rounded-stellar-lg px-stellar-4 py-stellar-3 text-base font-medium transition-stellar',
    isActive
      ? 'bg-stellar-accent text-stellar-accent-fg shadow-stellar'
      : 'text-stellar-text-muted hover:bg-stellar-surface-muted hover:text-stellar-text'
  );

function MobileDrawer({ navItems, workspace, homePath, open, onClose, scanPath }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-stellar-ink/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] max-w-full flex-col border-r border-stellar-border bg-stellar-bg-elevated shadow-stellar-elevated transition-transform duration-300 ease-[var(--ease-out-expo)] lg:hidden',
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-end px-stellar-2 pt-stellar-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-icon btn-ghost flex h-11 w-11 items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SidebarBrand
          collapsed={false}
          homePath={homePath}
          workspaceLabel={workspace.title}
        />

        <nav className="flex flex-1 flex-col gap-stellar-1 overflow-y-auto p-stellar-3">
          {scanPath ? (
            <NavLink
              to={scanPath}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[3rem] items-center gap-stellar-3 rounded-stellar-lg px-stellar-4 py-stellar-3 text-base font-semibold shadow-stellar transition-stellar',
                  isActive
                    ? 'bg-stellar-accent text-stellar-accent-fg ring-1 ring-stellar-border/40'
                    : 'bg-stellar-accent text-stellar-accent-fg hover:brightness-110',
                )
              }
              onClick={onClose}
            >
              <NavIcon name="scan" />
              QR Scan
            </NavLink>
          ) : null}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={onClose}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default MobileDrawer;
