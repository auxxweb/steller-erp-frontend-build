import { memo } from 'react';
import { Link } from 'react-router-dom';
import CustomerStatusBadge from './CustomerStatusBadge.jsx';
import RiskBadge from './RiskBadge.jsx';
import { CUSTOMER_TYPE } from '../../utils/customerConstants.js';

function formatMoney(val) {
  if (val == null || val === '') return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function CustomerAvatar({ customer }) {
  const initial = customer.name?.charAt(0)?.toUpperCase() || '?';
  const isBusiness = customer.customerType === CUSTOMER_TYPE.BUSINESS;

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-stellar-md text-sm font-semibold ${
        isBusiness
          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
          : 'bg-stellar-surface-muted text-stellar-text'
      }`}
    >
      {initial}
    </div>
  );
}

function CustomerTable({ customers, loading, basePath, canManage, onDelete }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        Loading customers…
      </div>
    );
  }

  if (!customers?.length) {
    return (
      <div className="p-stellar-8 text-center">
        <p className="text-sm font-medium text-stellar-text">No customers found</p>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Add your first customer to start tracking rentals and risk.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Risk</th>
              <th>Balance</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="flex items-center gap-stellar-3">
                    <CustomerAvatar customer={customer} />
                    <div>
                      <Link
                        to={`${basePath}/${customer.id}`}
                        className="font-medium text-stellar-text hover:underline"
                      >
                        {customer.name}
                      </Link>
                      {customer.company && (
                        <p className="text-xs text-stellar-text-muted">{customer.company}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-sm tabular-nums">{customer.phone}</td>
                <td className="text-sm capitalize text-stellar-text-muted">
                  {customer.customerType}
                </td>
                <td>
                  <div className="flex items-center gap-stellar-2">
                    <span className="text-sm font-medium tabular-nums">{customer.riskScore}</span>
                    <RiskBadge level={customer.riskLevel} />
                  </div>
                </td>
                <td className="text-sm tabular-nums">
                  {formatMoney(customer.outstandingBalance)}
                </td>
                <td>
                  <CustomerStatusBadge status={customer.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-stellar-2">
                    <Link to={`${basePath}/${customer.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`${basePath}/${customer.id}/edit`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm !text-stellar-danger"
                            onClick={() => onDelete(customer)}
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
        {customers.map((customer) => (
          <li key={customer.id} className="p-stellar-4">
            <div className="flex gap-stellar-3">
              <CustomerAvatar customer={customer} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-stellar-2">
                  <Link
                    to={`${basePath}/${customer.id}`}
                    className="font-medium text-stellar-text"
                  >
                    {customer.name}
                  </Link>
                  <CustomerStatusBadge status={customer.status} />
                </div>
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  {customer.phone} · {customer.customerType}
                </p>
                <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-2">
                  <span className="text-xs tabular-nums text-stellar-text-muted">
                    Score {customer.riskScore}
                  </span>
                  <RiskBadge level={customer.riskLevel} />
                </div>
                <div className="mt-stellar-3 flex flex-wrap gap-stellar-2">
                  <Link to={`${basePath}/${customer.id}`} className="btn btn-ghost btn-sm">
                    Profile
                  </Link>
                  <Link to={`${basePath}/${customer.id}/risk`} className="btn btn-ghost btn-sm">
                    Risk
                  </Link>
                  {canManage && (
                    <Link
                      to={`${basePath}/${customer.id}/edit`}
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

export default memo(CustomerTable);
