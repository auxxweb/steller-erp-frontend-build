import { Link } from 'react-router-dom';
import ComboStatusBadge from './ComboStatusBadge.jsx';

function formatDailyRate(pricing) {
  if (pricing?.dailyRate == null || pricing.dailyRate === '') return '—';
  return `₹${Number(pricing.dailyRate).toLocaleString('en-IN')}/day`;
}

function ComboTable({ combos, loading, basePath, canManage, onDelete }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">Loading…</div>
    );
  }

  if (!combos?.length) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        No combos yet. Create a bundle with multiple products and set its rental rates.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Combo</th>
              <th>Products</th>
              <th>Daily rate</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {combos.map((combo) => (
              <tr key={combo.id}>
                <td>
                  <Link to={`${basePath}/${combo.id}`} className="font-medium hover:underline">
                    {combo.name}
                  </Link>
                  <p className="text-xs text-stellar-text-muted">{combo.code}</p>
                </td>
                <td className="text-sm">{combo.items?.length ?? 0} items</td>
                <td className="text-sm tabular-nums text-stellar-text-muted">
                  {formatDailyRate(combo.pricing)}
                </td>
                <td>
                  <ComboStatusBadge status={combo.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-stellar-2">
                    <Link to={`${basePath}/${combo.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                    {canManage && (
                      <>
                        <Link to={`${basePath}/${combo.id}/edit`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm !text-stellar-danger"
                            onClick={() => onDelete(combo)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-stellar-border md:hidden">
        {combos.map((combo) => (
          <li key={combo.id} className="p-stellar-4">
            <div className="flex justify-between gap-stellar-2">
              <Link to={`${basePath}/${combo.id}`} className="font-medium">
                {combo.name}
              </Link>
              <ComboStatusBadge status={combo.status} />
            </div>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {combo.code} · {combo.items?.length} products · {formatDailyRate(combo.pricing)}
            </p>
            <Link to={`${basePath}/${combo.id}`} className="btn btn-ghost btn-sm mt-stellar-3">
              Open
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ComboTable;
