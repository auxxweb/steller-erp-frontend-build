import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import NumberInput from '../../components/ui/NumberInput.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import ComboPricingPanel from '../../components/combos/ComboPricingPanel.jsx';
import ComboUnitPicker from '../../components/rentals/ComboUnitPicker.jsx';
import ComboBookingEditor from '../../components/rentals/ComboBookingEditor.jsx';
import RentalProductPicker from '../../components/rentals/RentalProductPicker.jsx';
import AvailabilityBars from '../../components/rentals/AvailabilityBars.jsx';
import useRentalBasePath, { useCanWriteRentals } from '../../hooks/useRentalBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { formatBranchOptionLabel } from '../../utils/branchHelpers.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';
import { createCustomer, lookupCustomerIdentity } from '../../services/customerService.js';
import RentalCustomerPicker, {
  RENTAL_CUSTOMER_MODES,
} from '../../components/rentals/RentalCustomerPicker.jsx';
import { fetchAllProducts } from '../../services/productService.js';
import { fetchCategories } from '../../services/categoryService.js';
import { fetchCombos } from '../../services/comboService.js';
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
import { inferComboRateType } from '../../utils/comboFormHelpers.js';
import {
  buildComboCompositionFromCombo,
  buildComboUnitSlots,
  comboSlotsToPayload,
} from '../../utils/comboUnitHelpers.js';
import { computeAdvanceRequirement } from '../../utils/advancePayment.js';
import { computeDurationDays, resolveUnitRate } from '../../utils/rentalPricing.js';
import { formatCurrency } from '../../utils/format.js';

function preserveComboSlots(composition, prevSlots = []) {
  const next = buildComboUnitSlots(composition);
  const prevByKey = new Map(prevSlots.map((s) => [s.slotKey, s.productUnit]));
  return next.map((s) => ({
    ...s,
    productUnit: prevByKey.get(s.slotKey) || '',
  }));
}

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
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [skipAdvancePayment, setSkipAdvancePayment] = useState(false);
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
  const [comboComposition, setComboComposition] = useState([]);
  const [comboExtraLines, setComboExtraLines] = useState([]);
  const [comboUnitSlots, setComboUnitSlots] = useState([]);
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
    fetchAllProducts({ status: 'active' })
      .then(setProducts)
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

  const handleProductDiscovered = (product) => {
    if (!product?.id) return;
    setProducts((prev) => {
      if (prev.some((p) => String(p.id) === String(product.id))) return prev;
      return [...prev, product];
    });
  };

  const selectedCombo = combos.find((c) => c.id === comboId);
  const isComboMode = bookingMode === 'combo';
  const comboRateType = inferComboRateType(selectedCombo?.pricing || {});

  const bookingDurationDays = useMemo(() => {
    const start = isDirect ? new Date().toISOString() : fromDatetimeLocalValue(scheduledStartAt);
    const end = fromDatetimeLocalValue(scheduledEndAt);
    return computeDurationDays(start, end);
  }, [isDirect, scheduledStartAt, scheduledEndAt]);

  useEffect(() => {
    if (!comboId) {
      setComboComposition([]);
      setComboExtraLines([]);
      setComboUnitSlots([]);
      setComboPricing(null);
      setAvailability(null);
      return;
    }
    const combo = combos.find((c) => c.id === comboId);
    const composition = buildComboCompositionFromCombo(combo);
    setComboComposition(composition);
    setComboExtraLines([]);
    setComboUnitSlots(buildComboUnitSlots(composition));
    setAvailability(null);
    setComboPricing(null);
  }, [comboId, rentalType, combos]);

  const handleComboCompositionChange = (next) => {
    setComboComposition(next);
    setComboUnitSlots((prev) => preserveComboSlots(next, prev));
    setAvailability(null);
    setComboPricing(null);
  };

  const adjustedComboPricing = useMemo(() => {
    if (!isComboMode || !comboId) return null;
    const mult =
      comboRateType === 'weekly'
        ? Math.ceil(bookingDurationDays / 7)
        : comboRateType === 'monthly'
          ? Math.ceil(bookingDurationDays / 30)
          : bookingDurationDays;

    const comboLines = comboComposition.map((line) => {
      const unitRate = Number(resolveUnitRate(line.pricing || {}, comboRateType)) || 0;
      const lineSubtotal = Math.round(unitRate * line.quantity * mult * 100) / 100;
      return {
        productId: line.product,
        productName: line.productName,
        quantity: line.quantity,
        unitRate,
        lineSubtotal,
        source: 'combo',
      };
    });

    const extraPricingLines = comboExtraLines
      .filter((l) => l.product)
      .map((line) => {
        const product = products.find((p) => String(p.id) === String(line.product));
        const rateType = line.rateType || 'daily';
        const unitRate =
          Number(resolveUnitRate(product?.pricing?.individual || product?.pricing, rateType)) || 0;
        const lineMult =
          rateType === 'weekly'
            ? Math.ceil(bookingDurationDays / 7)
            : rateType === 'monthly'
              ? Math.ceil(bookingDurationDays / 30)
              : bookingDurationDays;
        const lineSubtotal = Math.round(unitRate * (line.quantity || 1) * lineMult * 100) / 100;
        return {
          productId: line.product,
          productName: product?.name || 'Extra product',
          quantity: line.quantity || 1,
          unitRate,
          lineSubtotal,
          source: 'extra',
        };
      });

    const lines = [...comboLines, ...extraPricingLines];
    const bundleSubtotal = Math.round(lines.reduce((s, l) => s + l.lineSubtotal, 0) * 100) / 100;
    const bundleRate = mult > 0 ? Math.round((bundleSubtotal / mult) * 100) / 100 : bundleSubtotal;
    return {
      rateType: comboRateType,
      durationDays: bookingDurationDays,
      lines,
      bundleRate,
      perDay: bundleRate,
      bundleSubtotal,
      total: bundleSubtotal,
    };
  }, [
    isComboMode,
    comboId,
    comboComposition,
    comboExtraLines,
    products,
    comboRateType,
    bookingDurationDays,
  ]);

  const scheduleForAdvance = useMemo(
    () => ({
      scheduledStartAt: isDirect
        ? new Date().toISOString()
        : fromDatetimeLocalValue(scheduledStartAt),
      scheduledEndAt: fromDatetimeLocalValue(scheduledEndAt),
    }),
    [isDirect, scheduledStartAt, scheduledEndAt],
  );

  const advanceRequirement = useMemo(
    () =>
      computeAdvanceRequirement({
        products,
        lines: isComboMode ? comboExtraLines : lines,
        comboItems: isComboMode ? comboComposition : [],
        ...scheduleForAdvance,
      }),
    [products, lines, isComboMode, comboComposition, comboExtraLines, scheduleForAdvance],
  );

  useEffect(() => {
    setSkipAdvancePayment(false);
  }, [lines, comboId, bookingMode, comboComposition, comboExtraLines]);

  const advancePaymentBlocked =
    advanceRequirement.hasRequired &&
    !skipAdvancePayment &&
    advanceAmount < advanceRequirement.required;

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
      ...(skipAdvancePayment ? { skipAdvancePayment: true } : {}),
      ...(advanceAmount > 0 ? { deposit: advanceAmount, advancePaid: advanceAmount } : {}),
    };

    if (bookingMode === 'combo' && comboId) {
      const payload = {
        ...base,
        combo: comboId,
        rateType: comboRateType,
        comboItems: comboComposition.map((l) => ({
          product: l.product,
          quantity: l.quantity,
        })),
      };
      if (!isPrebook && comboUnitSlots.length) {
        payload.comboUnits = comboSlotsToPayload(comboUnitSlots);
      }
      const extras = comboExtraLines
        .filter((l) => l.product)
        .map((l) => ({
          product: l.product,
          quantity: l.quantity,
          rateType: l.rateType || 'daily',
          ...(l.productUnit ? { productUnit: l.productUnit } : {}),
        }));
      if (extras.length) payload.items = extras;
      return payload;
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

  const selectExistingCustomer = (existing) => {
    setCustomer(existing.id);
    setCustomerMode(RENTAL_CUSTOMER_MODES.EXISTING);
    toast.info(`Existing customer selected: ${existing.name}`);
    return existing.id;
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

      const phone = newCustomer.phone.trim();
      const { data: lookupData } = await lookupCustomerIdentity({ phone });
      const existing = lookupData.data.phoneMatch;
      if (existing?.id) {
        return selectExistingCustomer(existing);
      }

      try {
        const { data } = await createCustomer({
          name: newCustomer.name.trim(),
          phone,
          branch: isSuperAdmin ? branch : undefined,
        });
        const id = data.data.customer.id;
        setCustomer(id);
        setCustomerMode(RENTAL_CUSTOMER_MODES.EXISTING);
        return id;
      } catch (err) {
        if (err.response?.status === 409) {
          const { data: retryData } = await lookupCustomerIdentity({ phone });
          const retryMatch = retryData.data.phoneMatch;
          if (retryMatch?.id) {
            return selectExistingCustomer(retryMatch);
          }
        }
        throw err;
      }
    }

    throw new Error('Select a customer or create a new one');
  };

  const handleCheckAvailability = async () => {
    setChecking(true);
    setComboPricing(null);
    try {
      if (isComboMode && !comboId) {
        throw new Error('Select a combo bundle');
      }
      if (isComboMode && !comboComposition.length && !comboExtraLines.some((l) => l.product)) {
        throw new Error('Keep at least one combo product or add an extra product');
      }
      const customerId = await resolveCustomerId();
      const payload = buildPayload(customerId);
      const { data } = await checkRentalAvailability(payload);
      setAvailability(data.data);

      if (!data.data?.available) {
        const firstError = data.data?.products?.find((p) => !p.isAvailable && p.error)?.error;
        if (firstError) toast.error(firstError);
      }

      if (bookingMode === 'combo' && comboId) {
        setComboPricing(adjustedComboPricing);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Availability check failed'));
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const validateDirectSerials = () => {
    if (!isDirect) return;
    if (bookingMode === 'products') {
      const missing = lines.filter(
        (l) => l.product && Number(l.quantity) === 1 && !l.productUnit,
      );
      if (missing.length) {
        const names = missing
          .map((l) => products.find((p) => String(p.id) === String(l.product))?.name || 'product')
          .join(', ');
        throw new Error(`Direct rental requires a serial or QR scan for: ${names}`);
      }
      return;
    }
    if (bookingMode === 'combo' && comboId) {
      if (comboComposition.length) {
        const slots = comboUnitSlots.length
          ? comboUnitSlots
          : buildComboUnitSlots(comboComposition);
        const missing = slots.filter((s) => !s.productUnit);
        if (missing.length) {
          const names = missing.map((s) => s.productName).join(', ');
          throw new Error(`Direct combo rental requires a serial or QR scan for: ${names}`);
        }
      }
      const missingExtras = comboExtraLines.filter(
        (l) => l.product && Number(l.quantity) === 1 && !l.productUnit,
      );
      if (missingExtras.length) {
        const names = missingExtras
          .map((l) => products.find((p) => String(p.id) === String(l.product))?.name || 'product')
          .join(', ');
        throw new Error(`Direct rental requires a serial for extra products: ${names}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isComboMode && !comboId) {
        throw new Error('Select a combo bundle');
      }
      if (isComboMode && !comboComposition.length && !comboExtraLines.some((l) => l.product)) {
        throw new Error('Keep at least one combo product or add an extra product');
      }
      if (advancePaymentBlocked) {
        throw new Error(
          `Advance payment of at least ${formatCurrency(advanceRequirement.required)} is required for selected products, or check skip advance payment`,
        );
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
                <SearchableSelect
                  id="booking-branch"
                  label="Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  options={withEmptyOption(
                    toSelectOptions(branches, {
                      getLabel: (b) => formatBranchOptionLabel(b),
                      getKeywords: (b) => `${b.name} ${b.code}`,
                    }),
                    'Select branch',
                  )}
                  required
                />
              </div>
            )}
            <div className="form-group sm:col-span-2">
              <span className="form-label">Customer</span>
              <div className="mt-stellar-1">
                <RentalCustomerPicker
                  global
                  branchId={effectiveBranchId}
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
            <div className="form-group sm:col-span-2">
              <label htmlFor="advance-amount" className="form-label">
                Advance amount (₹)
              </label>
              <NumberInput
                id="advance-amount"
                min={0}
                allowDecimal={false}
                value={advanceAmount}
                onChange={setAdvanceAmount}
                placeholder="Optional — collected now, deducted from bill"
              />
              {advanceRequirement.hasRequired && (
                <div className="mt-stellar-3 space-y-stellar-2 rounded-stellar-md border border-amber-200 bg-amber-50 p-stellar-3 text-sm text-amber-950">
                  <p>
                    Selected product{advanceRequirement.products.length > 1 ? 's require' : ' requires'}{' '}
                    advance payment:{' '}
                    <strong>{formatCurrency(advanceRequirement.required)}</strong>
                    {' '}(
                    {advanceRequirement.products
                      .map((p) => `${p.name} ${p.percentage}%`)
                      .join(', ')}
                    )
                  </p>
                  {advancePaymentBlocked && (
                    <p className="font-medium">
                      Collect at least {formatCurrency(advanceRequirement.required)} in advance amount
                      to create this rental.
                    </p>
                  )}
                  <label className="flex items-center gap-stellar-2">
                    <input
                      type="checkbox"
                      checked={skipAdvancePayment}
                      onChange={(e) => setSkipAdvancePayment(e.target.checked)}
                      className="h-4 w-4 accent-stellar-accent"
                    />
                    Skip advance payment
                  </label>
                </div>
              )}
              {!advanceRequirement.hasRequired && (
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  If the customer pays an advance at booking, enter it here. The bill balance will be
                  reduced by this amount when the invoice is created.
                </p>
              )}
            </div>
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
                Adjust combo products if needed, add extras at product rates, then assign serials at
                pickup.
              </p>
            )}
            {isDirect && isComboMode && (
              <p className="text-xs text-stellar-text-muted">
                Adjust the combo, add extras if needed, then assign a serial for every remaining
                unit before booking.
              </p>
            )}

            {isComboMode ? (
              <div className="space-y-stellar-4">
                <SearchableSelect
                  id="booking-combo"
                  label="Select combo"
                  value={comboId}
                  onChange={(e) => setComboId(e.target.value)}
                  options={withEmptyOption(
                    toSelectOptions(combos, {
                      getLabel: (c) =>
                        `${c.name} (${c.code}) · ${c.items?.length ?? 0} products`,
                      getKeywords: (c) => `${c.name} ${c.code}`,
                    }),
                    'Choose a combo',
                  )}
                  required
                />

                {comboId ? (
                  <>
                    <ComboBookingEditor
                      lines={comboComposition}
                      onChange={handleComboCompositionChange}
                      rateType={comboRateType}
                      durationDays={bookingDurationDays}
                    />

                    <div className="space-y-stellar-2 border-t border-stellar-border pt-stellar-4">
                      <p className="text-sm font-medium text-stellar-text">Add extra products</p>
                      <p className="text-xs text-stellar-text-muted">
                        Extra products use each product&apos;s catalog rate (not the combo rate).
                      </p>
                      <RentalProductPicker
                        categories={categories}
                        products={products}
                        lines={
                          comboExtraLines.length
                            ? comboExtraLines
                            : [
                                {
                                  category: '',
                                  product: '',
                                  quantity: 1,
                                  rateType: 'daily',
                                  productUnit: '',
                                  key: 'combo-extra-0',
                                },
                              ]
                        }
                        onChange={(next) => {
                          setComboExtraLines(next);
                          setAvailability(null);
                          setComboPricing(null);
                        }}
                        onProductDiscovered={handleProductDiscovered}
                        isPrebook={isPrebook}
                        crossBranch
                      />
                    </div>

                    {comboComposition.length > 0 && (
                      <ComboUnitPicker
                        comboItems={comboComposition}
                        slots={comboUnitSlots}
                        onChange={setComboUnitSlots}
                        isPrebook={isPrebook}
                      />
                    )}
                  </>
                ) : null}
              </div>
            ) : (
              <RentalProductPicker
                categories={categories}
                products={products}
                lines={lines}
                onChange={setLines}
                onProductDiscovered={handleProductDiscovered}
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

            {(availability || (isComboMode && adjustedComboPricing)) && (
              <div className="mt-stellar-4 space-y-stellar-4">
                {availability && (
                  <p
                    className={`text-sm font-medium ${
                      availability.available ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {availability.available
                      ? 'All selected products available for selected dates'
                      : 'Some products are not available'}
                  </p>
                )}

                {isComboMode && (comboPricing || adjustedComboPricing) && (
                  <div>
                    <p className="mb-stellar-2 text-sm font-medium text-stellar-text">
                      Booking price (combo rates + extras at product rates)
                    </p>
                    <ComboPricingPanel pricing={comboPricing || adjustedComboPricing} />
                  </div>
                )}

                {availability?.products?.length > 0 && (
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
          <Button type="submit" disabled={submitting || advancePaymentBlocked}>
            {submitting ? 'Creating…' : 'Create booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RentalCreatePage;
