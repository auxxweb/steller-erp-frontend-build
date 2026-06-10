import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import QrDisplayModal from '../../components/products/QrDisplayModal.jsx';
import { fetchBranches } from '../../services/branchService.js';
import {
  fetchQrCatalogUnits,
  downloadQrCatalogUnitPng,
  downloadQrCatalogBulkZip,
  triggerBlobDownload,
} from '../../services/qrCatalogService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function QrCodesAdminPage() {
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [qrUnit, setQrUnit] = useState(null);
  const [downloadId, setDownloadId] = useState(null);

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data?.branches || data.data || []))
      .catch(() => setBranches([]));
  }, []);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchQrCatalogUnits({
        page,
        limit: 50,
        search: search.trim() || undefined,
        branch: branchFilter || undefined,
      });
      setUnits(data.data.units);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load QR codes'));
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, branchFilter]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleViewQr = (unit) => {
    setQrUnit({
      ...unit,
      serialNumber: unit.serialNumber,
      qrCode: unit.qrCode,
      qrPayload: unit.qrPayload,
    });
  };

  const handleDownloadOne = async (unit) => {
    setDownloadId(unit.id);
    try {
      const { data } = await downloadQrCatalogUnitPng(unit.id);
      const name = `${unit.qrPayload || unit.serialNumber || unit.id}.png`;
      triggerBlobDownload(data, name.replace(/[^a-zA-Z0-9._-]+/g, '_'));
      toast.success('QR downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Download failed'));
    } finally {
      setDownloadId(null);
    }
  };

  const handleBulkDownload = async () => {
    setBulkLoading(true);
    try {
      const { data } = await downloadQrCatalogBulkZip({
        search: search.trim() || undefined,
        branch: branchFilter || undefined,
        max: 500,
      });
      triggerBlobDownload(data, `stellar-qr-codes-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success('Bulk QR ZIP downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Bulk download failed'));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-8">
      <div className="flex flex-col gap-stellar-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">QR codes</h1>
          <p className="mt-stellar-2 text-sm leading-relaxed text-stellar-text-muted">
            All inventory unit QR codes. Each code encodes the asset ID (e.g. STLR-CAM-001).
          </p>
        </div>
        <div className="flex flex-wrap gap-stellar-3 sm:shrink-0">
          <Button variant="secondary" onClick={loadUnits} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={handleBulkDownload} disabled={bulkLoading || loading}>
            {bulkLoading ? 'Preparing ZIP…' : 'Download all (ZIP)'}
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-5 sm:p-stellar-6">
          <ListFiltersBar
            idPrefix="qr-catalog"
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search asset ID, serial, or QR payload…"
            showDateFilters={false}
            showSubmit={false}
            className="pb-stellar-2"
          >
            <div className="form-group">
              <label htmlFor="qr-catalog-branch" className="form-label">
                Branch
              </label>
              <select
                id="qr-catalog-branch"
                className="input w-full"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </ListFiltersBar>
        </div>

        <div className="p-stellar-5 sm:p-stellar-6">
          {loading ? (
            <p className="py-stellar-8 text-center text-sm text-stellar-text-muted">Loading units…</p>
          ) : units.length === 0 ? (
            <p className="py-stellar-8 text-center text-sm text-stellar-text-muted">No units found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table data-table--spacious w-full">
                <thead>
                  <tr>
                    <th>Asset ID / QR</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Serial</th>
                    <th>Branch</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td className="font-mono text-sm">{unit.qrPayload || unit.assetTag}</td>
                      <td>{unit.productName || unit.product?.name || '—'}</td>
                      <td>{unit.categoryName || '—'}</td>
                      <td className="font-mono text-sm text-stellar-text-muted">{unit.serialNumber}</td>
                      <td>{unit.branch?.code || unit.branch?.name || '—'}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-stellar-3">
                          <Button variant="ghost" size="sm" onClick={() => handleViewQr(unit)}>
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadOne(unit)}
                            disabled={downloadId === unit.id}
                          >
                            {downloadId === unit.id ? '…' : 'PNG'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar
            className="mt-stellar-8 border-t border-stellar-border pt-stellar-6"
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <QrDisplayModal
        unit={qrUnit}
        qr={qrUnit ? { dataUrl: qrUnit.qrCode, payload: qrUnit.qrPayload } : null}
        open={Boolean(qrUnit)}
        onClose={() => setQrUnit(null)}
      />
    </div>
  );
}

export default QrCodesAdminPage;
