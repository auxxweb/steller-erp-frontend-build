import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import BranchStatusBadge from '../../components/branches/BranchStatusBadge.jsx';
import { fetchMyBranch, fetchBranchDashboard } from '../../services/branchService.js';
import useAuth from '../../hooks/useAuth.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function BranchAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const mine = await fetchMyBranch();
        const branchId = mine.data.data.branch.id;
        const dashboard = await fetchBranchDashboard(branchId);
        if (!cancelled) setData(dashboard.data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Unable to load branch dashboard'));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading your branch…</p>;
  }

  if (!data) {
    return (
      <div className="animate-fade-up opacity-0-start">
        <h1 className="text-2xl font-semibold text-stellar-text">Branch dashboard</h1>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">Unable to load branch data.</p>
      </div>
    );
  }

  const { branch, stats } = data;

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <p className="text-sm text-stellar-text-muted">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
        </p>
        <div className="mt-stellar-1 flex flex-wrap items-center gap-stellar-3">
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text sm:text-3xl">
            {branch.name}
          </h1>
          <BranchStatusBadge status={branch.status} />
        </div>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Code: <code className="font-mono">{branch.code}</code>
        </p>
      </div>

      <div className="grid gap-stellar-4 sm:grid-cols-3">
        {[
          { label: 'Team members', value: stats.staffCount },
          { label: 'Products', value: stats.productCount },
          { label: 'Customers', value: stats.customerCount },
        ].map((item) => (
          <Card key={item.label} variant="muted" className="!p-stellar-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
              {item.label}
            </p>
            <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Branch contact</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-stellar-text-muted">Phone</p>
            <p className="font-medium">{branch.phone || '—'}</p>
          </div>
          <div>
            <p className="text-stellar-text-muted">Email</p>
            <p className="font-medium">{branch.email || '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-stellar-text-muted">Address</p>
            <p className="font-medium">
              {[branch.address?.line1, branch.address?.city, branch.address?.state]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default BranchAdminDashboard;
