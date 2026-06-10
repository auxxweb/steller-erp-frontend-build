import { useEffect, useState } from 'react';
import { fetchRentalTimeline } from '../../services/rentalService.js';
import { formatDate } from '../../utils/format.js';

function RentalTimeline({ rentalId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchRentalTimeline(rentalId);
        if (!cancelled) setEntries(res.data.data.timeline || []);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalId]);

  if (loading) {
    return <p className="text-xs text-stellar-text-muted">Loading timeline…</p>;
  }

  if (!entries.length) {
    return <p className="text-xs text-stellar-text-muted">No workflow events yet.</p>;
  }

  return (
    <ol className="space-y-stellar-3 border-l border-stellar-border pl-stellar-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-stellar-accent"
            aria-hidden
          />
          <p className="text-sm font-medium text-stellar-text">{entry.summary}</p>
          <p className="text-xs text-stellar-text-muted">
            {entry.event.replace(/_/g, ' ')}
            {entry.toStatus ? ` → ${entry.toStatus}` : ''}
            {' · '}
            {formatDate(entry.createdAt)}
            {entry.performedBy?.name ? ` · ${entry.performedBy.name}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default RentalTimeline;
