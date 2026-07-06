import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import QrSerialImage from '../../components/qr/QrSerialImage.jsx';
import { buildUnitQrScanPayload } from '../../utils/qrPayload.js';
import { fetchBranches } from '../../services/branchService.js';
import {
  fetchQrCatalogUnits,
  downloadQrCatalogBulkZip,
  triggerBlobDownload,
} from '../../services/qrCatalogService.js';
import { groupUnitsByCategoryProduct } from '../../utils/groupQrUnits.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { formatBranchOptionLabel } from '../../utils/branchHelpers.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

const CATALOG_PAGE_SIZE = 200;

async function fetchAllCatalogUnits(params) {
  const all = [];
  let page = 1;
  let pages = 1;

  do {
    const { data } = await fetchQrCatalogUnits({
      ...params,
      page,
      limit: CATALOG_PAGE_SIZE,
    });
    all.push(...(data.data.units || []));
    pages = data.data.pagination?.pages || 1;
    page += 1;
  } while (page <= pages);

  return all;
}

function QrCodesAdminPage() {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data?.branches || data.data || []))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAllCatalogUnits({
        search: debouncedSearch.trim() || undefined,
        branch: branchFilter || undefined,
      });
      setUnits(list);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load QR codes'));
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, branchFilter]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const grouped = useMemo(() => groupUnitsByCategoryProduct(units), [units]);

  const handleBulkDownload = async () => {
    setBulkLoading(true);
    try {
      const { data } = await downloadQrCatalogBulkZip({
        search: search.trim() || undefined,
        branch: branchFilter || undefined,
        max: Math.max(units.length, 500),
      });
      triggerBlobDownload(data, `product-qr-codes-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success('Bulk QR ZIP downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Bulk download failed'));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title font-semibold tracking-tight text-stellar-text">
            Product QR codes
          </h1>
          <p className="mt-stellar-2 text-sm leading-relaxed text-stellar-text-muted">
            QR codes grouped by category and product. Each code encodes a scannable unit ID.
          </p>
        </div>
        <div className="flex flex-wrap gap-stellar-3 sm:shrink-0">
          <Button variant="secondary" onClick={loadUnits} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={handleBulkDownload} disabled={bulkLoading || loading || units.length === 0}>
            {bulkLoading ? 'Preparing ZIP…' : 'Download all (ZIP)'}
          </Button>
        </div>
      </div>

      <Card className="!p-stellar-4 sm:!p-stellar-5">
        <ListFiltersBar
          idPrefix="qr-catalog"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search serial number…"
          showDateFilters={false}
          showSubmit={false}
        >
          <SearchableSelect
            id="qr-catalog-branch"
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={withEmptyOption(
              toSelectOptions(branches, {
                getLabel: (b) => formatBranchOptionLabel(b),
                getKeywords: (b) => `${b.name} ${b.code}`,
              }),
              'All branches',
            )}
          />
        </ListFiltersBar>
      </Card>

      {loading ? (
        <Card className="!p-stellar-8 text-center">
          <p className="text-sm text-stellar-text-muted">Loading QR codes…</p>
        </Card>
      ) : units.length === 0 ? (
        <Card className="!p-stellar-8 text-center">
          <p className="text-sm text-stellar-text-muted">No units found.</p>
        </Card>
      ) : (
        <div className="space-y-stellar-8">
          {grouped.map((section) => (
            <section key={section.category}>
              <h2 className="border-b border-stellar-border pb-stellar-2 text-lg font-semibold text-stellar-text">
                {section.category}
              </h2>

              <div className="mt-stellar-5 space-y-stellar-6">
                {section.products.map((group) => (
                  <div key={`${section.category}-${group.product}`}>
                    <h3 className="text-sm font-semibold text-stellar-text">{group.product}</h3>

                    <ul className="mt-stellar-3 grid grid-cols-2 gap-stellar-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {group.items.map((unit) => (
                        <li
                          key={unit.id}
                          className="flex flex-col items-center rounded-stellar-lg border border-stellar-border bg-stellar-surface p-stellar-3 text-center"
                        >
                          <QrSerialImage
                            payload={buildUnitQrScanPayload(unit.id)}
                            size={120}
                          />
                          <p className="mt-stellar-2 w-full truncate font-mono text-xs font-medium text-stellar-text">
                            {unit.serialNumber || '—'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default QrCodesAdminPage;
