import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROLE_LABELS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProfileDropdown({ profilePath }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-stellar-2 rounded-full border border-stellar-border py-stellar-1 pl-stellar-1 pr-stellar-3 transition-stellar hover:bg-stellar-surface-muted"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stellar-accent text-xs font-semibold text-stellar-accent-fg">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-stellar-text md:inline">
          {user?.name}
        </span>
        <svg
          className={cn('hidden h-4 w-4 text-stellar-text-muted transition-stellar md:block', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-stellar-2 w-56 origin-top-right rounded-stellar-xl border border-stellar-border bg-stellar-surface py-stellar-1 shadow-stellar-elevated transition-stellar',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
        role="menu"
        aria-hidden={!open}
      >
        <div className="border-b border-stellar-border px-stellar-4 py-stellar-3">
          <p className="truncate text-sm font-semibold text-stellar-text">{user?.name}</p>
          <p className="truncate text-xs text-stellar-text-muted">{user?.email}</p>
          <span className="badge mt-stellar-2">{ROLE_LABELS[user?.role]}</span>
        </div>
        <Link
          to={profilePath}
          onClick={() => setOpen(false)}
          className="block px-stellar-4 py-stellar-2.5 text-sm text-stellar-text transition-stellar hover:bg-stellar-surface-muted"
          role="menuitem"
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            logout();
          }}
          className="block w-full px-stellar-4 py-stellar-2.5 text-left text-sm text-red-600 transition-stellar hover:bg-stellar-surface-muted dark:text-red-400"
          role="menuitem"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;
