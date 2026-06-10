import { NavLink } from 'react-router-dom';
import NavIcon from './icons/NavIcon.jsx';
import SidebarBrand from './SidebarBrand.jsx';
import useUiStore from '../../store/uiStore.js';
import { cn } from '../../utils/cn.js';

const linkClass = ({ isActive }, collapsed) =>
  cn(
    'sidebar-nav-link group flex min-h-[2.75rem] items-center gap-stellar-3 rounded-stellar-lg px-stellar-3 py-stellar-2.5 text-sm font-medium transition-stellar',
    isActive
      ? 'bg-stellar-accent text-stellar-accent-fg shadow-stellar'
      : 'text-stellar-text-muted hover:bg-stellar-surface-muted hover:text-stellar-text',
    collapsed && 'justify-center px-stellar-2'
  );

function Sidebar({ navItems, workspace, homePath, collapsed, onNavigate, scanPath }) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        'dashboard-sidebar scrollbar-stellar hidden min-h-0 shrink-0 flex-col self-stretch border-r border-stellar-border bg-stellar-bg-elevated transition-[width] duration-300 ease-[var(--ease-out-expo)] lg:flex',
        collapsed ? 'dashboard-sidebar--collapsed' : 'dashboard-sidebar--expanded'
      )}
      aria-label="Main navigation"
    >
      <SidebarBrand
        collapsed={collapsed}
        homePath={homePath}
        workspaceLabel={workspace.subtitle}
      />

      <nav className="flex min-h-0 flex-1 flex-col gap-stellar-1 overflow-y-auto overflow-x-hidden p-stellar-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={(state) => linkClass(state, collapsed)}
          >
            <NavIcon name={item.icon} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {collapsed && <span className="sr-only">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {scanPath ? (
        <div className="shrink-0 border-t border-stellar-border px-stellar-2 pb-stellar-1 pt-stellar-2">
          <NavLink
            to={scanPath}
            title={collapsed ? 'QR Scan' : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex min-h-[2.75rem] w-full items-center gap-stellar-3 rounded-stellar-lg px-stellar-3 py-stellar-2.5 text-sm font-semibold shadow-stellar transition-stellar',
                isActive
                  ? 'bg-stellar-accent text-stellar-accent-fg ring-1 ring-stellar-border/40'
                  : 'bg-stellar-accent text-stellar-accent-fg hover:brightness-110',
                collapsed && 'justify-center px-stellar-2',
              )
            }
          >
            <NavIcon name="scan" />
            {!collapsed && <span className="truncate">QR Scan</span>}
            {collapsed && <span className="sr-only">QR Scan</span>}
          </NavLink>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-stellar-border p-stellar-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'flex min-h-[2.75rem] w-full items-center gap-stellar-2 rounded-stellar-lg px-stellar-3 py-stellar-2 text-xs font-medium text-stellar-text-muted transition-stellar hover:bg-stellar-surface-muted hover:text-stellar-text',
            collapsed && 'justify-center px-stellar-2'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <svg
            className={cn('h-5 w-5 shrink-0 transition-transform duration-300', collapsed && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="truncate">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
