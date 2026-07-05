import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { fetchBranchTeam, fetchBranchTeamMember } from '../../services/teamService.js';
import { ROLE_LABELS } from '../../utils/constants.js';
import { formatDate, titleCase } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';

const BASE = '/branch';

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'employee', label: 'Employees' },
  { value: 'branch_admin', label: 'Branch admin' },
];

function StatusBadge({ status }) {
  const tone =
    status === 'active'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : status === 'suspended'
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
        : 'bg-stellar-surface-muted text-stellar-text-muted';
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', tone)}>
      {status || 'unknown'}
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/40 px-stellar-3 py-stellar-2 text-center">
      <p className="text-lg font-semibold tabular-nums text-stellar-text">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-stellar-text-muted">{label}</p>
    </div>
  );
}

function formatAddress(address) {
  if (!address) return '—';
  const lines = [
    address.line1 || address.addressLine1,
    address.line2 || address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
  return lines.length ? lines.join(', ') : '—';
}

function activityLink(item) {
  if (!item.entityId) return null;
  if (item.type === 'rental' || item.type === 'timeline') return `${BASE}/rentals/${item.entityId}`;
  if (item.type === 'customer') return `${BASE}/customers/${item.entityId}`;
  if (item.type === 'invoice') return `${BASE}/invoices/${item.entityId}`;
  return null;
}

const ACTIVITY_TYPE_LABEL = {
  rental: 'Rental',
  customer: 'Customer',
  invoice: 'Invoice',
  timeline: 'Rental action',
  audit: 'System',
};

function ActivityList({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-stellar-text-muted">No activity recorded yet.</p>;
  }

  return (
    <ul className="divide-y divide-stellar-border">
      {items.map((item) => {
        const to = activityLink(item);
        const inner = (
          <>
            <div className="flex flex-wrap items-center gap-stellar-2">
              <span className="rounded-full bg-stellar-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-stellar-text-muted">
                {ACTIVITY_TYPE_LABEL[item.type] || item.type}
              </span>
              <span className="text-sm font-medium text-stellar-text">{item.title}</span>
            </div>
            {item.subtitle && (
              <p className="mt-stellar-1 text-xs text-stellar-text-muted">{item.subtitle}</p>
            )}
            <p className="mt-stellar-1 text-[10px] text-stellar-text-subtle">{formatDate(item.at)}</p>
          </>
        );
        return (
          <li key={item.id} className="py-stellar-3 first:pt-0 last:pb-0">
            {to ? (
              <Link
                to={to}
                className="block rounded-stellar-lg p-stellar-2 -mx-stellar-2 hover:bg-stellar-surface-muted/50"
              >
                {inner}
              </Link>
            ) : (
              <div className="p-stellar-2 -mx-stellar-2">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function WorksPanel({ works }) {
  if (!works) return null;

  const sections = [
    {
      key: 'rentals',
      title: 'Rentals created',
      empty: 'No rentals created yet.',
      rows: works.rentals,
      render: (r) => (
        <Link to={`${BASE}/rentals/${r.id}`} className="block hover:text-stellar-accent">
          <span className="font-mono font-medium">{r.rentalNumber}</span>
          <span className="text-stellar-text-muted"> · {titleCase(r.status)}</span>
          {r.customerName && <span className="text-stellar-text-muted"> · {r.customerName}</span>}
          <span className="block text-[10px] text-stellar-text-subtle">{formatDate(r.createdAt)}</span>
        </Link>
      ),
    },
    {
      key: 'customers',
      title: 'Customers onboarded',
      empty: 'No customers onboarded yet.',
      rows: works.customers,
      render: (c) => (
        <Link to={`${BASE}/customers/${c.id}`} className="block hover:text-stellar-accent">
          <span className="font-medium">{c.name}</span>
          {c.phone && <span className="text-stellar-text-muted"> · {c.phone}</span>}
          <span className="block text-[10px] text-stellar-text-subtle">{formatDate(c.createdAt)}</span>
        </Link>
      ),
    },
    {
      key: 'rentalActions',
      title: 'Rental workflow actions',
      empty: 'No pickup/return actions yet.',
      rows: works.rentalActions,
      render: (a) => (
        <div>
          <span className="font-mono text-sm">{a.rentalNumber || 'Rental'}</span>
          <span className="text-stellar-text-muted"> · {a.summary || a.event}</span>
          <span className="block text-[10px] text-stellar-text-subtle">{formatDate(a.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'invoices',
      title: 'Invoices',
      empty: 'No invoices created yet.',
      rows: works.invoices,
      render: (inv) => (
        <Link to={`${BASE}/invoices/${inv.id}`} className="block hover:text-stellar-accent">
          <span className="font-mono font-medium">{inv.invoiceNumber}</span>
          <span className="text-stellar-text-muted"> · {titleCase(inv.status)}</span>
          <span className="block text-[10px] text-stellar-text-subtle">{formatDate(inv.createdAt)}</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-stellar-6">
      {sections.map(
        (section) =>
          section.rows?.length > 0 && (
            <div key={section.key}>
              <h3 className="mb-stellar-2 text-xs font-semibold uppercase tracking-wide text-stellar-text-muted">
                {section.title}
              </h3>
              <ul className="space-y-stellar-3">
                {section.rows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-stellar-lg border border-stellar-border px-stellar-3 py-stellar-2 text-sm"
                  >
                    {section.render(row)}
                  </li>
                ))}
              </ul>
            </div>
          ),
      )}
      {sections.every((s) => !s.rows?.length) && (
        <p className="text-sm text-stellar-text-muted">This member has not recorded any work in the system yet.</p>
      )}
    </div>
  );
}

function MemberDetail({ memberId, listMember, onClose }) {
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('details');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchBranchTeamMember(memberId);
        if (!cancelled) setDetail(data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load member'));
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const member = detail?.member || listMember;
  const stats = member?.stats;

  if (!memberId) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center p-stellar-8 text-center">
        <p className="text-sm text-stellar-text-muted">Select a team member to view details, work, and activity.</p>
      </Card>
    );
  }

  if (loading && !member) {
    return (
      <Card className="p-stellar-6">
        <p className="text-sm text-stellar-text-muted">Loading member…</p>
      </Card>
    );
  }

  if (!member) return null;

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'work', label: 'Work' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
        <div className="flex flex-wrap items-start justify-between gap-stellar-3">
          <div className="flex items-center gap-stellar-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stellar-accent text-sm font-semibold text-stellar-accent-fg">
              {member.name
                ?.split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-stellar-text">{member.name}</h2>
              <p className="text-sm text-stellar-text-muted">{member.email}</p>
              <div className="mt-stellar-2 flex flex-wrap gap-stellar-2">
                <StatusBadge status={member.status} />
                <span className="badge">{ROLE_LABELS[member.role]}</span>
                {member.employeePositionLabel && (
                  <span className="badge">{member.employeePositionLabel}</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-sm text-stellar-text-muted hover:text-stellar-text lg:hidden"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {stats && (
          <div className="mt-stellar-4 grid grid-cols-2 gap-stellar-2 sm:grid-cols-4">
            <StatPill label="Rentals" value={stats.rentalsCreated} />
            <StatPill label="Customers" value={stats.customersOnboarded} />
            <StatPill label="Actions" value={stats.rentalActions} />
            <StatPill label="Invoices" value={stats.invoicesCreated} />
          </div>
        )}
      </div>

      <div className="flex gap-stellar-1 border-b border-stellar-border px-stellar-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'border-b-2 px-stellar-3 py-stellar-3 text-sm font-medium transition-stellar',
              tab === t.id
                ? 'border-stellar-accent text-stellar-accent'
                : 'border-transparent text-stellar-text-muted hover:text-stellar-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-stellar-4 sm:p-stellar-5">
        {tab === 'details' && (
          <dl className="grid gap-stellar-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-stellar-text-muted">Phone</dt>
              <dd className="mt-stellar-1 text-sm text-stellar-text">{member.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-stellar-text-muted">Employee ID</dt>
              <dd className="mt-stellar-1 font-mono text-sm text-stellar-text">{member.employeeId || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-stellar-text-muted">Joined</dt>
              <dd className="mt-stellar-1 text-sm text-stellar-text">{formatDate(member.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-stellar-text-muted">Last login</dt>
              <dd className="mt-stellar-1 text-sm text-stellar-text">{formatDate(member.lastLoginAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-stellar-text-muted">Address</dt>
              <dd className="mt-stellar-1 text-sm text-stellar-text">{formatAddress(member.address)}</dd>
            </div>
            {member.shifts?.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-stellar-text-muted">Shifts</dt>
                <dd className="mt-stellar-2 flex flex-wrap gap-stellar-2">
                  {member.shifts.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-stellar-lg border border-stellar-border px-stellar-3 py-stellar-1 text-xs"
                    >
                      {s.name} ({s.startTime}–{s.endTime})
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {detail?.member?.documents?.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-stellar-text-muted">Onboarding documents</dt>
                <dd className="mt-stellar-2 flex flex-wrap gap-stellar-2">
                  {detail.member.documents.map((doc) => (
                    <a
                      key={doc.url}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-stellar-lg border border-stellar-border px-stellar-3 py-stellar-2 text-xs font-medium text-stellar-accent hover:underline"
                    >
                      {doc.name || 'Document'}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
        {tab === 'work' && <WorksPanel works={detail?.works} />}
        {tab === 'activity' && (
          <ActivityList items={detail?.activity || member.recentActivity} />
        )}
      </div>
    </Card>
  );
}

function BranchTeamPage() {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const { search, setSearch, period, setPeriod, dateFrom, setDateFrom, dateTo, setDateTo, dateParams } =
    useListFilters();

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchBranchTeam({
        search: search || undefined,
        role: roleFilter || undefined,
        accountStatus: 'active',
        ...dateParams,
      });
      setMembers(data.data.members);
      setSummary(data.data.summary);
      setSelectedId((prev) => {
        if (prev && data.data.members.some((m) => m.id === prev)) return prev;
        return data.data.members[0]?.id || null;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load team'));
      setMembers([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, dateParams]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedId) || null,
    [members, selectedId],
  );

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Team</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Branch staff, their onboarded work, and recent activity.
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-4">
          <StatPill label="Total members" value={summary.total} />
          <StatPill label="Active" value={summary.active} />
          <StatPill label="Employees" value={summary.byRole?.employee || 0} />
          <StatPill label="Admins" value={summary.byRole?.branch_admin || 0} />
        </div>
      )}

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, phone, employee ID…"
        period={period}
        onPeriodChange={setPeriod}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        extraFilters={
          <SearchableSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={ROLE_FILTER_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        }
      />

      <div className="grid gap-stellar-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Members</Card.Title>
            <Card.Description>
              {loading ? 'Loading…' : `${members.length} team member${members.length === 1 ? '' : 's'}`}
            </Card.Description>
          </Card.Header>
          <Card.Content className="max-h-[70vh] overflow-y-auto p-0">
            {loading && <p className="p-stellar-4 text-sm text-stellar-text-muted">Loading team…</p>}
            {!loading && members.length === 0 && (
              <p className="p-stellar-4 text-sm text-stellar-text-muted">No team members match your filters.</p>
            )}
            <ul className="divide-y divide-stellar-border">
              {members.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      'flex w-full gap-stellar-3 px-stellar-4 py-stellar-3 text-left transition-stellar hover:bg-stellar-surface-muted/50',
                      selectedId === m.id && 'bg-stellar-accent/10',
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stellar-surface-muted text-xs font-semibold">
                      {m.name
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-stellar-2">
                        <span className="truncate font-medium text-stellar-text">{m.name}</span>
                        <StatusBadge status={m.status} />
                      </span>
                      <span className="block truncate text-xs text-stellar-text-muted">{m.email}</span>
                      <span className="mt-stellar-1 flex flex-wrap gap-stellar-2 text-[10px] text-stellar-text-subtle">
                        <span>{ROLE_LABELS[m.role]}</span>
                        {m.stats?.rentalsCreated > 0 && <span>· {m.stats.rentalsCreated} rentals</span>}
                        {m.stats?.customersOnboarded > 0 && (
                          <span>· {m.stats.customersOnboarded} customers</span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>

        <div className="lg:col-span-3">
          <MemberDetail
            memberId={selectedId}
            listMember={selectedMember}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default BranchTeamPage;
