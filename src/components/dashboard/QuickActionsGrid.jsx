import { Link } from 'react-router-dom';

function QuickActionsGrid({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className={`block rounded-stellar-xl border p-stellar-4 transition-stellar hover:border-stellar-accent ${
            action.accent
              ? 'border-stellar-accent/30 bg-stellar-accent/5'
              : 'border-stellar-border bg-stellar-surface'
          }`}
        >
          <p className="font-semibold text-stellar-text">{action.label}</p>
          <p className="mt-stellar-1 text-xs text-stellar-text-muted">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default QuickActionsGrid;
