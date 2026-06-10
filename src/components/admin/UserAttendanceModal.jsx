import { useCallback, useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import UserAttendanceCalendar from './UserAttendanceCalendar.jsx';
import { fetchUserAttendance } from '../../services/attendanceService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function UserAttendanceModal({ user, open, onClose }) {
  const [month, setMonth] = useState(() => new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetchUserAttendance(user.id, {
        year: month.getFullYear(),
        month: month.getMonth() + 1,
      });
      setRecords(res.data.data.records || []);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load attendance'));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user, month]);

  useEffect(() => {
    if (open && user) load();
  }, [open, user, load]);

  if (!user) return null;

  return (
    <Modal
      open={open}
      title={`Attendance — ${user.name}`}
      onClose={onClose}
      className="max-w-3xl"
      scrollBody
    >
      <p className="text-sm text-stellar-text-muted">
        Login and logout times are captured when this user signs in and out of the panel.
        {!user.branchId && (
          <span className="mt-stellar-2 block text-amber-700 dark:text-amber-400">
            This user has no branch assigned — attendance is only tracked for branch-linked
            accounts.
          </span>
        )}
      </p>
      <UserAttendanceCalendar
        month={month}
        records={records}
        onMonthChange={setMonth}
        loading={loading}
      />
    </Modal>
  );
}

export default UserAttendanceModal;
