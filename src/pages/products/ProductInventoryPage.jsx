import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ProductDetailShell from '../../components/products/ProductDetailShell.jsx';
import ProductAvailabilityPanel from '../../components/products/ProductAvailabilityPanel.jsx';
import ProductUnitTable from '../../components/products/ProductUnitTable.jsx';
import QrDisplayModal from '../../components/products/QrDisplayModal.jsx';
import {
  fetchProductAvailability,
  fetchAllProductUnits,
  fetchUnitQr,
} from '../../services/productService.js';
import { useCanManageProducts } from '../../hooks/useProductBasePath.js';

function ProductInventoryPage() {
  const { id: productId } = useParams();
  const canManage = useCanManageProducts();
  const [availability, setAvailability] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrUnit, setQrUnit] = useState(null);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [availRes, units] = await Promise.all([
          fetchProductAvailability(productId),
          fetchAllProductUnits(productId),
        ]);
        if (!cancelled) {
          setAvailability(availRes.data.data.availability);
          setUnits(units);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

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
    <ProductDetailShell productId={productId}>
      {() => (
        <div className="space-y-stellar-6">
          <h2 className="text-lg font-semibold text-stellar-text">Product inventory</h2>
          <ProductAvailabilityPanel availability={availability} loading={loading} />
          <Card className="!p-0 overflow-hidden">
            <div className="border-b border-stellar-border p-stellar-4">
              <p className="text-sm text-stellar-text-muted">
                All serial units for this product
              </p>
            </div>
            <ProductUnitTable
              units={units}
              loading={loading}
              canManage={canManage}
              onShowQr={handleShowQr}
            />
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
      )}
    </ProductDetailShell>
  );
}

export default ProductInventoryPage;
