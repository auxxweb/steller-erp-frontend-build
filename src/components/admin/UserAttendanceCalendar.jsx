import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function UserAttendanceCalendar({ month, records = [], onMonthChange, loading }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);

  const recordMap = useMemo(() => {
    const map = new Map();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const days = useMemo(() => {
    const grid = [];
    const startPad = monthStart.getDay();
    const totalDays = monthEnd.getDate();

    for (let i = 0; i < startPad; i += 1) {
      const d = new Date(monthStart);
      d.setDate(d.getDate() - (startPad - i));
      grid.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= totalDays; d += 1) {
      grid.push({
        date: new Date(month.getFullYear(), month.getMonth(), d),
        inMonth: true,
      });
    }
    while (grid.length % 7 !== 0) {
      const last = grid[grid.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      grid.push({ date: next, inMonth: false });
    }
    return grid;
  }, [month, monthStart, monthEnd]);

  const monthLabel = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const selectedKey =
    selectedDate && !Number.isNaN(selectedDate.getTime()) ? dateKey(selectedDate) : null;
  const selectedRecord = selectedKey ? recordMap.get(selectedKey) : null;

  const presentCount = records.filter((r) => r.checkInAt || r.checkOutAt).length;

  return (
    <div className="space-y-stellar-4">
      <div className="flex flex-wrap items-center justify-between gap-stellar-2 text-sm text-stellar-text-muted">
        <span>
          {presentCount} day{presentCount === 1 ? '' : 's'} with login activity this month
        </span>
        <span className="text-xs">Times from panel login / logout</span>
      </div>

      <div className="overflow-hidden rounded-stellar-xl border border-stellar-border bg-stellar-surface">
        <div className="flex items-center justify-between gap-stellar-3 border-b border-stellar-border p-stellar-3 sm:p-stellar-4">
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-[2.25rem] min-w-[2.25rem]"
            onClick={() => {
              const prev = new Date(month);
              prev.setMonth(prev.getMonth() - 1);
              onMonthChange(prev);
              setSelectedDate(null);
            }}
            aria-label="Previous month"
          >
            ←
          </button>
          <h3 className="text-sm font-semibold text-stellar-text">{monthLabel}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-[2.25rem] min-w-[2.25rem]"
            onClick={() => {
              const next = new Date(month);
              next.setMonth(next.getMonth() + 1);
              onMonthChange(next);
              setSelectedDate(null);
            }}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-stellar-border bg-stellar-surface-muted/50">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="py-stellar-2 text-center text-[10px] font-medium uppercase tracking-wider text-stellar-text-subtle"
            >
              {wd}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid min-h-[12rem] place-items-center p-stellar-6 text-sm text-stellar-text-muted">
            Loading attendance…
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map(({ date, inMonth }) => {
              const key = dateKey(date);
              const record = recordMap.get(key);
              const hasActivity = Boolean(record?.checkInAt || record?.checkOutAt);
              const isToday = sameDay(date, today);
              const isSelected = selectedKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => inMonth && setSelectedDate(date)}
                  className={cn(
                    'min-h-[4.5rem] border-b border-r border-stellar-border p-1 text-left transition-stellar sm:min-h-[5.5rem] sm:p-stellar-2',
                    !inMonth && 'cursor-default bg-stellar-surface-muted/30 opacity-40',
                    inMonth && 'hover:bg-stellar-surface-muted/60',
                    isSelected && inMonth && 'ring-2 ring-inset ring-stellar-primary',
                    hasActivity && inMonth && 'bg-emerald-500/5',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday && inMonth && 'bg-stellar-primary text-white',
                      !isToday && inMonth && 'text-stellar-text',
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {inMonth && hasActivity && (
                    <div className="mt-0.5 space-y-0.5 text-[9px] leading-tight text-stellar-text-muted sm:text-[10px]">
                      <div>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          In
                        </span>{' '}
                        {formatTime(record.checkInAt)}
                      </div>
                      <div>
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          Out
                        </span>{' '}
                        {formatTime(record.checkOutAt)}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/40 p-stellar-4">
          <h4 className="text-sm font-semibold text-stellar-text">
            {new Date(selectedRecord.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h4>
          <dl className="mt-stellar-3 grid gap-stellar-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-stellar-text-muted">Login</dt>
              <dd className="font-mono font-medium text-stellar-text">
                {formatTime(selectedRecord.checkInAt)}
              </dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Logout</dt>
              <dd className="font-mono font-medium text-stellar-text">
                {formatTime(selectedRecord.checkOutAt)}
              </dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Duration</dt>
              <dd className="font-medium text-stellar-text">
                {formatDuration(selectedRecord.workMinutes)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {selectedKey && !selectedRecord && (
        <p className="text-sm text-stellar-text-muted">
          No login or logout recorded for this date.
        </p>
      )}
    </div>
  );
}

export default UserAttendanceCalendar;
