import { useCallback, useEffect, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { fetchTodayPunchStatus, punchAttendance } from '../../services/attendanceService.js';
import {
  PUNCH_ACTION,
  PUNCH_STATE,
  PUNCH_STATE_LABELS,
} from '../../utils/attendanceConstants.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const STATUS_TONE = {
  [PUNCH_STATE.OUT]: 'bg-stellar-surface-muted text-stellar-text-muted',
  [PUNCH_STATE.WORKING]: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  [PUNCH_STATE.ON_BREAK]: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  [PUNCH_STATE.DONE]: 'bg-blue-500/15 text-blue-800 dark:text-blue-200',
};

function AttendancePunchPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const loadStatus = useCallback(async ({ silent = false } = {}) => {
    try {
      const { data } = await fetchTodayPunchStatus(
        silent ? { skipGlobalLoader: true } : undefined,
      );
      setStatus(data.data);
    } catch (err) {
      if (!silent) {
        toast.error(getApiErrorMessage(err, 'Failed to load attendance status'));
      }
      setStatus(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const timer = setInterval(() => loadStatus({ silent: true }), 60_000);
    return () => clearInterval(timer);
  }, [loadStatus]);

  const handlePunch = async (action) => {
    setActing(action);
    try {
      const { data } = await punchAttendance(action);
      setStatus(data.data);
      const labels = {
        [PUNCH_ACTION.PUNCH_IN]: 'Punched in',
        [PUNCH_ACTION.START_BREAK]: 'Break started',
        [PUNCH_ACTION.END_BREAK]: 'Back to work',
        [PUNCH_ACTION.PUNCH_OUT]: 'Punched out — shift ended',
      };
      toast.success(labels[action] || 'Updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update attendance'));
    } finally {
      setActing(null);
    }
  };

  const punchState = status?.punchState || PUNCH_STATE.OUT;

  const buttons = [
    {
      action: PUNCH_ACTION.PUNCH_IN,
      label: 'Punch in',
      variant: 'primary',
      enabled: punchState === PUNCH_STATE.OUT,
    },
    {
      action: PUNCH_ACTION.START_BREAK,
      label: 'Take break',
      variant: 'secondary',
      enabled: punchState === PUNCH_STATE.WORKING,
    },
    {
      action: PUNCH_ACTION.END_BREAK,
      label: 'Back to work',
      variant: 'primary',
      enabled: punchState === PUNCH_STATE.ON_BREAK,
    },
    {
      action: PUNCH_ACTION.PUNCH_OUT,
      label: 'Punch out',
      variant: 'danger',
      enabled: punchState === PUNCH_STATE.WORKING || punchState === PUNCH_STATE.ON_BREAK,
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title>Today&apos;s attendance</Card.Title>
        <Card.Description>
          Mark your work day with punch in, breaks, and punch out — not tied to app login.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {loading ? (
          <p className="text-sm text-stellar-text-muted">Loading attendance…</p>
        ) : (
          <div className="space-y-stellar-4">
            <div className="flex flex-wrap items-center gap-stellar-3">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  STATUS_TONE[punchState] || STATUS_TONE[PUNCH_STATE.OUT],
                )}
              >
                {PUNCH_STATE_LABELS[punchState] || punchState}
              </span>
              <div className="flex flex-wrap gap-stellar-4 text-sm text-stellar-text-muted">
                <span>
                  In <strong className="font-mono text-stellar-text">{formatTime(status?.checkInAt)}</strong>
                </span>
                <span>
                  Out{' '}
                  <strong className="font-mono text-stellar-text">{formatTime(status?.checkOutAt)}</strong>
                </span>
                <span>
                  Worked{' '}
                  <strong className="text-stellar-text">{formatDuration(status?.workMinutes)}</strong>
                </span>
                {(status?.breakMinutes > 0 || punchState === PUNCH_STATE.ON_BREAK) && (
                  <span>
                    Break{' '}
                    <strong className="text-stellar-text">{formatDuration(status?.breakMinutes)}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-stellar-2 sm:grid-cols-2 lg:grid-cols-4">
              {buttons.map((btn) => (
                <Button
                  key={btn.action}
                  variant={btn.variant}
                  disabled={!btn.enabled || Boolean(acting)}
                  isLoading={acting === btn.action}
                  onClick={() => handlePunch(btn.action)}
                  className="w-full"
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {punchState === PUNCH_STATE.DONE && (
              <p className="text-sm text-stellar-text-muted">
                Your shift for today is complete. See full history on the Attendance page.
              </p>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

export default AttendancePunchPanel;
