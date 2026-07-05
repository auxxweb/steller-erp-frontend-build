import { Link } from 'react-router-dom';
import ProductStatusBadge from './ProductStatusBadge.jsx';

function formatMoney(val) {
  if (val == null || val === '') return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function ProductTable({ products, loading, basePath, canManage, onDelete }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        Loading products…
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="p-stellar-8 text-center">
        <p className="text-sm font-medium text-stellar-text">No products found</p>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Add equipment to start tracking inventory.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Serial units</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-stellar-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-stellar-md border border-stellar-border object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-stellar-md bg-stellar-surface-muted text-xs font-medium">
                        {product.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`${basePath}/${product.id}`}
                        className="font-medium text-stellar-text hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-stellar-text-muted">
                        {[product.brand, product.model].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <code className="text-xs">{product.sku}</code>
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {product.category?.name || '—'}
                </td>
                <td className="text-sm tabular-nums">
                  {formatMoney(product.pricing?.dailyRate)}
                  <span className="text-stellar-text-muted"> /day</span>
                </td>
                <td className="text-sm tabular-nums">
                  <span className="text-stellar-text">{product.availableUnits ?? 0}</span>
                  <span className="text-stellar-text-muted"> / {product.totalUnits ?? 0}</span>
                </td>
                <td>
                  <ProductStatusBadge status={product.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-stellar-2">
                    <Link to={`${basePath}/${product.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`${basePath}/${product.id}/edit`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm !text-stellar-danger"
                            onClick={() => onDelete(product)}
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

      {/* Mobile cards */}
      <ul className="divide-y divide-stellar-border md:hidden">
        {products.map((product) => (
          <li key={product.id} className="p-stellar-4">
            <div className="flex gap-stellar-3">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-stellar-md border border-stellar-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-stellar-md bg-stellar-surface-muted text-sm font-semibold">
                  {product.name?.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-stellar-2">
                  <Link
                    to={`${basePath}/${product.id}`}
                    className="font-medium text-stellar-text"
                  >
                    {product.name}
                  </Link>
                  <ProductStatusBadge status={product.status} />
                </div>
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  {product.sku} · {product.category?.name}
                </p>
                <p className="mt-stellar-1 text-xs tabular-nums text-stellar-text-muted">
                  {product.availableUnits ?? 0}/{product.totalUnits ?? 0} available ·{' '}
                  {formatMoney(product.pricing?.dailyRate)}/day
                </p>
                <div className="mt-stellar-3 flex flex-wrap gap-stellar-2">
                  <Link to={`${basePath}/${product.id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                  {canManage && (
                    <Link
                      to={`${basePath}/${product.id}/edit`}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ProductTable;
