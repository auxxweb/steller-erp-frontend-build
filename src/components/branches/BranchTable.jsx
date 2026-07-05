import { Link } from 'react-router-dom';
import BranchStatusBadge from './BranchStatusBadge.jsx';
import Button from '../ui/Button.jsx';

function formatAddress(address) {
  if (!address) return '—';
  const parts = [address.line1, address.city, address.state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function BranchTable({
  branches,
  loading,
  basePath = '/admin/branches',
  onDelete,
}) {
  if (loading) {
    return (
      <div className="data-table-wrap">
        <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
          Loading branches…
        </div>
      </div>
    );
  }

  if (!branches?.length) {
    return (
      <div className="data-table-wrap">
        <div className="p-stellar-8 text-center">
          <p className="text-sm font-medium text-stellar-text">No branches found</p>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Create your first branch to get started.
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
            <th>Name</th>
            <th>Code</th>
            <th>Manager</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>
                <Link
                  to={`${basePath}/${branch.id}`}
                  className="font-medium text-stellar-text hover:underline"
                >
                  {branch.name}
                </Link>
              </td>
              <td>
                <code className="rounded bg-stellar-surface-muted px-1.5 py-0.5 text-xs">
                  {branch.code}
                </code>
              </td>
              <td className="text-stellar-text-muted">
                {branch.manager?.name || '—'}
              </td>
              <td>
                <div className="text-sm">
                  {branch.phone && <div>{branch.phone}</div>}
                  {branch.email && (
                    <div className="text-stellar-text-muted">{branch.email}</div>
                  )}
                  {!branch.phone && !branch.email && '—'}
                </div>
              </td>
              <td className="max-w-[12rem] truncate text-stellar-text-muted">
                {formatAddress(branch.address)}
              </td>
              <td>
                <BranchStatusBadge status={branch.status} />
              </td>
              <td>
                <div className="flex justify-end gap-stellar-2">
                  <Link
                    to={`${basePath}/${branch.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View
                  </Link>
                  <Link
                    to={`${basePath}/${branch.id}/edit`}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-stellar-danger"
                      onClick={() => onDelete(branch)}
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
        {branches.map((branch) => (
          <li key={branch.id} className="p-stellar-4">
            <div className="flex items-start justify-between gap-stellar-2">
              <Link
                to={`${basePath}/${branch.id}`}
                className="font-medium text-stellar-text"
              >
                {branch.name}
              </Link>
              <BranchStatusBadge status={branch.status} />
            </div>
            <p className="mt-stellar-1 font-mono text-xs text-stellar-text-muted">{branch.code}</p>
            {branch.manager?.name && (
              <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                Manager: {branch.manager.name}
              </p>
            )}
            {(branch.phone || branch.email) && (
              <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                {[branch.phone, branch.email].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {formatAddress(branch.address)}
            </p>
            <div className="mt-stellar-3 flex flex-wrap gap-stellar-2">
              <Link to={`${basePath}/${branch.id}`} className="btn btn-ghost btn-sm">
                View
              </Link>
              <Link to={`${basePath}/${branch.id}/edit`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-stellar-danger"
                  onClick={() => onDelete(branch)}
                >
                  Delete
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default BranchTable;
