import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ComboStatusBadge from '../../components/combos/ComboStatusBadge.jsx';
import ComboPricingPanel from '../../components/combos/ComboPricingPanel.jsx';
import ComboAvailabilityPanel from '../../components/combos/ComboAvailabilityPanel.jsx';
import {
  COMBO_PRICING_RULE_OPTIONS,
  COMMON_INVENTORY_LABEL,
} from '../../utils/comboConstants.js';
import useComboBasePath, { useCanManageCombos } from '../../hooks/useComboBasePath.js';
import { defaultBookingWindow, fromDatetimeLocalValue } from '../../utils/rentalConstants.js';
import {
  fetchCombo,
  fetchComboPrice,
  fetchComboAvailability,
} from '../../services/comboService.js';

function ruleLabel(rule) {
  return COMBO_PRICING_RULE_OPTIONS.find((o) => o.value === rule)?.label || rule;
}

function ComboDetailPage() {
  const { id } = useParams();
  const basePath = useComboBasePath();
  const canManage = useCanManageCombos();
  const location = useLocation();

  const defaults = defaultBookingWindow();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewStartAt, setPreviewStartAt] = useState(defaults.scheduledStartAt);
  const [previewEndAt, setPreviewEndAt] = useState(defaults.scheduledEndAt);
  const [pricing, setPricing] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchCombo(id);
        if (!cancelled) setCombo(data.data.combo);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Combo not found'));
          setCombo(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const runPreview = useCallback(async () => {
    if (!id) return;
    setPreviewLoading(true);
    try {
      const params = {
        scheduledStartAt: fromDatetimeLocalValue(previewStartAt),
        scheduledEndAt: fromDatetimeLocalValue(previewEndAt),
        rateType: 'daily',
      };
      const [priceRes, availRes] = await Promise.all([
        fetchComboPrice(id, params),
        fetchComboAvailability(id, params),
      ]);
      setPricing(priceRes.data.data.pricing);
      setAvailability(availRes.data.data.availability);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Preview failed'));
    } finally {
      setPreviewLoading(false);
    }
  }, [id, previewStartAt, previewEndAt]);

  useEffect(() => {
    if (!combo) return;
    runPreview();
  }, [combo?.id]);

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading combo…</p>;
  }

  if (!loading && !combo) {
    return (
      <div className="space-y-stellar-4">
        <Link to={basePath} className="text-sm text-stellar-accent">
          ← Back to combos
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={basePath} className="text-sm text-stellar-text-muted">
            ← Combos
          </Link>
          <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
            <h1 className="text-2xl font-semibold text-stellar-text">{combo.name}</h1>
            <ComboStatusBadge status={combo.status} />
          </div>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {combo.code}
            {combo.isShared
              ? ` · ${COMMON_INVENTORY_LABEL}`
              : combo.branch?.name
                ? ` · ${combo.branch.name}`
                : ''}
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
        )}
      </div>

      

      <div className="grid gap-stellar-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Bundle contents</Card.Title>
          </Card.Header>
          <Card.Content>
            {combo.description && (
              <p className="mb-stellar-4 text-sm text-stellar-text-muted">{combo.description}</p>
            )}
            <p className="text-sm">
              <span className="text-stellar-text-muted">Pricing rule:</span>{' '}
              {ruleLabel(combo.pricingRule)}
            </p>
            <ul className="mt-stellar-4 divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
              {combo.items?.map((item) => (
                <li
                  key={item.product?.id || item.product}
                  className="flex justify-between gap-stellar-2 p-stellar-3 text-sm"
                >
                  <span>
                    {item.product?.name || 'Product'}
                    {item.product?.sku && (
                      <span className="text-stellar-text-muted"> ({item.product.sku})</span>
                    )}
                  </span>
                  <span className="tabular-nums text-stellar-text-muted">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Price & availability</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-stellar-4">
            <div className="grid gap-stellar-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">From</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={previewStartAt}
                  onChange={(e) => setPreviewStartAt(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Until</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={previewEndAt}
                  onChange={(e) => setPreviewEndAt(e.target.value)}
                />
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={runPreview} disabled={previewLoading}>
              {previewLoading ? 'Calculating…' : 'Recalculate'}
            </Button>
            <ComboPricingPanel pricing={pricing} loading={previewLoading} />
            <ComboAvailabilityPanel availability={availability} loading={previewLoading} />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default ComboDetailPage;
