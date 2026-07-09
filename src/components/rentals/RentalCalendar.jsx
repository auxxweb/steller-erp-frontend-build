import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import RentalStatusBadge from './RentalStatusBadge.jsx';
import { cn } from '../../utils/cn.js';
import { formatDate } from '../../utils/format.js';
import { RENTAL_TYPE } from '../../utils/rentalConstants.js';

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

function formatDayLabel(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function rentalTypeLabel(rentalType) {
  if (rentalType === RENTAL_TYPE.PREBOOK) return 'Prebook';
  if (rentalType === RENTAL_TYPE.DIRECT) return 'Direct';
  return null;
}

function RentalCalendar({ month, rentals = [], basePath, onMonthChange }) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(null);
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

  const selectedDayRentals = useMemo(() => {
    if (!selectedDay) return [];
    const key = selectedDay.toISOString().slice(0, 10);
    return rentalsByDay.get(key) || [];
  }, [selectedDay, rentalsByDay]);

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
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(date)}
              className={cn(
                'min-h-[72px] border-b border-r border-stellar-border p-1 text-left transition-stellar hover:bg-stellar-surface-muted/50 sm:min-h-[88px] sm:p-stellar-2',
                !inMonth && 'bg-stellar-surface-muted/30 opacity-60',
                selectedDay && sameDay(date, selectedDay) && 'bg-stellar-accent/5 ring-1 ring-inset ring-stellar-accent/25',
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
              {dayRentals.length > 0 && (
                <ul className="mt-stellar-1 space-y-0.5" aria-hidden="true">
                  {dayRentals.slice(0, 2).map((r) => (
                    <li
                      key={r.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-stellar-text sm:text-xs"
                      title={r.rentalNumber}
                    >
                      {r.rentalNumber}
                    </li>
                  ))}
                  {dayRentals.length > 2 && (
                    <li className="px-1 text-[10px] text-stellar-text-muted">
                      +{dayRentals.length - 2} more
                    </li>
                  )}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {rentals.length === 0 && (
        <p className="p-stellar-4 text-center text-sm text-stellar-text-muted">
          No bookings this month
        </p>
      )}

      <Modal
        open={Boolean(selectedDay)}
        title={selectedDay ? `Bookings · ${formatDayLabel(selectedDay)}` : ''}
        onClose={() => setSelectedDay(null)}
        className="max-w-lg"
        scrollBody
      >
        {selectedDayRentals.length === 0 ? (
          <p className="text-sm text-stellar-text-muted">No bookings on this date.</p>
        ) : (
          <ul className="divide-y divide-stellar-border">
            {selectedDayRentals.map((rental) => {
              const typeLabel = rentalTypeLabel(rental.rentalType);
              return (
                <li key={rental.id}>
                  <Link
                    to={`${basePath}/${rental.id}`}
                    onClick={() => setSelectedDay(null)}
                    className="flex flex-col gap-stellar-2 py-stellar-3 transition-stellar hover:bg-stellar-surface-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-stellar-text">
                        {rental.rentalNumber}
                      </p>
                      <p className="truncate text-sm text-stellar-text-muted">
                        {rental.customer?.name || 'Customer'}
                        {rental.customer?.phone ? ` · ${rental.customer.phone}` : ''}
                      </p>
                      <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                        {formatDate(rental.scheduledStartAt)} → {formatDate(rental.scheduledEndAt)}
                        {typeLabel ? ` · ${typeLabel}` : ''}
                      </p>
                    </div>
                    <RentalStatusBadge status={rental.status} className="shrink-0 self-start" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </div>
  );
}

export { startOfMonth, endOfMonth };
export default RentalCalendar;
