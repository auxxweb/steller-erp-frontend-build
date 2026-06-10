import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import useTransferBasePath, { useCanManageTransfers } from '../../hooks/useTransferBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { fetchBranchInventory } from '../../services/productService.js';
import { createTransfer } from '../../services/transferService.js';

function TransferCreatePage() {
  const basePath = useTransferBasePath();
  const navigate = useNavigate();
  const canManage = useCanManageTransfers();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [units, setUnits] = useState([]);
  const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
    if (!canManage) navigate(basePath, { replace: true });
  }, [canManage, basePath, navigate]);

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches))
      .catch(() => setBranches([]));
  }, []);

  const sourceBranch = isSuperAdmin ? fromBranch : user?.branch;

  useEffect(() => {
    if (!sourceBranch) {
      setUnits([]);
      return;
    }
    fetchBranchInventory({ branch: isSuperAdmin ? sourceBranch : undefined, status: 'available', limit: 200 })
      .then(({ data }) => {
        setUnits(
          (data.data.units || []).map((u) => ({
            ...u,
            productName: u.product?.name,
            productSku: u.product?.sku,
          })),
        );
      })
      .catch(() => setUnits([]));
  }, [sourceBranch, isSuperAdmin]);

  const toggleUnit = (unitId) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnits.length) {
      toast.error('Select at least one unit');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createTransfer({
        fromBranch: isSuperAdmin ? fromBranch : undefined,
        toBranch,
        notes: notes.trim() || undefined,
        items: selectedUnits.map((productUnit) => ({ productUnit })),
      });
      navigate(`${basePath}/${data.data.transfer.id}`, {
        state: { message: 'Transfer request created' },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={`${basePath}/requests`} className="text-sm text-stellar-text-muted">
          ← Transfer requests
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">New transfer request</h1>
      </div>

      <TransferNav />

      <form onSubmit={handleSubmit} className="space-y-stellar-6">
        <Card>
          <Card.Header>
            <Card.Title>Branches</Card.Title>
          </Card.Header>
          <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
            {isSuperAdmin && (
              <div className="form-group">
                <label className="form-label">From branch</label>
                <select
                  className="input"
                  value={fromBranch}
                  onChange={(e) => {
                    setFromBranch(e.target.value);
                    setSelectedUnits([]);
                  }}
                  required
                >
                  <option value="">Select source</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">To branch</label>
              <select
                className="input"
                value={toBranch}
                onChange={(e) => setToBranch(e.target.value)}
                required
              >
                <option value="">Select destination</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === sourceBranch}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Units to transfer</Card.Title>
            <Card.Description>Only available units at the source branch</Card.Description>
          </Card.Header>
          <Card.Content>
            {!sourceBranch && isSuperAdmin && (
              <p className="text-sm text-stellar-text-muted">Select a source branch first.</p>
            )}
            {units.length === 0 && sourceBranch && (
              <p className="text-sm text-stellar-text-muted">No available units found.</p>
            )}
            <ul className="max-h-80 space-y-stellar-2 overflow-y-auto">
              {units.map((u) => (
                <li key={u.id}>
                  <label className="flex cursor-pointer items-center gap-stellar-3 rounded-stellar-lg border border-stellar-border p-stellar-3 hover:bg-stellar-surface-muted">
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(u.id)}
                      onChange={() => toggleUnit(u.id)}
                    />
                    <span className="text-sm">
                      <span className="font-medium">{u.serialNumber}</span>
                      <span className="text-stellar-text-muted">
                        {' '}
                        · {u.productName} ({u.productSku})
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-stellar-3 text-sm text-stellar-text-muted">
              {selectedUnits.length} unit(s) selected
            </p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="input min-h-[80px] w-full resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card.Content>
        </Card>

                <div className="flex flex-col-reverse gap-stellar-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(basePath)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TransferCreatePage;
