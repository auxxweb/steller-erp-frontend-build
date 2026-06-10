import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import RiskBadge from './RiskBadge.jsx';
import { RISK_LEVEL_META } from '../../utils/customerConstants.js';
import { cn } from '../../utils/cn.js';

function RiskScorePanel({
  riskScore = 0,
  riskLevel,
  riskFactors = [],
  riskCalculatedAt,
  loading,
  canManage,
  onRecalculate,
  recalculating,
}) {
  const meta = RISK_LEVEL_META[riskLevel] || RISK_LEVEL_META.medium;
  const score = Math.max(0, Math.min(100, Number(riskScore) || 0));

  if (loading) {
    return (
      <Card variant="muted" className="!p-stellar-6">
        <div className="h-32 animate-pulse rounded-stellar-lg bg-stellar-surface" />
      </Card>
    );
  }

  return (
    <Card variant="muted" className="!p-stellar-5 sm:!p-stellar-6">
      <div className="flex flex-col gap-stellar-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-stellar-4 sm:flex-row sm:items-center">
          <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-stellar-border bg-stellar-surface"
            role="img"
            aria-label={`Risk score ${score} out of 100, ${meta.label} risk`}
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-stellar-border"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.64} 264`}
                className={meta.ringClass}
              />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-stellar-text">{score}</p>
              <p className="text-[10px] uppercase tracking-wider text-stellar-text-muted">/ 100</p>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-stellar-2 sm:justify-start">
              <h2 className="text-lg font-semibold text-stellar-text">Risk score</h2>
              <RiskBadge level={riskLevel} />
            </div>
            <p className="mt-stellar-1 text-sm text-stellar-text-muted">
              Lower is safer. Bands: low &lt;40, medium 40–69, high ≥70.
            </p>
            {riskCalculatedAt && (
              <p className="mt-stellar-1 text-xs text-stellar-text-subtle">
                Last calculated: {new Date(riskCalculatedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {canManage && onRecalculate && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={recalculating}
            onClick={onRecalculate}
          >
            {recalculating ? 'Recalculating…' : 'Recalculate'}
          </Button>
        )}
      </div>

      <div className="mt-stellar-2 h-2 overflow-hidden rounded-full bg-stellar-border">
        <div
          className={cn('h-full rounded-full transition-all', meta.barClass)}
          style={{ width: `${score}%` }}
        />
      </div>

      {riskFactors?.length > 0 && (
        <div className="mt-stellar-6">
          <h3 className="text-sm font-semibold text-stellar-text">Contributing factors</h3>
          <ul className="mt-stellar-3 space-y-stellar-2">
            {riskFactors.map((factor, i) => (
              <li
                key={`${factor.factor}-${i}`}
                className="flex flex-col gap-stellar-1 rounded-stellar-md border border-stellar-border bg-stellar-surface px-stellar-3 py-stellar-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium capitalize text-stellar-text">
                  {factor.factor?.replace(/_/g, ' ')}
                </span>
                <span className="text-stellar-text-muted">{factor.detail}</span>
                <span
                  className={cn(
                    'tabular-nums text-xs font-medium',
                    factor.impact > 0 ? 'text-red-600' : 'text-emerald-600',
                  )}
                >
                  {factor.impact > 0 ? '+' : ''}
                  {factor.impact}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default RiskScorePanel;
