import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import BranchStatusBadge from '../../components/branches/BranchStatusBadge.jsx';
import DeleteBranchModal from '../../components/branches/DeleteBranchModal.jsx';
import { fetchBranchDashboard, deleteBranch } from '../../services/branchService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-stellar-1 sm:grid-cols-3 sm:gap-stellar-4">
      <dt className="text-sm font-medium text-stellar-text-muted">{label}</dt>
      <dd className="text-sm text-stellar-text sm:col-span-2">{children}</dd>
    </div>
  );
}

function formatAddress(address) {
  if (!address) return '—';
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
  return lines.length ? (
    <address className="not-italic">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </address>
  ) : (
    '—'
  );
}

function BranchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.message, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchBranchDashboard(id);
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load branch'));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await deleteBranch(id);
      navigate('/admin/branches', { state: { message: data.message } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading branch dashboard…</p>;
  }

  if (!data) {
    return (
      <div>
        <Link to="/admin/branches" className="mt-stellar-4 inline-block text-sm">
          ← Back to branches
        </Link>
      </div>
    );
  }

  const { branch, stats } = data;

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/branches"
            className="text-sm text-stellar-text-muted hover:text-stellar-text"
          >
            ← Branches
          </Link>
          <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
            <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
              {branch.name}
            </h1>
            <BranchStatusBadge status={branch.status} />
            <code className="rounded bg-stellar-surface-muted px-2 py-0.5 text-sm">
              {branch.code}
            </code>
          </div>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Branch dashboard and overview
          </p>
        </div>
        <div className="flex gap-stellar-2">
          <Link
            to={`/admin/branches/${id}/edit`}
            className="btn btn-secondary btn-md"
          >
            Edit
          </Link>
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-stellar-4 sm:grid-cols-3">
        {[
          { label: 'Staff', value: stats.staffCount },
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
          <Card.Title>Branch information</Card.Title>
        </Card.Header>
        <Card.Content>
          <dl className="space-y-stellar-4">
            <DetailRow label="Manager">
              {branch.manager?.name || '—'}
              {branch.manager?.email && (
                <span className="block text-stellar-text-muted">
                  {branch.manager.email}
                </span>
              )}
            </DetailRow>
            <DetailRow label="Phone">{branch.phone || '—'}</DetailRow>
            <DetailRow label="Email">{branch.email || '—'}</DetailRow>
            <DetailRow label="Address">{formatAddress(branch.address)}</DetailRow>
          </dl>
        </Card.Content>
      </Card>

      <DeleteBranchModal
        branch={branch}
        open={showDelete}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

export default BranchDetailPage;
