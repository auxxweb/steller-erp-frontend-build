import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function rentalSpansDay(rental, day) {
  const start = new Date(rental.scheduledStartAt);
  const end = new Date(rental.scheduledEndAt);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return start <= dayEnd && end >= dayStart;
}

function RentalCalendar({ month, rentals = [], basePath, onMonthChange }) {
  const today = new Date();
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
      grid.push({ date: new Date(month.getFullYear(), month.getMonth(), d), inMonth: true });
    }
    while (grid.length % 7 !== 0) {
      const last = grid[grid.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      grid.push({ date: next, inMonth: false });
    }
    return grid;
  }, [month, monthStart, monthEnd]);

  const rentalsByDay = useMemo(() => {
    const map = new Map();
    days.forEach(({ date }) => {
      const key = date.toISOString().slice(0, 10);
      map.set(
        key,
        rentals.filter((r) => rentalSpansDay(r, date)),
      );
    });
    return map;
  }, [days, rentals]);

  const monthLabel = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-stellar-xl border border-stellar-border bg-stellar-surface overflow-hidden">
      <div className="flex items-center justify-between gap-stellar-3 border-b border-stellar-border p-stellar-4">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const prev = new Date(month);
            prev.setMonth(prev.getMonth() - 1);
            onMonthChange(prev);
          }}
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-stellar-text">{monthLabel}</h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const next = new Date(month);
            next.setMonth(next.getMonth() + 1);
            onMonthChange(next);
          }}
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

      <div className="grid grid-cols-7">
        {days.map(({ date, inMonth }) => {
          const key = date.toISOString().slice(0, 10);
          const dayRentals = rentalsByDay.get(key) || [];
          const isToday = sameDay(date, today);

          return (
            <div
              key={key}
              className={cn(
                'min-h-[72px] border-b border-r border-stellar-border p-1 sm:min-h-[88px] sm:p-stellar-2',
                !inMonth && 'bg-stellar-surface-muted/30 opacity-60',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday && 'bg-stellar-accent font-semibold text-white',
                )}
              >
                {date.getDate()}
              </span>
              <ul className="mt-stellar-1 space-y-0.5">
                {dayRentals.slice(0, 2).map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`${basePath}/${r.id}`}
                      className="block truncate rounded px-1 py-0.5 text-[10px] font-medium hover:bg-stellar-accent/10 sm:text-xs"
                      title={r.rentalNumber}
                    >
                      {r.rentalNumber}
                    </Link>
                  </li>
                ))}
                {dayRentals.length > 2 && (
                  <li className="px-1 text-[10px] text-stellar-text-muted">
                    +{dayRentals.length - 2} more
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {rentals.length === 0 && (
        <p className="p-stellar-4 text-center text-sm text-stellar-text-muted">
          No bookings this month
        </p>
      )}
    </div>
  );
}

export { startOfMonth, endOfMonth };
export default RentalCalendar;
