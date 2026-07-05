import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import DashboardTabs from '../../components/dashboard/DashboardTabs.jsx';
import QuickActionsGrid from '../../components/dashboard/QuickActionsGrid.jsx';
import ActivityFeed from '../../components/dashboard/ActivityFeed.jsx';
import DashboardCharts from '../../components/dashboard/DashboardCharts.jsx';
import AttendancePunchPanel from '../../components/attendance/AttendancePunchPanel.jsx';
import { KPI_CARD_STYLES } from '../../components/dashboard/charts/chartColors.js';
import useAuth from '../../hooks/useAuth.js';
import { fetchWorkspaceDashboard } from '../../services/dashboardService.js';
import {
  DASHBOARD_TAB_LABELS,
  DASHBOARD_WORKSPACES,
  getDashboardQuickActions,
} from '../../routes/config/dashboardConfig.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';

function formatKpi(kpi) {
  if (kpi.format === 'currency') return formatCurrency(kpi.value);
  return Number(kpi.value).toLocaleString('en-IN');
}

function WorkspaceDashboard({ title }) {
  const { user } = useAuth();
  const role = user?.role;
  const workspace = DASHBOARD_WORKSPACES[role];
  const basePath = workspace?.basePath || '/';

  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const quickActions = useMemo(() => getDashboardQuickActions(role), [role]);
  const showSales = Boolean(data?.features?.sales);
  const showInvoices = showSales || Boolean(data?.features?.invoices);
  const splitCharts = role === ROLES.EMPLOYEE;
  const showPunchPanel = role === ROLES.EMPLOYEE || role === ROLES.BRANCH_ADMIN;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWorkspaceDashboard();
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load dashboard'));
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

  const activityLink = (item) => {
    if (item.type === 'rental') return `${basePath}/rentals/${item.entityId}`;
    if (item.type === 'invoice' && showInvoices) return `${basePath}/invoices/${item.entityId}`;
    return null;
  };

  const tabs = [
    { id: 'overview', label: DASHBOARD_TAB_LABELS.overview },
    { id: 'activity', label: DASHBOARD_TAB_LABELS.activity },
  ];

  const charts = data?.charts || {};

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <span className="badge badge-accent">{ROLE_LABELS[role] || role}</span>
        {data?.branch && (
          <p className="mt-stellar-2 text-sm text-stellar-text-muted">
            {data.branch.name}{' '}
            <code className="rounded bg-stellar-surface-muted px-1 font-mono text-xs">{data.branch.code}</code>
          </p>
        )}
        <h1 className="mt-stellar-2 text-2xl font-semibold tracking-tight text-stellar-text sm:text-3xl">
          {title || `${workspace?.title || 'Workspace'} dashboard`}
        </h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
          {role === ROLES.EMPLOYEE && ' — only your jobs and invoices.'}
        </p>
      </div>

      <DashboardTabs tabs={tabs} active={tab} onChange={setTab} />

      {showPunchPanel && tab === 'overview' && <AttendancePunchPanel />}

      {tab === 'overview' && (
        <div className="space-y-stellar-6">
          {loading ? (
            <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.kpis || []).map((kpi, index) => {
                  const accent = KPI_CARD_STYLES[index % KPI_CARD_STYLES.length];
                  return (
                    <Card
                      key={kpi.id}
                      variant="muted"
                      className={cn('!p-stellar-4 border-l-4', accent.border, accent.bg)}
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
                        {kpi.label}
                      </p>
                      <p className={cn('mt-stellar-1 text-2xl font-semibold tabular-nums', accent.value)}>
                        {formatKpi(kpi)}
                      </p>
                    </Card>
                  );
                })}
              </div>

              <DashboardCharts
                charts={charts}
                showSales={showSales}
                splitInline={splitCharts}
              />
            </>
          )}

          <div>
            <h2 className="mb-stellar-3 text-sm font-semibold text-stellar-text">Quick actions</h2>
            <QuickActionsGrid actions={quickActions} />
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="space-y-stellar-6">
          <Card>
            <Card.Header>
              <Card.Title>Recent activity</Card.Title>
              <Card.Description>
                Latest rentals
                {showInvoices ? ' and invoices' : ''} in your workspace.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {loading ? (
                <p className="text-sm text-stellar-text-muted">Loading activity…</p>
              ) : (
                <ActivityFeed items={data?.activity || []} resolveLink={activityLink} />
              )}
            </Card.Content>
          </Card>

          <div>
            <h2 className="mb-stellar-3 text-sm font-semibold text-stellar-text">Quick actions</h2>
            <QuickActionsGrid actions={quickActions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDashboard;
