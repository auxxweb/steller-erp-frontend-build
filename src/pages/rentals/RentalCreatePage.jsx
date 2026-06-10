import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalProductPicker from '../../components/rentals/RentalProductPicker.jsx';
import AvailabilityBars from '../../components/rentals/AvailabilityBars.jsx';
import ComboPricingPanel from '../../components/combos/ComboPricingPanel.jsx';
import ComboAvailabilityPanel from '../../components/combos/ComboAvailabilityPanel.jsx';
import useRentalBasePath, { useCanWriteRentals } from '../../hooks/useRentalBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { createCustomer } from '../../services/customerService.js';
import RentalCustomerPicker, {
  RENTAL_CUSTOMER_MODES,
} from '../../components/rentals/RentalCustomerPicker.jsx';
import { fetchProducts } from '../../services/productService.js';
import { fetchCategories } from '../../services/categoryService.js';
import { fetchCombos, fetchComboPrice } from '../../services/comboService.js';
import { COMMON_INVENTORY_LABEL } from '../../utils/comboConstants.js';
import { checkRentalAvailability, createRental } from '../../services/rentalService.js';
import {
  RENTAL_TYPE,
  RENTAL_TYPE_OPTIONS,
  defaultBookingWindow,
  directRentalPickupNow,
  fromDatetimeLocalValue,
} from '../../utils/rentalConstants.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function RentalCreatePage() {
  const basePath = useRentalBasePath();
  const navigate = useNavigate();
  const canWrite = useCanWriteRentals();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const defaults = defaultBookingWindow();
  const [rentalType, setRentalType] = useState(RENTAL_TYPE.DIRECT);
  const [bookingMode, setBookingMode] = useState('products');
  const [branch, setBranch] = useState('');
  const [customer, setCustomer] = useState('');
  const [customerMode, setCustomerMode] = useState(RENTAL_CUSTOMER_MODES.EXISTING);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [comboId, setComboId] = useState('');
  const [scheduledStartAt, setScheduledStartAt] = useState(defaults.scheduledStartAt);
  const [scheduledEndAt, setScheduledEndAt] = useState(defaults.scheduledEndAt);
  const [notes, setNotes] = useState('');
  const [reserve, setReserve] = useState(true);
  const [lines, setLines] = useState([
    { category: '', product: '', quantity: 1, rateType: 'daily', productUnit: '', key: 'line-0' },
  ]);

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [comboPricing, setComboPricing] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canWrite) navigate(basePath, { replace: true });
  }, [canWrite, basePath, navigate]);

  const isPrebook = rentalType === RENTAL_TYPE.PREBOOK;
  const isDirect = rentalType === RENTAL_TYPE.DIRECT;
  const effectiveBranchId =
    isSuperAdmin ? branch : user?.branchId || user?.branch?.id || user?.branch || '';

  useEffect(() => {
    if (isDirect) {
      setScheduledStartAt(directRentalPickupNow());
    }
  }, [isDirect]);

  useEffect(() => {
    fetchCategories({ limit: 100, status: 'active' })
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLines([{ category: '', product: '', quantity: 1, rateType: 'daily', productUnit: '', key: `line-${Date.now()}` }]);
    setAvailability(null);
  }, [rentalType]);

  useEffect(() => {
    fetchProducts({ limit: 100, status: 'active' })
      .then(({ data }) => setProducts(data.data.products))
      .catch(() => setProducts([]));
    if (isSuperAdmin) {
      fetchBranches({ limit: 100 })
        .then(({ data }) => setBranches(data.data.branches))
        .catch(() => setBranches([]));
    }
  }, []);

  useEffect(() => {
    const params = { limit: 100, status: 'active' };
    const rentalBranch = isSuperAdmin ? branch : effectiveBranchId;
    if (rentalBranch) params.branch = rentalBranch;
    fetchCombos(params)
      .then(({ data }) => setCombos(data.data.combos))
      .catch(() => setCombos([]));
  }, [isSuperAdmin, branch, effectiveBranchId]);

  const buildPayload = (customerId) => {
    const base = {
      branch: isSuperAdmin ? branch : undefined,
      customer: customerId,
      rentalType,
      scheduledStartAt: isDirect
        ? new Date().toISOString()
        : fromDatetimeLocalValue(scheduledStartAt),
      scheduledEndAt: fromDatetimeLocalValue(scheduledEndAt),
      notes: notes.trim() || undefined,
      reserve,
    };

    if (bookingMode === 'combo' && comboId) {
      return { ...base, combo: comboId };
    }

    return {
      ...base,
      items: lines
        .filter((l) => l.product)
        .map((l) => ({
          product: l.product,
          quantity: l.quantity,
          rateType: l.rateType,
          ...(l.productUnit ? { productUnit: l.productUnit } : {}),
        })),
    };
  };

  const resolveCustomerId = async () => {
    if (customer) return customer;

    if (customerMode === RENTAL_CUSTOMER_MODES.NEW) {
      if (!newCustomer.name?.trim() || !newCustomer.phone?.trim()) {
        throw new Error('Customer name and phone are required');
      }
      if (isSuperAdmin && !branch) {
        throw new Error('Select a branch before creating a customer');
      }
      const { data } = await createCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        branch: isSuperAdmin ? branch : undefined,
      });
      const id = data.data.customer.id;
      setCustomer(id);
      setCustomerMode(RENTAL_CUSTOMER_MODES.EXISTING);
      return id;
    }

    throw new Error('Select a customer or create a new one');
  };

  const handleCheckAvailability = async () => {
    setChecking(true);
    setComboPricing(null);
    try {
      validateDirectSerials();
      const customerId = await resolveCustomerId();
      const payload = buildPayload(customerId);
      const { data } = await checkRentalAvailability(payload);
      setAvailability(data.data);

      if (bookingMode === 'combo' && comboId) {
        const priceRes = await fetchComboPrice(comboId, {
          scheduledStartAt: payload.scheduledStartAt,
          scheduledEndAt: payload.scheduledEndAt,
          rateType: 'daily',
        });
        setComboPricing(priceRes.data.data.pricing);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Availability check failed'));
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const validateDirectSerials = () => {
    if (!isDirect || bookingMode !== 'products') return;
    const missing = lines.filter(
      (l) => l.product && Number(l.quantity) === 1 && !l.productUnit,
    );
    if (missing.length) {
      const names = missing
        .map((l) => products.find((p) => String(p.id) === String(l.product))?.name || 'product')
        .join(', ');
      throw new Error(`Direct rental requires a serial or QR scan for: ${names}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isComboMode && !comboId) {
        throw new Error('Select a combo bundle');
      }
      validateDirectSerials();
      const customerId = await resolveCustomerId();
      const { data } = await createRental(buildPayload(customerId));
      navigate(`${basePath}/${data.data.rental.id}`, {
        state: {
          message: isDirect
            ? 'Direct rental active — invoice is created when you process return'
            : 'Prebook created — assign serials at pickup, invoice on return',
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create booking'));
    } finally {
      setSubmitting(false);
    }
  };

  const productNames = Object.fromEntries(products.map((p) => [p.id, p.name]));
  const isComboMode = bookingMode === 'combo';

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={basePath} className="text-sm text-stellar-text-muted">
          ← Rentals
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">Create booking</h1>
      </div>

      <RentalNav />

      <form onSubmit={handleSubmit} className="space-y-stellar-6">
        <Card>
          <Card.Header>
            <Card.Title>Schedule & customer</Card.Title>
          </Card.Header>
          <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
            <div className="form-group sm:col-span-2">
              <span className="form-label">Rental type</span>
              <div className="mt-stellar-2 flex flex-wrap gap-stellar-2">
                {RENTAL_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-stellar ${
                      rentalType === opt.value
                        ? 'bg-stellar-accent text-stellar-accent-fg'
                        : 'bg-stellar-surface-muted text-stellar-text-muted hover:text-stellar-text'
                    }`}
                    onClick={() => {
                      setRentalType(opt.value);
                      setAvailability(null);
                      setComboPricing(null);
                      if (opt.value === RENTAL_TYPE.DIRECT) {
                        setScheduledStartAt(directRentalPickupNow());
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-stellar-2 text-xs text-stellar-text-muted">
                {RENTAL_TYPE_OPTIONS.find((o) => o.value === rentalType)?.description}
              </p>
            </div>
            {isSuperAdmin && (
              <div className="form-group sm:col-span-2">
                <label htmlFor="booking-branch" className="form-label">
                  Branch
                </label>
                <select
                  id="booking-branch"
                  className="input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group sm:col-span-2">
              <span className="form-label">Customer</span>
              <div className="mt-stellar-1">
                <RentalCustomerPicker
                  branchId={effectiveBranchId}
                  disabled={isSuperAdmin && !branch}
                  value={customer}
                  onChange={(id) => setCustomer(id)}
                  mode={customerMode}
                  onModeChange={setCustomerMode}
                  newCustomer={newCustomer}
                  onNewCustomerChange={setNewCustomer}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="start-at" className="form-label">
                {isDirect ? 'Rental starts' : 'Scheduled pickup'}
              </label>
              {isDirect ? (
                <input
                  id="start-at"
                  type="text"
                  className="input bg-stellar-surface-muted"
                  value={scheduledStartAt ? new Date(scheduledStartAt).toLocaleString() : 'Now'}
                  readOnly
                />
              ) : (
                <input
                  id="start-at"
                  type="datetime-local"
                  className="input"
                  value={scheduledStartAt}
                  onChange={(e) => setScheduledStartAt(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="end-at" className="form-label">
                Return by
              </label>
              <input
                id="end-at"
                type="datetime-local"
                className="input"
                value={scheduledEndAt}
                onChange={(e) => setScheduledEndAt(e.target.value)}
                required
              />
            </div>
            <label className="flex items-center gap-stellar-2 sm:col-span-2 text-sm">
              <input
                type="checkbox"
                checked={reserve}
                onChange={(e) => setReserve(e.target.checked)}
                className="h-4 w-4 accent-stellar-accent"
              />
              Reserve inventory immediately (locks units)
            </label>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{isComboMode ? 'Combo bundle' : 'Products'}</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-stellar-4">
            <div className="flex flex-wrap gap-stellar-2">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  !isComboMode
                    ? 'bg-stellar-accent text-white'
                    : 'bg-stellar-surface-muted text-stellar-text-muted'
                }`}
                onClick={() => {
                  setBookingMode('products');
                  setAvailability(null);
                  setComboPricing(null);
                }}
              >
                Individual products
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  isComboMode
                    ? 'bg-stellar-accent text-white'
                    : 'bg-stellar-surface-muted text-stellar-text-muted'
                }`}
                onClick={() => {
                  setBookingMode('combo');
                  setAvailability(null);
                  setComboPricing(null);
                }}
              >
                Combo bundle
              </button>
            </div>
            {isPrebook && isComboMode && (
              <p className="text-xs text-stellar-text-muted">
                Serial numbers are assigned at pickup; the combo reserves all included products for
                your scheduled dates.
              </p>
            )}

            {isComboMode ? (
              <div className="form-group">
                <label htmlFor="booking-combo" className="form-label">
                  Select combo
                </label>
                <select
                  id="booking-combo"
                  className="input"
                  value={comboId}
                  onChange={(e) => setComboId(e.target.value)}
                  required
                >
                  <option value="">Choose a combo</option>
                  {combos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                      {c.isShared ? ` · ${COMMON_INVENTORY_LABEL}` : ''} ·{' '}
                      {c.items?.length ?? 0} products
                    </option>
                  ))}
                </select>
                {comboId && (
                  <ul className="mt-stellar-3 space-y-stellar-1 text-sm text-stellar-text-muted">
                    {combos
                      .find((c) => c.id === comboId)
                      ?.items?.map((item) => (
                        <li key={item.product?.id || item.product}>
                          {item.product?.name || 'Product'} × {item.quantity}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ) : (
              <RentalProductPicker
                categories={categories}
                products={products}
                lines={lines}
                onChange={setLines}
                isPrebook={isPrebook}
                crossBranch
              />
            )}

            <div className="flex flex-col gap-stellar-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                disabled={checking}
                onClick={handleCheckAvailability}
              >
                {checking ? 'Checking…' : 'Check availability'}
              </Button>
            </div>

            {availability && (
              <div className="mt-stellar-4 space-y-stellar-4">
                <p
                  className={`text-sm font-medium ${
                    availability.available ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {availability.available
                    ? isComboMode
                      ? 'Combo is available for selected dates'
                      : 'All products available for selected dates'
                    : isComboMode
                      ? 'Combo is not fully available'
                      : 'Some products are not available'}
                </p>

                {isComboMode && availability.combo && (
                  <ComboAvailabilityPanel availability={availability.combo} />
                )}

                {isComboMode && comboPricing && (
                  <div>
                    <p className="mb-stellar-2 text-sm font-medium text-stellar-text">
                      Combo pricing
                    </p>
                    <ComboPricingPanel pricing={comboPricing} />
                  </div>
                )}

                {!isComboMode && availability.products?.length > 0 && (
                  <AvailabilityBars
                    products={availability.products}
                    productNames={productNames}
                  />
                )}
              </div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="form-group">
              <label htmlFor="booking-notes" className="form-label">
                Notes
              </label>
              <textarea
                id="booking-notes"
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
            {submitting ? 'Creating…' : 'Create booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RentalCreatePage;
