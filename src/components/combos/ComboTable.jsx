import { Link } from 'react-router-dom';
import ComboStatusBadge from './ComboStatusBadge.jsx';
import {
  COMBO_PRICING_RULE_OPTIONS,
  COMMON_INVENTORY_LABEL,
} from '../../utils/comboConstants.js';

function ruleLabel(rule) {
  return COMBO_PRICING_RULE_OPTIONS.find((o) => o.value === rule)?.label || rule;
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
        No combos yet. Create a bundle to offer discounted packages.
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
              <th>Scope</th>
              <th>Products</th>
              <th>Pricing rule</th>
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
                <td className="text-sm text-stellar-text-muted">
                  {combo.isShared ? COMMON_INVENTORY_LABEL : combo.branch?.name || '—'}
                </td>
                <td className="text-sm">{combo.items?.length ?? 0} items</td>
                <td className="text-sm text-stellar-text-muted">{ruleLabel(combo.pricingRule)}</td>
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
              {combo.code} · {combo.items?.length} products
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
