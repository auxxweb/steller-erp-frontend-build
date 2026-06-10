import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import { fetchProductUnits } from '../../services/productService.js';
import { UNIT_STATUS_LABELS } from '../../utils/productConstants.js';

function ProductSerialUnitsPanel({ productId, basePath, limit = 8 }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchProductUnits(productId, { limit: 50 });
        if (!cancelled) setUnits(data.data.units || []);
      } catch {
        if (!cancelled) setUnits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const preview = units.slice(0, limit);

  return (
    <Card variant="muted" className="!p-stellar-5">
      <div className="flex items-center justify-between gap-stellar-3">
        <h2 className="text-sm font-semibold text-stellar-text">Serial inventory</h2>
        <Link to={`${basePath}/${productId}/units`} className="text-xs font-medium text-stellar-accent">
          Manage all units →
        </Link>
      </div>
      <p className="mt-stellar-1 text-xs text-stellar-text-muted">
        Each row is one physical item tracked by serial number for rent, transfer, and QR workflows.
      </p>

      {loading ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">Loading serials…</p>
      ) : units.length === 0 ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">
          No serial units yet.{' '}
          <Link to={`${basePath}/${productId}/units`} className="text-stellar-accent">
            Add serial numbers
          </Link>
        </p>
      ) : (
        <ul className="mt-stellar-4 divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
          {preview.map((unit) => (
            <li
              key={unit.id}
              className="flex items-center justify-between gap-stellar-3 px-stellar-3 py-stellar-2.5 text-sm"
            >
              <span className="font-mono font-medium text-stellar-text">{unit.serialNumber}</span>
              <span className="shrink-0 text-xs capitalize text-stellar-text-muted">
                {UNIT_STATUS_LABELS[unit.status] || unit.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      {units.length > limit && (
        <p className="mt-stellar-2 text-xs text-stellar-text-muted">
          +{units.length - limit} more — view all on Units page
        </p>
      )}
    </Card>
  );
}

export default ProductSerialUnitsPanel;
