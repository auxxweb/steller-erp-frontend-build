import UnitStatusBadge from './UnitStatusBadge.jsx';
import Button from '../ui/Button.jsx';
import { CONDITION_LABELS } from '../../utils/productConstants.js';

function ProductUnitTable({
  units,
  loading,
  canManage,
  onShowQr,
  onEdit,
  onStatusChange,
  onRetire,
}) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        Loading units…
      </div>
    );
  }

  if (!units?.length) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        No serial units yet. Add units to track inventory and generate QR codes.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Status</th>
              <th>Images</th>
              <th>Condition</th>
              <th>At branch</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td className="font-mono text-sm">{unit.serialNumber}</td>
                <td>
                  <UnitStatusBadge status={unit.status} />
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {(unit.images || []).length ? `${unit.images.length}/2` : '—'}
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {CONDITION_LABELS[unit.condition] || unit.condition}
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {unit.branch?.code || unit.branch?.name || '—'}
                </td>
                <td>
                  <div className="flex justify-end gap-stellar-1">
                    <Button variant="ghost" size="sm" onClick={() => onShowQr?.(unit)}>
                      QR
                    </Button>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onEdit?.(unit)}>
                          Edit
                        </Button>
                        {onStatusChange && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStatusChange(unit)}
                          >
                            Status
                          </Button>
                        )}
                        {onRetire && unit.status !== 'retired' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="!text-stellar-danger"
                            onClick={() => onRetire(unit)}
                          >
                            Retire
                          </Button>
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
        {units.map((unit) => (
          <li key={unit.id} className="p-stellar-4 space-y-stellar-3">
            <div className="flex items-start justify-between gap-stellar-2">
              <p className="font-mono text-sm font-medium text-stellar-text">
                {unit.serialNumber}
              </p>
              <UnitStatusBadge status={unit.status} />
            </div>
            <dl className="grid grid-cols-2 gap-stellar-2 text-xs">
              <div>
                <dt className="text-stellar-text-subtle">Images</dt>
                <dd>{(unit.images || []).length ? `${unit.images.length}/2` : '—'}</dd>
              </div>
              <div>
                <dt className="text-stellar-text-subtle">Condition</dt>
                <dd>{CONDITION_LABELS[unit.condition] || unit.condition}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-stellar-2">
              <Button variant="secondary" size="sm" onClick={() => onShowQr?.(unit)}>
                Show QR
              </Button>
              {canManage && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(unit)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onStatusChange?.(unit)}>
                    Status
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ProductUnitTable;
