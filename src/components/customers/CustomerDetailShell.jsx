import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerStatusBadge from './CustomerStatusBadge.jsx';
import RiskBadge from './RiskBadge.jsx';
import CustomerSubNav from './CustomerSubNav.jsx';
import { fetchCustomer } from '../../services/customerService.js';
import useCustomerBasePath, { useCanManageCustomers } from '../../hooks/useCustomerBasePath.js';
import { CUSTOMER_TYPE } from '../../utils/customerConstants.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function CustomerDetailShell({ customerId, children, toast: initialToast }) {
  const basePath = useCustomerBasePath();
  const canManage = useCanManageCustomers();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (initialToast) {
      toast.success(initialToast);
    }
  }, [initialToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const { data } = await fetchCustomer(customerId);
        if (!cancelled) setCustomer(data.data.customer);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Customer not found'));
          setLoadFailed(true);
          setCustomer(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const refresh = async () => {
    const { data } = await fetchCustomer(customerId);
    setCustomer(data.data.customer);
    return data.data.customer;
  };

  const setToast = (msg) => {
    if (msg) toast.success(msg);
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading customer…</p>;
  }

  if (loadFailed || !customer) {
    return (
      <div>
        <Link to={basePath} className="mt-stellar-4 inline-block text-sm">
          ← Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to={basePath} className="text-sm text-stellar-text-muted hover:text-stellar-text">
            ← Customers
          </Link>
          <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
            <h1 className="text-xl font-semibold tracking-tight text-stellar-text sm:text-2xl">
              {customer.name}
            </h1>
            <CustomerStatusBadge status={customer.status} />
            <RiskBadge level={customer.riskLevel} />
          </div>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {customer.phone}
            {customer.customerType === CUSTOMER_TYPE.BUSINESS && customer.company && (
              <> · {customer.company}</>
            )}
            {customer.branch?.name && <> · {customer.branch.name}</>}
          </p>
        </div>
        {canManage && (
          <Link
            to={`${basePath}/${customerId}/edit`}
            className="btn btn-secondary btn-md w-full sm:w-auto"
          >
            Edit customer
          </Link>
        )}
      </div>

      <CustomerSubNav basePath={basePath} customerId={customerId} />

      {typeof children === 'function'
        ? children({ customer, refresh, setToast })
        : children}
    </div>
  );
}

export default CustomerDetailShell;
