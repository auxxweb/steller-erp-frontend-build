import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import UserAttendanceCalendar from '../../components/admin/UserAttendanceCalendar.jsx';
import { fetchMyAttendance } from '../../services/attendanceService.js';
import { applyLeave, fetchMyLeaves } from '../../services/leaveService.js';
import { formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { cn } from '../../utils/cn.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';

const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual' },
  { value: 'sick', label: 'Sick' },
  { value: 'earned', label: 'Earned' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'other', label: 'Other' },
];

const STATUS_TONE = {
  pending: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  approved: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  rejected: 'bg-red-500/15 text-red-800 dark:text-red-200',
  cancelled: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function EmployeeAttendancePage() {
  const { user } = useAuth();
  const isBranchAdmin = user?.role === ROLES.BRANCH_ADMIN;
  const [month, setMonth] = useState(() => new Date());
  const [records, setRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const { data } = await fetchMyAttendance({
        year: month.getFullYear(),
        month: month.getMonth() + 1,
      });
      setRecords(data.data.records || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance'));
      setRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, [month]);

  const loadLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    try {
      const { data } = await fetchMyLeaves();
      setLeaves(data.data.leaves || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load leave requests'));
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave(form);
      toast.success('Leave request sent for approval');
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit leave request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Attendance & leave</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          {isBranchAdmin
            ? 'Punch in from your dashboard; view history and apply for leave here.'
            : 'Punch in from your dashboard; view history and apply for leave here.'}
        </p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Attendance calendar</Card.Title>
          <Card.Description>Punch in/out times and breaks from the dashboard clock.</Card.Description>
        </Card.Header>
        <Card.Content>
          <UserAttendanceCalendar
            month={month}
            records={records}
            onMonthChange={setMonth}
            loading={loadingAttendance}
          />
        </Card.Content>
      </Card>

      <div className="grid gap-stellar-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Apply for leave</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleApply} className="space-y-stellar-4">
              <SearchableSelect
                id="leave-type"
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                options={LEAVE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
              <Input
                label="From"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
              <Input
                label="To"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                required
              />
              <div className="form-group">
                <label htmlFor="leave-reason" className="form-label">
                  Reason
                </label>
                <textarea
                  id="leave-reason"
                  className="input min-h-[88px] w-full"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit request'}
              </Button>
            </form>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>My leave requests</Card.Title>
          </Card.Header>
          <Card.Content>
            {loadingLeaves && <p className="text-sm text-stellar-text-muted">Loading…</p>}
            {!loadingLeaves && leaves.length === 0 && (
              <p className="text-sm text-stellar-text-muted">No leave requests yet.</p>
            )}
            <ul className="divide-y divide-stellar-border">
              {leaves.map((leave) => (
                <li key={leave.id} className="py-stellar-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-stellar-2">
                    <div>
                      <p className="font-medium capitalize text-stellar-text">{leave.type} leave</p>
                      <p className="text-xs text-stellar-text-muted">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)} · {leave.totalDays}{' '}
                        day(s)
                      </p>
                      <p className="mt-stellar-1 text-sm text-stellar-text-muted">{leave.reason}</p>
                      {leave.rejectionReason && leave.status === 'rejected' && (
                        <p className="mt-stellar-1 text-xs text-red-600 dark:text-red-400">
                          {leave.rejectionReason}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                        STATUS_TONE[leave.status] || STATUS_TONE.pending,
                      )}
                    >
                      {leave.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default EmployeeAttendancePage;
