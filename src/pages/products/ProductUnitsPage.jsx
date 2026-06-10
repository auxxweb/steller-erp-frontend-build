import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ProductDetailShell from '../../components/products/ProductDetailShell.jsx';
import ProductUnitTable from '../../components/products/ProductUnitTable.jsx';
import UnitFormModal from '../../components/products/UnitFormModal.jsx';
import QrDisplayModal from '../../components/products/QrDisplayModal.jsx';
import { UNIT_STATUS_OPTIONS } from '../../utils/productConstants.js';
import { useCanManageProducts } from '../../hooks/useProductBasePath.js';
import useQrBasePath from '../../hooks/useQrBasePath.js';
import {
  fetchProductUnits,
  createProductUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
  fetchUnitQr,
} from '../../services/productService.js';

function ProductUnitsPage() {
  const { id: productId } = useParams();
  const canManage = useCanManageProducts();
  const qrPath = useQrBasePath();

  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [qrUnit, setQrUnit] = useState(null);
  const [qrData, setQrData] = useState(null);
  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchProductUnits(productId, {
        page,
        limit: 15,
        status: statusFilter || undefined,
      });
      setUnits(data.data.units);
      setPagination(data.data.pagination);
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [productId, page, statusFilter]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleCreateOrUpdate = async (values) => {
    setFormLoading(true);
    try {
      if (editUnit) {
        await updateUnit(editUnit.id, {
          condition: values.condition,
          status: values.status,
          notes: values.notes,
          images: values.images,
        });
      } else {
        const { data } = await createProductUnit(productId, {
          serialNumber: values.serialNumber,
          condition: values.condition,
          notes: values.notes,
        });
        setQrUnit(data.data.unit);
        setQrData({ dataUrl: data.data.unit.qrCode, payload: data.data.unit.qrPayload });
      }
      setFormOpen(false);
      setEditUnit(null);
      loadUnits();
    } finally {
      setFormLoading(false);
    }
  };

  const handleShowQr = async (unit) => {
    setQrUnit(unit);
    try {
      const { data } = await fetchUnitQr(unit.id);
      setQrData(data.data.qr);
    } catch {
      setQrData({ dataUrl: unit.qrCode, payload: unit.qrPayload });
    }
  };

  const handleStatusQuick = async (unit) => {
    const next = window.prompt(
      `New status for ${unit.serialNumber}:\n${UNIT_STATUS_OPTIONS.map((o) => o.value).join(', ')}`,
      unit.status,
    );
    if (!next) return;
    await updateUnitStatus(unit.id, { status: next });
    loadUnits();
  };

  const handleRetire = async (unit) => {
    if (!window.confirm(`Retire unit ${unit.serialNumber}?`)) return;
    await deleteUnit(unit.id);
    loadUnits();
  };

  return (
    <ProductDetailShell productId={productId}>
      {() => (
        <>
          <div className="flex flex-col gap-stellar-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-stellar-text">Serial units</h2>
            <div className="flex flex-wrap gap-stellar-2">
              <Link to={qrPath} className="btn btn-secondary btn-md">
                Open scanner
              </Link>
              {canManage && (
                <Button
                  onClick={() => {
                    setEditUnit(null);
                    setFormOpen(true);
                  }}
                >
                  Add unit
                </Button>
              )}
            </div>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="border-b border-stellar-border p-stellar-4">
              <select
                className="input w-full sm:w-48"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                {UNIT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <ProductUnitTable
              units={units}
              loading={loading}
              canManage={canManage}
              onShowQr={handleShowQr}
              onEdit={(u) => {
                setEditUnit(u);
                setFormOpen(true);
              }}
              onStatusChange={handleStatusQuick}
              onRetire={canManage ? handleRetire : undefined}
            />
            <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
          </Card>

          <UnitFormModal
            open={formOpen}
            unit={editUnit}
            productId={productId}
            loading={formLoading}
            onSubmit={handleCreateOrUpdate}
            onClose={() => {
              setFormOpen(false);
              setEditUnit(null);
            }}
          />

          <QrDisplayModal
            unit={qrUnit}
            qr={qrData}
            open={Boolean(qrUnit)}
            onClose={() => {
              setQrUnit(null);
              setQrData(null);
            }}
          />

        </>
      )}
    </ProductDetailShell>
  );
}

export default ProductUnitsPage;
