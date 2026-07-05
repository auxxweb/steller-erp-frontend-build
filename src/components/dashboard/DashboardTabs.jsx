import { cn } from '../../utils/cn.js';

function DashboardTabs({ tabs, active, onChange }) {
  return (
    <div className="nav-scroll flex gap-stellar-1 overflow-x-auto border-b border-stellar-border pb-px scrollbar-stellar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'shrink-0 border-b-2 px-stellar-4 py-stellar-2 text-sm font-medium transition-stellar',
            active === tab.id
              ? 'border-stellar-accent text-stellar-text'
              : 'border-transparent text-stellar-text-muted hover:text-stellar-text',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default DashboardTabs;
