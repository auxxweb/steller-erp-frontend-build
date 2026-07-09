import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import ChangePasswordForm from '../../components/settings/ChangePasswordForm.jsx';
import useAuth from '../../hooks/useAuth.js';
import useSettingsBasePath from '../../hooks/useSettingsBasePath.js';
import { ROLE_BASE_PATHS, ROLE_NAV_ITEMS } from '../../routes/config/routeConfig.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';
import {
  fetchWorkspaceSettings,
  updateBranchSettings,
  updateOrganizationSettings,
} from '../../services/settingsService.js';
import { updateProfile } from '../../services/authService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function SettingsSection({ title, description, children }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        {description && <Card.Description>{description}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

const SALES_PATH_SEGMENTS = ['/invoices', '/reports'];

function WorkspaceLinks({ role }) {
  const base = ROLE_BASE_PATHS[role];
  const hideSales = role === ROLES.EMPLOYEE;
  const links = (ROLE_NAV_ITEMS[role] || []).filter((item) => {
    if (item.end || item.to.includes('/settings')) return false;
    if (hideSales && SALES_PATH_SEGMENTS.some((seg) => item.to.includes(seg))) return false;
    return true;
  });

  if (!links.length) return null;

  return (
    <SettingsSection title="Workspace shortcuts" description="Jump to common areas for your role.">
      <div className="flex flex-wrap gap-stellar-2">
        {links.slice(0, 8).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-stellar-lg border border-stellar-border px-stellar-3 py-stellar-2 text-sm font-medium text-stellar-text transition-stellar hover:border-stellar-accent"
          >
            {item.label}
          </Link>
        ))}
        {role === ROLES.SUPER_ADMIN && (
          <Link
            to={`${base}/branches`}
            className="rounded-stellar-lg border border-stellar-border px-stellar-3 py-stellar-2 text-sm font-medium text-stellar-text transition-stellar hover:border-stellar-accent"
          >
            Branches
          </Link>
        )}
      </div>
    </SettingsSection>
  );
}

function BranchSettingsForm({ branch, onSaved }) {
  const [form, setForm] = useState({
    taxRate: branch?.settings?.taxRate ?? 18,
    defaultRentalGraceHours: branch?.settings?.defaultRentalGraceHours ?? 2,
    invoicePrefix: branch?.settings?.invoicePrefix ?? 'INV',
    rentalPrefix: branch?.settings?.rentalPrefix ?? 'RNT',
    timezone: branch?.timezone ?? 'Asia/Kolkata',
    currency: branch?.currency ?? 'INR',
    businessName: branch?.settings?.invoice?.businessName ?? '',
    logoUrl: branch?.settings?.invoice?.logoUrl ?? '',
    gstin: branch?.settings?.invoice?.gstin ?? '',
    website: branch?.settings?.invoice?.website ?? '',
    terms: branch?.settings?.invoice?.terms ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!branch) return;
    setForm({
      taxRate: branch.settings?.taxRate ?? 18,
      defaultRentalGraceHours: branch.settings?.defaultRentalGraceHours ?? 2,
      invoicePrefix: branch.settings?.invoicePrefix ?? 'INV',
      rentalPrefix: branch.settings?.rentalPrefix ?? 'RNT',
      timezone: branch.timezone ?? 'Asia/Kolkata',
      currency: branch.currency ?? 'INR',
      businessName: branch.settings?.invoice?.businessName ?? '',
      logoUrl: branch.settings?.invoice?.logoUrl ?? '',
      gstin: branch.settings?.invoice?.gstin ?? '',
      website: branch.settings?.invoice?.website ?? '',
      terms: branch.settings?.invoice?.terms ?? '',
    });
  }, [branch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateBranchSettings({
        timezone: form.timezone,
        currency: form.currency,
        settings: {
          taxRate: Number(form.taxRate),
          defaultRentalGraceHours: Number(form.defaultRentalGraceHours),
          invoicePrefix: form.invoicePrefix.trim(),
          rentalPrefix: form.rentalPrefix.trim(),
          invoice: {
            businessName: form.businessName.trim(),
            logoUrl: form.logoUrl.trim(),
            gstin: form.gstin.trim().toUpperCase(),
            website: form.website.trim(),
            terms: form.terms.trim(),
          },
        },
      });
      toast.success('Branch settings saved');
      onSaved?.(data.data.branch);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save branch settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Branch operations"
      description={`Defaults and invoice branding for ${branch?.name || 'your branch'}.`}
    >
      <form onSubmit={handleSubmit} className="grid gap-stellar-4 sm:grid-cols-2">
        <Input
          label="Default GST %"
          type="number"
          min="0"
          max="100"
          value={form.taxRate}
          onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))}
        />
        <Input
          label="Rental grace (hours)"
          type="number"
          min="0"
          value={form.defaultRentalGraceHours}
          onChange={(e) => setForm((f) => ({ ...f, defaultRentalGraceHours: e.target.value }))}
        />
        <Input
          label="Invoice prefix"
          value={form.invoicePrefix}
          onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))}
        />
        <Input
          label="Rental prefix"
          value={form.rentalPrefix}
          onChange={(e) => setForm((f) => ({ ...f, rentalPrefix: e.target.value }))}
        />
        <Input
          label="Timezone"
          value={form.timezone}
          onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
        />
        <Input
          label="Currency"
          value={form.currency}
          onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
        />
        <div className="sm:col-span-2 border-t border-stellar-border pt-stellar-4">
          <p className="mb-stellar-3 text-sm font-medium text-stellar-text">Invoice branding</p>
        </div>
        <Input
          label="Business name on invoice"
          className="sm:col-span-2"
          value={form.businessName}
          onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
        />
        <Input
          label="Logo URL"
          className="sm:col-span-2"
          value={form.logoUrl}
          onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          hint="Public image URL for invoice header"
        />
        <Input
          label="GSTIN"
          value={form.gstin}
          onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
        />
        <Input
          label="Website"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        />
        <div className="form-group sm:col-span-2">
          <label htmlFor="invoice-terms" className="form-label">
            Invoice terms
          </label>
          <textarea
            id="invoice-terms"
            className="input min-h-[80px] w-full"
            value={form.terms}
            onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save branch settings'}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

function OrganizationGstSettingsForm({ organization, onSaved }) {
  const [form, setForm] = useState({
    gstNumber: organization?.gst?.gstNumber ?? '',
    gstPercentage: organization?.gst?.gstPercentage ?? 18,
    pricesIncludeGst: Boolean(organization?.gst?.pricesIncludeGst),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organization) return;
    setForm({
      gstNumber: organization.gst?.gstNumber ?? '',
      gstPercentage: organization.gst?.gstPercentage ?? 18,
      pricesIncludeGst: Boolean(organization.gst?.pricesIncludeGst),
    });
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gstNumber = form.gstNumber.trim().toUpperCase();
    const gstPercentage = Number(form.gstPercentage);

    if (gstNumber && gstNumber.length !== 15) {
      toast.error('GST number must be 15 characters, or leave it blank');
      return;
    }
    if (!Number.isFinite(gstPercentage) || gstPercentage < 0 || gstPercentage > 100) {
      toast.error('GST percentage must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      const { data } = await updateOrganizationSettings({
        gst: {
          gstNumber,
          gstPercentage,
          pricesIncludeGst: Boolean(form.pricesIncludeGst),
        },
      });
      toast.success('GST settings saved');
      onSaved?.(data.data.organization);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save GST settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="GST settings"
      description="Organisation-wide GST number, rate, and how product rental prices should be treated on invoices."
    >
      <form onSubmit={handleSubmit} className="max-w-xl space-y-stellar-4">
        <Input
          label="GST number (GSTIN)"
          value={form.gstNumber}
          onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
          hint="Optional — 15-character GSTIN shown on invoices"
          maxLength={15}
        />
        <Input
          label="GST percentage (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.gstPercentage}
          onChange={(e) => setForm((f) => ({ ...f, gstPercentage: e.target.value }))}
        />
        <label className="flex items-start gap-stellar-3 rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/40 p-stellar-4 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.pricesIncludeGst}
            onChange={(e) => setForm((f) => ({ ...f, pricesIncludeGst: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-stellar-text">Product rental prices include GST</span>
            <span className="mt-stellar-1 block text-stellar-text-muted">
              When enabled, prices entered in the product section already include GST and the
              invoice will not show a separate GST toggle. When disabled, prices are GST-exclusive
              and staff can apply GST on each invoice.
            </span>
          </span>
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save GST settings'}
        </Button>
      </form>
    </SettingsSection>
  );
}

function OrganizationRiskSettingsForm({ organization, onSaved }) {
  const [limit, setLimit] = useState(
    organization?.risk?.prebookCancellationLimit ?? 2,
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateOrganizationSettings({
        risk: {
          prebookCancellationLimit: Number(limit),
        },
      });
      toast.success('Risk settings saved');
      onSaved?.(data.data.organization);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save risk settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Risk settings"
      description="Global thresholds used when calculating customer risk."
    >
      <form onSubmit={handleSubmit} className="max-w-md space-y-stellar-4">
        <Input
          label="Pre-booking cancellation limit"
          type="number"
          min="0"
          step="1"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          hint="Cancelled pre-bookings above this count increase the customer's risk score."
        />
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save risk settings'}
        </Button>
      </form>
    </SettingsSection>
  );
}

function ProfileForm({ user, onSaved }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone });
      toast.success('Profile updated');
      onSaved?.(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection title="Account" description="Your sign-in identity for this panel.">
      <form onSubmit={handleSubmit} className="space-y-stellar-4 max-w-md">
        <Input label="Email" value={user?.email || ''} disabled hint="Contact an admin to change email" />
        <Input label="Role" value={ROLE_LABELS[user?.role] || user?.role} disabled />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </SettingsSection>
  );
}

function SettingsPage() {
  const { user, updateUser } = useAuth();
  const settingsPath = useSettingsBasePath();
  const role = user?.role;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const showBranchSettings = data?.features?.branchSettings;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWorkspaceSettings();
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load settings'));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const profileUser = useMemo(() => data?.user || user, [data?.user, user]);

  const handleProfileSaved = (updated) => {
    updateUser(updated);
    setData((prev) => (prev ? { ...prev, user: updated } : prev));
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading settings…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Settings</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Account security and workspace preferences for your {ROLE_LABELS[role]?.toLowerCase() || 'panel'}.
        </p>
      </div>

      <ProfileForm user={profileUser} onSaved={handleProfileSaved} />

      <SettingsSection
        title="Change password"
        description="Required on all panels. You will stay signed in on this device; other sessions are signed out."
      >
        <ChangePasswordForm />
      </SettingsSection>

      {data?.branch && !showBranchSettings && (
        <SettingsSection title="Your branch" description="Assigned location for this account.">
          <p className="text-sm font-medium text-stellar-text">{data.branch.name}</p>
          <p className="text-xs text-stellar-text-muted">
            Code: <code className="font-mono">{data.branch.code}</code>
          </p>
        </SettingsSection>
      )}

      {showBranchSettings && data?.branch && (
        <BranchSettingsForm branch={data.branch} onSaved={(branch) => setData((p) => ({ ...p, branch }))} />
      )}

      {role && <WorkspaceLinks role={role} />}

      {role === ROLES.SUPER_ADMIN && (
        <OrganizationGstSettingsForm
          organization={data?.organization}
          onSaved={(organization) => setData((p) => ({ ...p, organization }))}
        />
      )}

      {role === ROLES.SUPER_ADMIN && (
        <OrganizationRiskSettingsForm
          organization={data?.organization}
          onSaved={(organization) => setData((p) => ({ ...p, organization }))}
        />
      )}

      {role === ROLES.SUPER_ADMIN && (
        <SettingsSection
          title="Organisation"
          description="Manage branches, users, and per-branch invoice settings from their detail pages."
        >
          <div className="flex flex-wrap gap-stellar-2">
            <Link to="/admin/users" className="btn btn-secondary btn-sm">
              User management
            </Link>
            <Link to="/admin/branches" className="btn btn-secondary btn-sm">
              Branches
            </Link>
            <Link to="/admin/reports" className="btn btn-secondary btn-sm">
              Reports
            </Link>
          </div>
        </SettingsSection>
      )}

      {role === ROLES.BRANCH_ADMIN && (
        <SettingsSection title="Team & billing" description="Shortcuts for branch administration.">
          <div className="flex flex-wrap gap-stellar-2">
            <Link to="/branch/team" className="btn btn-secondary btn-sm">
              Team
            </Link>
            <Link to="/branch/reports" className="btn btn-secondary btn-sm">
              Reports
            </Link>
            <Link to="/branch/invoices" className="btn btn-secondary btn-sm">
              Invoices
            </Link>
            <Link to="/branch/attendance" className="btn btn-secondary btn-sm">
              Attendance & leave
            </Link>
          </div>
        </SettingsSection>
      )}

      {role === ROLES.EMPLOYEE && (
        <SettingsSection title="My work" description="Jobs and invoices tied to your account.">
          <div className="flex flex-wrap gap-stellar-2">
            <Link to="/employee/rentals" className="btn btn-secondary btn-sm">
              My jobs
            </Link>
            <Link to="/employee/invoices" className="btn btn-secondary btn-sm">
              My invoices
            </Link>
            <Link to="/employee/attendance" className="btn btn-secondary btn-sm">
              Attendance & leave
            </Link>
          </div>
        </SettingsSection>
      )}

      <p className="text-center text-xs text-stellar-text-muted">
        <Link to={settingsPath.replace('/settings', '/dashboard')} className="text-stellar-accent hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}

export default SettingsPage;
