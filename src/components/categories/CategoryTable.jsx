import { Link } from 'react-router-dom';
import CategoryStatusBadge from './CategoryStatusBadge.jsx';
import Button from '../ui/Button.jsx';
import { formatBranchDisplay } from '../../utils/branchHelpers.js';

function CategoryTable({ categories, loading, basePath, showLocation, onDelete }) {
  if (loading) {
    return (
      <div className="data-table-wrap">
        <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
          Loading categories…
        </div>
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="data-table-wrap">
        <div className="p-stellar-8 text-center">
          <p className="text-sm font-medium text-stellar-text">No categories found</p>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Create a category to organize your product inventory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="data-table-wrap data-table-scroll hidden md:block">
        <table className="data-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Slug</th>
            {showLocation && <th>Location</th>}
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                <div className="flex items-center gap-stellar-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt=""
                      className="h-10 w-10 rounded-stellar-md border border-stellar-border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-stellar-md bg-stellar-surface-muted text-xs font-medium text-stellar-text-subtle">
                      {category.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-stellar-text">{category.name}</p>
                    {category.description && (
                      <p className="max-w-xs truncate text-xs text-stellar-text-muted">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <code className="rounded bg-stellar-surface-muted px-1.5 py-0.5 text-xs">
                  {category.slug}
                </code>
              </td>
              {showLocation && (
                <td className="text-sm text-stellar-text-muted">
                  {formatBranchDisplay(category.branch)}
                </td>
              )}
              <td>
                <CategoryStatusBadge status={category.status} />
              </td>
              <td>
                <div className="flex justify-end gap-stellar-2">
                  <Link
                    to={`${basePath}/${category.id}/edit`}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-stellar-danger"
                      onClick={() => onDelete(category)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <ul className="divide-y divide-stellar-border md:hidden">
        {categories.map((category) => (
          <li key={category.id} className="p-stellar-4">
            <div className="flex gap-stellar-3">
              {category.image ? (
                <img
                  src={category.image}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-stellar-md border border-stellar-border object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-stellar-md bg-stellar-surface-muted text-xs font-medium text-stellar-text-subtle">
                  {category.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-stellar-2">
                  <p className="font-medium text-stellar-text">{category.name}</p>
                  <CategoryStatusBadge status={category.status} />
                </div>
                <p className="mt-stellar-1 font-mono text-xs text-stellar-text-muted">
                  {category.slug}
                </p>
                {showLocation && (
                  <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                    {formatBranchDisplay(category.branch)}
                  </p>
                )}
                {category.description && (
                  <p className="mt-stellar-1 line-clamp-2 text-xs text-stellar-text-muted">
                    {category.description}
                  </p>
                )}
                <div className="mt-stellar-3 flex flex-wrap gap-stellar-2">
                  <Link
                    to={`${basePath}/${category.id}/edit`}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-stellar-danger"
                      onClick={() => onDelete(category)}
                    >
                      Delete
                    </Button>
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

export default CategoryTable;
