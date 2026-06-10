import { ROLE_LABELS } from '../../utils/constants.js';

function RoleDashboard({ roleKey, title }) {
  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <span className="badge badge-accent">{ROLE_LABELS[roleKey] || roleKey}</span>
        <h1 className="mt-stellar-3 text-2xl font-semibold tracking-tight text-stellar-text sm:text-3xl">
          {title}
        </h1>
        <p className="mt-stellar-2 text-stellar-text-muted">
          Your role-specific workspace will expand here.
        </p>
      </div>
      <div className="grid gap-stellar-4 sm:grid-cols-2">
        {['Overview', 'Quick actions'].map((label) => (
          <div key={label} className="card-muted card-hover">
            <p className="text-sm font-medium text-stellar-text">{label}</p>
            <p className="mt-stellar-1 text-xs text-stellar-text-subtle">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoleDashboard;
