import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { fetchBranches } from '../../services/branchService.js';
import { createShift, fetchShifts } from '../../services/shiftService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

const DOW = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

function AdminShiftsPage() {
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState('');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then((r) => {
        const list = r.data.data.branches || [];
        setBranches(list);
        if (!branch && list[0]?.id) setBranch(list[0].id);
      })
      .catch(() => setBranches([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (branchId) => {
    setLoading(true);
    try {
      const res = await fetchShifts({ branch: branchId, status: 'active', limit: 200 });
      setShifts(res.data.data.shifts || []);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load shifts'));
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branch) return;
    load(branch);
  }, [branch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createShift({
        branch,
        name: form.name,
        startTime: form.startTime,
        endTime: form.endTime,
        daysOfWeek: form.daysOfWeek,
      });
      toast.success('Shift created');
      setForm((s) => ({ ...s, name: '' }));
      load(branch);
    } catch (e2) {
      toast.error(getApiErrorMessage(e2, 'Create failed'));
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Shifts</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Define shift timings per branch, then assign them to employees.
        </p>
      </div>

      <Card className="!p-stellar-5">
        <div className="grid gap-stellar-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div />
        </div>

        <form onSubmit={handleCreate} className="mt-stellar-4 grid gap-stellar-4 sm:grid-cols-2">
          <Input label="Shift name" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          <div className="grid grid-cols-2 gap-stellar-3">
            <Input label="Start (HH:MM)" value={form.startTime} onChange={(e) => setField('startTime', e.target.value)} required />
            <Input label="End (HH:MM)" value={form.endTime} onChange={(e) => setField('endTime', e.target.value)} required />
          </div>
          <div className="form-group sm:col-span-2">
            <label className="form-label">Days</label>
            <div className="flex flex-wrap gap-stellar-3">
              {DOW.map((d) => (
                <label key={d.value} className="flex items-center gap-stellar-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.daysOfWeek.includes(d.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.daysOfWeek, d.value]
                        : form.daysOfWeek.filter((x) => x !== d.value);
                      setField('daysOfWeek', next.sort((a, b) => a - b));
                    }}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" variant="primary">
              Create shift
            </Button>
          </div>
        </form>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4">
          <h2 className="text-sm font-semibold">Active shifts</h2>
        </div>
        {loading ? (
          <div className="p-stellar-6 text-sm text-stellar-text-muted">Loading shifts…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="font-mono text-sm">
                      {s.startTime} - {s.endTime}
                    </td>
                    <td className="text-sm text-stellar-text-muted">
                      {(s.daysOfWeek || []).join(', ')}
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-stellar-6 text-sm text-stellar-text-muted">
                      No shifts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminShiftsPage;
