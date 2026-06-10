import { useCallback, useEffect, useState } from 'react';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalCalendar, { startOfMonth, endOfMonth } from '../../components/rentals/RentalCalendar.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import { fetchRentals } from '../../services/rentalService.js';

function RentalCalendarPage() {
  const basePath = useRentalBasePath();
  const [month, setMonth] = useState(() => new Date());
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = startOfMonth(month).toISOString();
      const to = endOfMonth(month).toISOString();
      const { data } = await fetchRentals({
        from,
        to,
        limit: 200,
        sortBy: 'scheduledStartAt',
        sortOrder: 'asc',
      });
      setRentals(data.data.rentals);
    } catch {
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
          Booking calendar
        </h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Tap a booking to open details.
        </p>
      </div>

      <RentalNav />

      {loading ? (
        <div className="h-96 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
      ) : (
        <RentalCalendar
          month={month}
          rentals={rentals}
          basePath={basePath}
          onMonthChange={setMonth}
        />
      )}
    </div>
  );
}

export default RentalCalendarPage;
