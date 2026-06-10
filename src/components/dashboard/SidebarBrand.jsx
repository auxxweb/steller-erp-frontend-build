import Logo from '../common/Logo.jsx';
import { cn } from '../../utils/cn.js';

function SidebarBrand({ collapsed, homePath, workspaceLabel }) {
  return (
    <div
      className={cn(
        'sidebar-brand flex shrink-0 flex-col border-b border-stellar-border',
        collapsed ? 'items-center px-stellar-2 py-stellar-4' : 'px-stellar-4 py-stellar-5'
      )}
    >
      <Logo
        variant={collapsed ? 'mark' : 'compact'}
        linkTo={homePath}
        className={collapsed ? undefined : 'w-full'}
      />
      {!collapsed && workspaceLabel ? (
        <p className="mt-stellar-3 truncate text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-stellar-text-subtle">
          {workspaceLabel}
        </p>
      ) : null}
    </div>
  );
}

export default SidebarBrand;
