import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService.js';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await fetchNotifications(
        { limit: 20 },
        silent ? { skipGlobalLoader: true } : undefined,
      );
      setItems(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      setItems([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => loadNotifications({ silent: true }), 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setItems((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-icon btn-ghost relative"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stellar-accent px-0.5 text-[10px] font-bold text-stellar-accent-fg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-stellar-2 w-80 origin-top-right rounded-stellar-xl border border-stellar-border bg-stellar-surface shadow-stellar-elevated transition-stellar',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
        role="menu"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-stellar-border px-stellar-4 py-stellar-3">
          <p className="text-sm font-semibold text-stellar-text">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-stellar-text-muted transition-stellar hover:text-stellar-text"
            >
              Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-72 overflow-y-auto scrollbar-stellar py-stellar-1">
          {loading && items.length === 0 && (
            <li className="px-stellar-4 py-stellar-6 text-center text-xs text-stellar-text-muted">
              Loading…
            </li>
          )}
          {!loading && items.length === 0 && (
            <li className="px-stellar-4 py-stellar-6 text-center text-xs text-stellar-text-muted">
              No notifications
            </li>
          )}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => handleItemClick(n)}
                className={cn(
                  'w-full px-stellar-4 py-stellar-3 text-left transition-stellar hover:bg-stellar-surface-muted',
                  !n.isRead && 'bg-stellar-surface-muted/50',
                )}
              >
                <p className="text-sm font-medium text-stellar-text">{n.title}</p>
                <p className="mt-stellar-1 line-clamp-2 text-xs text-stellar-text-muted">
                  {n.body}
                </p>
                <p className="mt-stellar-1 text-[10px] text-stellar-text-subtle">
                  {formatTime(n.createdAt)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NotificationDropdown;
