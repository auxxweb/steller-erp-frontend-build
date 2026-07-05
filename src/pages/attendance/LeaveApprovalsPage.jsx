import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { approveLeave, fetchLeaveRequests, rejectLeave } from '../../services/leaveService.js';
import { formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';

function LeaveApprovalsPage({ title = 'Leave requests' }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actingId, setActingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const {
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  } = useListFilters();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchLeaveRequests({
        status: statusFilter === '' ? 'all' : statusFilter || undefined,
        ...dateParams,
      });
      setLeaves(data.data.leaves || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load leave requests'));
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await approveLeave(id);
      toast.success('Leave approved');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not approve leave'));
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActingId(rejectTarget.id);
    try {
      await rejectLeave(rejectTarget.id, rejectReason);
      toast.success('Leave rejected');
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not reject leave'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">{title}</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          {isSuperAdmin
            ? 'Approve employee leave and branch admin leave (branch admin requests are super admin only).'
            : 'Approve employee leave for your branch. Branch admin leave is handled by super admin.'}
        </p>
      </div>

      <Card>
        <Card.Content>
          <ListFiltersBar
            idPrefix="leave"
            showSearch={false}
            period={period}
            onPeriodChange={setPeriod}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            showSubmit={false}
          >
            <div className="form-group">
              <label htmlFor="leave-status" className="form-label">
                Status
              </label>
              <select
                id="leave-status"
                className="input w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
            </div>
          </ListFiltersBar>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content className="!p-0">
          {loading && <p className="p-stellar-4 text-sm text-stellar-text-muted">Loading…</p>}
          {!loading && leaves.length === 0 && (
            <p className="p-stellar-4 text-sm text-stellar-text-muted">No leave requests in this view.</p>
          )}
          <ul className="divide-y divide-stellar-border">
            {leaves.map((leave) => (
              <li key={leave.id} className="flex flex-col gap-stellar-3 p-stellar-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-stellar-text">
                    {leave.user?.name || 'Employee'}{' '}
                    <span className="font-normal text-stellar-text-muted">· {leave.user?.email}</span>
                  </p>
                  <div className="mt-stellar-1 flex flex-wrap items-center gap-stellar-2">
                    <span className="text-sm capitalize text-stellar-text">
                      {leave.type} · {formatDate(leave.startDate)} – {formatDate(leave.endDate)} ({leave.totalDays}{' '}
                      day{leave.totalDays === 1 ? '' : 's'})
                    </span>
                    {leave.user?.role && (
                      <span className="rounded-full bg-stellar-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {ROLE_LABELS[leave.user.role] || leave.user.role}
                      </span>
                    )}
                    {leave.requiresSuperAdminApproval && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                        Super admin only
                      </span>
                    )}
                  </div>
                  <p className="mt-stellar-1 text-sm text-stellar-text-muted">{leave.reason}</p>
                  {leave.approvedBy?.name && leave.status !== 'pending' && (
                    <p className="mt-stellar-1 text-xs text-stellar-text-subtle">
                      {leave.status} by {leave.approvedBy.name}
                    </p>
                  )}
                </div>
                {leave.status === 'pending' ? (
                  <div className="flex shrink-0 gap-stellar-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(leave.id)}
                      disabled={actingId === leave.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setRejectTarget(leave)}
                      disabled={actingId === leave.id}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                      leave.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-800'
                        : 'bg-stellar-surface-muted text-stellar-text-muted',
                    )}
                  >
                    {leave.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>

      <Modal
        open={Boolean(rejectTarget)}
        title="Reject leave"
        onClose={() => setRejectTarget(null)}
        className="max-w-md"
      >
        <p className="text-sm text-stellar-text-muted">
          Optional note for {rejectTarget?.user?.name}.
        </p>
        <textarea
          className="input mt-stellar-3 min-h-[80px] w-full"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection"
        />
        <div className="mt-stellar-4 flex justify-end gap-stellar-2">
          <Button variant="secondary" onClick={() => setRejectTarget(null)}>
            Cancel
          </Button>
          <Button onClick={handleReject} disabled={actingId === rejectTarget?.id}>
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default LeaveApprovalsPage;
