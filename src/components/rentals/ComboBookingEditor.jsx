import Button from '../ui/Button.jsx';
import NumberInput from '../ui/NumberInput.jsx';
import { formatCurrency } from '../../utils/format.js';
import { resolveUnitRate } from '../../utils/rentalPricing.js';

/**
 * Edit combo composition for a booking: reduce qty, remove products, show combo rates.
 */
function ComboBookingEditor({
  lines = [],
  onChange,
  rateType = 'daily',
  durationDays = 1,
}) {
  if (!lines.length) {
    return (
      <p className="text-sm text-stellar-text-muted">
        All combo products were removed. Add products below or restore the combo.
      </p>
    );
  }

  const mult =
    rateType === 'weekly'
      ? Math.ceil(Math.max(1, durationDays) / 7)
      : rateType === 'monthly'
        ? Math.ceil(Math.max(1, durationDays) / 30)
        : Math.max(1, durationDays);

  const updateQty = (index, quantity) => {
    const line = lines[index];
    const nextQty = Math.min(line.maxQuantity, Math.max(1, Number(quantity) || 1));
    onChange(lines.map((l, i) => (i === index ? { ...l, quantity: nextQty } : l)));
  };

  const removeLine = (index) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const comboSubtotal = lines.reduce((sum, line) => {
    const unitRate = Number(resolveUnitRate(line.pricing || {}, rateType)) || 0;
    return sum + unitRate * line.quantity * mult;
  }, 0);

  return (
    <div className="space-y-stellar-3">
      <div className="flex items-center justify-between gap-stellar-2">
        <p className="text-sm font-medium text-stellar-text">Combo products</p>
        <p className="text-xs text-stellar-text-muted">
          Remove or reduce items — price uses combo rates
        </p>
      </div>

      <ul className="space-y-stellar-2">
        {lines.map((line, index) => {
          const unitRate = Number(resolveUnitRate(line.pricing || {}, rateType)) || 0;
          const lineTotal = unitRate * line.quantity * mult;
          return (
            <li
              key={line.key || `${line.product}-${index}`}
              className="rounded-stellar-lg border border-stellar-border p-stellar-3"
            >
              <div className="flex flex-col gap-stellar-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stellar-text">{line.productName}</p>
                  <p className="text-xs text-stellar-text-muted">
                    Combo rate {formatCurrency(unitRate)} · line {formatCurrency(lineTotal)}
                    {line.maxQuantity > 1 ? ` · max ${line.maxQuantity}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-stellar-2">
                  <div className="w-24">
                    <NumberInput
                      min={1}
                      max={line.maxQuantity}
                      allowDecimal={false}
                      value={line.quantity}
                      onChange={(n) => updateQty(index, n)}
                      disabled={line.maxQuantity <= 1}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="!text-stellar-danger"
                    onClick={() => removeLine(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-sm font-medium text-stellar-text">
        Combo products subtotal:{' '}
        <span className="tabular-nums text-stellar-accent">{formatCurrency(comboSubtotal)}</span>
      </p>
    </div>
  );
}

export default ComboBookingEditor;
