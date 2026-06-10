import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import UnitStatusBadge from '../../components/products/UnitStatusBadge.jsx';
import QrDisplayModal from '../../components/products/QrDisplayModal.jsx';
import Button from '../../components/ui/Button.jsx';
import { UNIT_STATUS_OPTIONS } from '../../utils/productConstants.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { fetchBranchInventory, fetchUnitQr } from '../../services/productService.js';

function BranchInventoryPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrUnit, setQrUnit] = useState(null);
  const [qrData, setQrData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const branch = isSuperAdmin ? branchFilter : undefined;
      const { data } = await fetchBranchInventory({
        branch: branch || undefined,
        status: statusFilter || undefined,
        limit: 80,
      });
      setUnits(data.data.units);
      setSummary(data.data.summary);
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [branchFilter, statusFilter, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchBranches({ limit: 100 })
        .then(({ data }) => setBranches(data.data.branches))
        .catch(() => setBranches([]));
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShowQr = async (unit) => {
    setQrUnit(unit);
    try {
      const { data } = await fetchUnitQr(unit.id);
      setQrData(data.data.qr);
    } catch {
      setQrData({ dataUrl: unit.qrCode, payload: unit.qrPayload });
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
          Branch inventory
        </h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Live unit locations and rental status across your branch.
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-4">
          <Card variant="muted" className="!p-stellar-4">
            <p className="text-xs text-stellar-text-subtle">Total units</p>
            <p className="text-xl font-semibold tabular-nums">{summary.totalUnits}</p>
          </Card>
          {UNIT_STATUS_OPTIONS.slice(0, 3).map((o) => (
            <Card key={o.value} variant="muted" className="!p-stellar-4">
              <p className="text-xs text-stellar-text-subtle">{o.label}</p>
              <p className="text-xl font-semibold tabular-nums">
                {summary.byStatus?.[o.value] ?? 0}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-col gap-stellar-3 border-b border-stellar-border p-stellar-4 sm:flex-row">
          {isSuperAdmin && (
            <select
              className="input w-full sm:w-48"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <select
            className="input w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {UNIT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <p className="p-stellar-8 text-center text-sm text-stellar-text-muted">Loading…</p>
        ) : (
          <ul className="divide-y divide-stellar-border">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex flex-col gap-stellar-3 p-stellar-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">{unit.serialNumber}</p>
                  <p className="text-sm text-stellar-text-muted">
                    {unit.product?.name} · {unit.product?.sku}
                  </p>
                  {unit.notes ? (
                    <p className="mt-stellar-1 text-xs text-stellar-text-subtle">{unit.notes}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-stellar-2">
                  <UnitStatusBadge status={unit.status} />
                  <Button variant="secondary" size="sm" onClick={() => handleShowQr(unit)}>
                    QR
                  </Button>
                </div>
              </li>
            ))}
            {!units.length && (
              <li className="p-stellar-8 text-center text-sm text-stellar-text-muted">
                No units found
              </li>
            )}
          </ul>
        )}
      </Card>

      <QrDisplayModal
        unit={qrUnit}
        qr={qrData}
        open={Boolean(qrUnit)}
        onClose={() => {
          setQrUnit(null);
          setQrData(null);
        }}
      />
    </div>
  );
}

export default BranchInventoryPage;
