import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import PasswordInput from '../../components/ui/PasswordInput.jsx';
import Modal from '../../components/ui/Modal.jsx';
import UserAttendanceModal from '../../components/admin/UserAttendanceModal.jsx';
import AdminUserPasswordPanel from '../../components/admin/AdminUserPasswordPanel.jsx';
import { fetchBranches } from '../../services/branchService.js';
import { createShift, deleteShift, fetchShifts, updateShift } from '../../services/shiftService.js';
import {
  fetchUsers,
  registerUser,
  updateUser,
  updateUserStatus,
  deleteUserPermanently,
} from '../../services/userService.js';
import useAuth from '../../hooks/useAuth.js';
import { uploadUserDocuments } from '../../services/uploadService.js';
import { ROLES, ROLE_LABELS } from '../../utils/constants.js';
import { PASSWORD_HINT } from '../../utils/passwordValidation.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { toast } from '../../lib/toastStore.js';
import { formatApiError, validateRegisterUserForm } from '../../utils/userValidation.js';
import { formatBranchDisplay, formatBranchOptionLabel } from '../../utils/branchHelpers.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

const ROLE_OPTIONS = Object.values(ROLES).map((r) => ({
  value: r,
  label: ROLE_LABELS[r] || r,
}));

const branchSelectOptions = (branches) =>
  withEmptyOption(
    toSelectOptions(branches, {
      getLabel: (b) => formatBranchOptionLabel(b),
      getKeywords: (b) => `${b.name} ${b.code}`,
    }),
    'Select branch…',
  );

const EMPLOYEE_POSITIONS = [
  { value: 'sales_staff', label: 'Sales staff' },
  { value: 'branch_manager', label: 'Branch manager' },
];

const USER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];

const DOW = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const EMPTY_SHIFT = {
  name: '',
  startTime: '09:00',
  endTime: '18:00',
  daysOfWeek: [1, 2, 3, 4, 5],
};

const ROLES_REQUIRING_BRANCH = [ROLES.BRANCH_ADMIN, ROLES.EMPLOYEE];
const ROLES_WITH_SHIFTS = [ROLES.EMPLOYEE];

const USER_LIST_TABS = [
  { id: 'active', label: 'Active users' },
  { id: 'deactivated', label: 'Deactivated' },
];

const USER_MODAL_CLASS = 'max-w-2xl';
const USER_FORM_GRID =
  'mt-stellar-4 grid min-w-0 grid-cols-1 gap-stellar-4 md:grid-cols-2';
const FORM_SECTION =
  'col-span-full text-xs font-semibold uppercase tracking-wide text-stellar-text-muted';
const FORM_FIELD = 'form-group min-w-0 w-full';
const FORM_SELECT = 'input w-full min-w-0 max-w-full';
const FORM_ACTIONS =
  'col-span-full flex flex-col-reverse gap-stellar-3 border-t border-stellar-border pt-stellar-4 sm:flex-row sm:justify-end';

function FormSection({ children }) {
  return <p className={FORM_SECTION}>{children}</p>;
}

function FormActions({ onCancel, submitLabel, loading, disabled }) {
  return (
    <div className={FORM_ACTIONS}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        {submitLabel}
      </Button>
    </div>
  );
}

const ADDRESS_FIELDS = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  password: '',
  role: ROLES.EMPLOYEE,
  branch: '',
  phone: '',
  employeePosition: 'sales_staff',
  shiftIds: [],
  ...ADDRESS_FIELDS,
};

function buildAddressPayload(form) {
  if (!form.addressLine1?.trim()) return undefined;
  return {
    line1: form.addressLine1.trim(),
    line2: form.addressLine2?.trim() || undefined,
    city: form.city?.trim() || '',
    state: form.state?.trim() || '',
    postalCode: form.postalCode?.trim() || undefined,
  };
}

function mapUploadedDocuments(uploadRes, files) {
  const uploaded = uploadRes.data?.data?.documents || [];
  return uploaded.map((doc, index) => ({
    name: doc.originalName || files[index]?.name || 'document',
    url: doc.url,
    publicId: doc.publicId,
    mimeType: doc.mimeType || files[index]?.type,
  }));
}

function AddressFields({ values, onChange }) {
  const set = (key, val) => onChange((s) => ({ ...s, [key]: val }));
  return (
    <div className={`${FORM_FIELD} col-span-full`}>
      <label className="form-label">Address</label>
      <div className="grid grid-cols-1 gap-stellar-3 md:grid-cols-2">
        <input
          className={FORM_SELECT}
          placeholder="Line 1"
          value={values.addressLine1}
          onChange={(e) => set('addressLine1', e.target.value)}
        />
        <input
          className={FORM_SELECT}
          placeholder="Line 2"
          value={values.addressLine2}
          onChange={(e) => set('addressLine2', e.target.value)}
        />
        <input
          className={FORM_SELECT}
          placeholder="City"
          value={values.city}
          onChange={(e) => set('city', e.target.value)}
        />
        <input
          className={FORM_SELECT}
          placeholder="State"
          value={values.state}
          onChange={(e) => set('state', e.target.value)}
        />
        <input
          className={`${FORM_SELECT} md:col-span-2`}
          placeholder="Postal code"
          value={values.postalCode}
          onChange={(e) => set('postalCode', e.target.value)}
        />
      </div>
    </div>
  );
}

function DocumentUploadField({ label, files, onFilesChange, existing = [] }) {
  return (
    <div className={`${FORM_FIELD} col-span-full`}>
      <label className="form-label">{label}</label>
      <input
        type="file"
        className={`${FORM_SELECT} text-sm file:mr-stellar-3 file:rounded-md file:border-0 file:bg-stellar-surface-muted file:px-stellar-3 file:py-stellar-2 file:text-sm`}
        accept="image/*,application/pdf"
        multiple
        onChange={(e) => onFilesChange(Array.from(e.target.files || []))}
      />
      {files.length > 0 && (
        <p className="mt-stellar-2 text-xs text-stellar-text-muted">
          {files.length} new file(s) selected
        </p>
      )}
      {existing.length > 0 && (
        <ul className="mt-stellar-3 space-y-stellar-2 text-sm">
          {existing.map((doc) => (
            <li key={doc.publicId || doc.url}>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-stellar-primary hover:underline"
              >
                {doc.name || 'Document'}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ShiftCheckboxGroup({ shifts, value, onChange }) {
  if (!shifts.length) {
    return (
      <p className="text-sm text-stellar-text-muted">
        No shifts for this branch. Create shifts first.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-stellar-2 md:grid-cols-2">
      {shifts.map((s) => {
        const id = s.id || s._id;
        return (
          <label
            key={id}
            className="flex min-w-0 items-start gap-stellar-2 break-words text-sm"
          >
            <input
              type="checkbox"
              checked={value.includes(id)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...value, id]
                  : value.filter((x) => x !== id);
                onChange(next);
              }}
            />
            {s.name} ({s.startTime}–{s.endTime})
          </label>
        );
      })}
    </div>
  );
}

function dayLabels(days) {
  if (!days?.length) return '—';
  return days
    .map((d) => DOW.find((x) => x.value === d)?.label || d)
    .join(', ');
}

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  const [userTab, setUserTab] = useState('active');
  const {
    search,
    setSearch,
    submitSearch,
    appliedSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  } = useListFilters();
  const [activeUsers, setActiveUsers] = useState([]);
  const [deactivatedUsers, setDeactivatedUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceUser, setAttendanceUser] = useState(null);

  const [shiftBranch, setShiftBranch] = useState('');
  const [shiftForm, setShiftForm] = useState(EMPTY_SHIFT);
  const [viewShiftsBranch, setViewShiftsBranch] = useState('');
  const [editingShift, setEditingShift] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [userDocFiles, setUserDocFiles] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [editDocFiles, setEditDocFiles] = useState([]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [activeRes, deactivatedRes] = await Promise.all([
        fetchUsers({ accountStatus: 'active', ...dateParams }),
        fetchUsers({ accountStatus: 'deactivated', ...dateParams }),
      ]);
      setActiveUsers(activeRes.data.data.users || []);
      setDeactivatedUsers(deactivatedRes.data.data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users');
      setActiveUsers([]);
      setDeactivatedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedUsers = useMemo(() => {
    const list = userTab === 'deactivated' ? deactivatedUsers : activeUsers;
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => {
      const haystack = [u.name, u.email, u.phone, u.employeeId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [userTab, activeUsers, deactivatedUsers, appliedSearch]);

  const loadShifts = async (branchId) => {
    if (!branchId) {
      setShifts([]);
      return;
    }
    try {
      const res = await fetchShifts({ branch: branchId, status: 'active', limit: 200 });
      setShifts(res.data.data.shifts || []);
    } catch {
      setShifts([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [dateParams]);

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then((r) => {
        const list = r.data.data.branches || [];
        setBranches(list);
        if (list[0]?.id) {
          setShiftBranch(list[0].id);
          setViewShiftsBranch(list[0].id);
        }
      })
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    if (modal === 'addShift' && shiftBranch) loadShifts(shiftBranch);
    if (modal === 'viewShifts' && viewShiftsBranch) loadShifts(viewShiftsBranch);
  }, [modal, shiftBranch, viewShiftsBranch]);

  useEffect(() => {
    if (modal === 'addUser' && userForm.branch) loadShifts(userForm.branch);
    if (modal === 'editUser' && editForm?.branch) loadShifts(editForm.branch);
  }, [modal, userForm.branch, editForm?.branch]);

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.id, b])),
    [branches],
  );

  const shiftMap = useMemo(() => new Map(shifts.map((s) => [s.id, s])), [shifts]);

  const openModal = (name) => {
    setModal(name);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
    setEditForm(null);
    setUserForm(EMPTY_USER_FORM);
    setUserDocFiles([]);
    setEditDocFiles([]);
    setEditingShift(null);
    setShiftToDelete(null);
  };

  const returnToViewShifts = () => {
    setEditingShift(null);
    setShiftToDelete(null);
    setModal('viewShifts');
    if (viewShiftsBranch) loadShifts(viewShiftsBranch);
  };

  const openEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name || '',
      startTime: shift.startTime || '09:00',
      endTime: shift.endTime || '18:00',
      daysOfWeek: shift.daysOfWeek || [1, 2, 3, 4, 5],
    });
    setModal('editShift');
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    if (!editingShift) return;
    const shiftId = editingShift.id || editingShift._id;
    setSubmitting(true);
    try {
      await updateShift(shiftId, shiftForm);
      toast.success('Shift updated');
      returnToViewShifts();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to update shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    const shiftId = shiftToDelete.id || shiftToDelete._id;
    setSubmitting(true);
    try {
      await deleteShift(shiftId);
      toast.success('Shift deleted');
      returnToViewShifts();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to delete shift');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || ROLES.EMPLOYEE,
      branch: user.branchId || user.branch || '',
      employeePosition: user.employeePosition || 'sales_staff',
      shiftIds: (user.shiftIds || []).map(String),
      status: user.status || 'active',
      addressLine1: user.address?.line1 || '',
      addressLine2: user.address?.line2 || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      postalCode: user.address?.postalCode || '',
      documents: user.documents || [],
    });
    setEditDocFiles([]);
    setModal('editUser');
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createShift({
        branch: shiftBranch,
        ...shiftForm,
      });
      toast.success('Shift created');
      setShiftForm(EMPTY_SHIFT);
      await loadShifts(shiftBranch);
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to create shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const validationErrors = validateRegisterUserForm(userForm);
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      setSubmitting(false);
      return;
    }

    try {
      let documents = [];
      if (userDocFiles.length) {
        const branchId = userForm.branch || undefined;
        const uploadRes = await uploadUserDocuments(userDocFiles, { branchId });
        documents = mapUploadedDocuments(uploadRes, userDocFiles);
      }

      await registerUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        branch: userForm.branch || undefined,
        phone: userForm.phone || undefined,
        employeePosition:
          userForm.role === ROLES.EMPLOYEE ? userForm.employeePosition : undefined,
        shiftIds: ROLES_WITH_SHIFTS.includes(userForm.role)
          ? userForm.shiftIds.filter((id) => /^[a-f\d]{24}$/i.test(String(id)))
          : [],
        address: buildAddressPayload(userForm),
        documents,
      });
      toast.success('User created');
      setUserForm(EMPTY_USER_FORM);
      setUserDocFiles([]);
      closeModal();
      await loadUsers();
    } catch (e2) {
      toast.error(formatApiError(e2, 'Create failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !editForm) return;
    setSubmitting(true);
    try {
      let documents = editForm.documents || [];
      if (editDocFiles.length) {
        const branchId = editForm.branch || selectedUser.branchId || undefined;
        const uploadRes = await uploadUserDocuments(editDocFiles, { branchId });
        documents = [...documents, ...mapUploadedDocuments(uploadRes, editDocFiles)];
      }

      await updateUser(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        branch: editForm.branch || null,
        employeePosition:
          editForm.role === ROLES.EMPLOYEE ? editForm.employeePosition : undefined,
        shiftIds: ROLES_WITH_SHIFTS.includes(editForm.role) ? editForm.shiftIds : [],
        address: buildAddressPayload(editForm),
        documents,
      });
      if (editForm.status !== selectedUser.status) {
        await updateUserStatus(selectedUser.id, editForm.status);
      }
      toast.success('User updated');
      closeModal();
      await loadUsers();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await updateUserStatus(selectedUser.id, 'inactive');
      toast.success('User deactivated');
      closeModal();
      await loadUsers();
    } catch (e2) {
      toast.error(formatApiError(e2, 'Deactivate failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await updateUserStatus(selectedUser.id, 'active');
      toast.success('User activated');
      closeModal();
      await loadUsers();
    } catch (e2) {
      toast.error(formatApiError(e2, 'Activation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUserPermanently(selectedUser.id);
      toast.success('User permanently deleted');
      closeModal();
      await loadUsers();
    } catch (e2) {
      toast.error(formatApiError(e2, 'Delete failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-stellar-text sm:text-2xl">
            Users
          </h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Create accounts with role, branch, and shifts. Users sign in to the panel for their role.
          </p>
        </div>
        <div className="flex w-full flex-col gap-stellar-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => openModal('addShift')}
          >
            Add shift
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => openModal('viewShifts')}
          >
            View shifts
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => openModal('addUser')}
          >
            Add user
          </Button>
        </div>
      </div>

      <Card>
        <Card.Content>
          <ListFiltersBar
            idPrefix="admin-users"
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={submitSearch}
            searchPlaceholder="Name, email, or phone…"
            period={period}
            onPeriodChange={setPeriod}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            showSubmit={false}
          />
        </Card.Content>
      </Card>

            <div className="nav-scroll flex gap-stellar-2 overflow-x-auto pb-stellar-1 scrollbar-stellar">
        {USER_LIST_TABS.map((t) => {
          const count = t.id === 'deactivated' ? deactivatedUsers.length : activeUsers.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setUserTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-stellar ${
                userTab === t.id
                  ? 'bg-stellar-accent text-stellar-accent-fg'
                  : 'bg-stellar-surface-muted text-stellar-text-muted hover:text-stellar-text'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4">
          <h2 className="text-sm font-semibold">
            {userTab === 'deactivated' ? 'Deactivated users' : 'Active users'}
          </h2>
          <p className="mt-stellar-1 text-xs text-stellar-text-muted">
            {userTab === 'deactivated'
              ? 'Reactivate accounts or permanently remove user data (super admin only).'
              : 'Users who can sign in or are pending activation.'}
          </p>
        </div>

        {loading ? (
          <div className="p-stellar-6 text-sm text-stellar-text-muted">Loading users…</div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-stellar-6 text-sm text-stellar-text-muted">
            {userTab === 'deactivated' ? 'No deactivated users.' : 'No active users yet.'}
          </div>
        ) : (
          <>
            <div className="data-table-scroll hidden md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{ROLE_LABELS[u.role] || u.role}</td>
                      <td>{u.branchId ? formatBranchDisplay(branchMap.get(u.branchId)) : '—'}</td>
                      <td className="capitalize">{u.status || 'active'}</td>
                      <td className="text-right">
                        <div className="flex flex-wrap justify-end gap-stellar-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setModal('viewUser');
                            }}
                          >
                            View
                          </Button>
                          {userTab === 'active' ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAttendanceUser(u)}
                              >
                                Attendance
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-stellar-danger"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setModal('deactivateUser');
                                }}
                              >
                                Deactivate
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setModal('activateUser');
                                }}
                              >
                                Activate
                              </Button>
                              {isSuperAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-stellar-danger"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setModal('deleteUserPermanent');
                                  }}
                                >
                                  Delete permanently
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-stellar-border md:hidden">
              {displayedUsers.map((u) => (
                <li key={u.id} className="p-stellar-4">
                  <div className="flex items-start justify-between gap-stellar-2">
                    <div className="min-w-0">
                      <p className="font-medium text-stellar-text">{u.name}</p>
                      <p className="mt-stellar-1 truncate text-xs text-stellar-text-muted">{u.email}</p>
                    </div>
                    <span className="shrink-0 text-xs capitalize text-stellar-text-muted">
                      {u.status || 'active'}
                    </span>
                  </div>
                  <p className="mt-stellar-2 text-xs text-stellar-text-muted">
                    {ROLE_LABELS[u.role] || u.role}
                    {u.branchId
                      ? ` · ${formatBranchDisplay(branchMap.get(u.branchId))}`
                      : ''}
                  </p>
                  <div className="mt-stellar-3 flex flex-wrap gap-stellar-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setModal('viewUser');
                      }}
                    >
                      View
                    </Button>
                    {userTab === 'active' ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAttendanceUser(u)}>
                          Attendance
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-stellar-danger"
                          onClick={() => {
                            setSelectedUser(u);
                            setModal('deactivateUser');
                          }}
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setModal('activateUser');
                          }}
                        >
                          Activate
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-stellar-danger"
                            onClick={() => {
                              setSelectedUser(u);
                              setModal('deleteUserPermanent');
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* Add shift */}
      <Modal open={modal === 'addShift'} title="Add shift" onClose={closeModal}>
                <form onSubmit={handleCreateShift} className="mt-stellar-4 space-y-stellar-4">
          <SearchableSelect
            label="Branch"
            value={shiftBranch}
            onChange={(e) => setShiftBranch(e.target.value)}
            options={toSelectOptions(branches, {
              getLabel: (b) => formatBranchOptionLabel(b),
              getKeywords: (b) => `${b.name} ${b.code}`,
            })}
            required
          />
          <Input
            label="Shift name"
            value={shiftForm.name}
            onChange={(e) => setShiftForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-stellar-3">
            <Input
              label="Start (HH:MM)"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm((s) => ({ ...s, startTime: e.target.value }))}
              required
            />
            <Input
              label="End (HH:MM)"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm((s) => ({ ...s, endTime: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Days</label>
            <div className="flex flex-wrap gap-stellar-3">
              {DOW.map((d) => (
                <label key={d.value} className="flex items-center gap-stellar-2 text-sm">
                  <input
                    type="checkbox"
                    checked={shiftForm.daysOfWeek.includes(d.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...shiftForm.daysOfWeek, d.value]
                        : shiftForm.daysOfWeek.filter((x) => x !== d.value);
                      setShiftForm((s) => ({
                        ...s,
                        daysOfWeek: next.sort((a, b) => a - b),
                      }));
                    }}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-stellar-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* View shifts */}
      <Modal open={modal === 'viewShifts'} title="View shifts" onClose={closeModal} className="max-w-3xl">
                <div className="mt-stellar-4">
          <SearchableSelect
            label="Branch"
            value={viewShiftsBranch}
            onChange={(e) => {
              setViewShiftsBranch(e.target.value);
              loadShifts(e.target.value);
            }}
            options={toSelectOptions(branches, {
              getLabel: (b) => formatBranchOptionLabel(b),
              getKeywords: (b) => `${b.name} ${b.code}`,
            })}
          />
        </div>
        <div className="mt-stellar-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Time</th>
                <th>Days</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id || s._id}>
                  <td>{s.name}</td>
                  <td className="font-mono text-sm">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="text-sm text-stellar-text-muted">{dayLabels(s.daysOfWeek)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-stellar-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditShift(s)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-stellar-danger"
                        onClick={() => {
                          setShiftToDelete(s);
                          setModal('deleteShift');
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-stellar-4 text-sm text-stellar-text-muted">
                    No shifts for this branch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-stellar-6 flex justify-end">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Edit shift */}
      <Modal open={modal === 'editShift'} title="Edit shift" onClose={returnToViewShifts}>
                <form onSubmit={handleUpdateShift} className="mt-stellar-4 space-y-stellar-4">
          <Input
            label="Shift name"
            value={shiftForm.name}
            onChange={(e) => setShiftForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-stellar-3">
            <Input
              label="Start (HH:MM)"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm((s) => ({ ...s, startTime: e.target.value }))}
              required
            />
            <Input
              label="End (HH:MM)"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm((s) => ({ ...s, endTime: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Days</label>
            <div className="flex flex-wrap gap-stellar-3">
              {DOW.map((d) => (
                <label key={d.value} className="flex items-center gap-stellar-2 text-sm">
                  <input
                    type="checkbox"
                    checked={shiftForm.daysOfWeek.includes(d.value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...shiftForm.daysOfWeek, d.value]
                        : shiftForm.daysOfWeek.filter((x) => x !== d.value);
                      setShiftForm((s) => ({
                        ...s,
                        daysOfWeek: next.sort((a, b) => a - b),
                      }));
                    }}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-stellar-3">
            <Button type="button" variant="secondary" onClick={returnToViewShifts}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete shift */}
      <Modal open={modal === 'deleteShift'} title="Delete shift" onClose={returnToViewShifts}>
                <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Delete shift <strong className="text-stellar-text">{shiftToDelete?.name}</strong>?
          It will be removed from employee schedules.
        </p>
        <div className="mt-stellar-6 flex justify-end gap-stellar-3">
          <Button variant="secondary" onClick={returnToViewShifts} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteShift} isLoading={submitting}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Add user */}
      <Modal
        open={modal === 'addUser'}
        title="Add user"
        onClose={closeModal}
        className={USER_MODAL_CLASS}
        scrollBody
      >
                <p className="text-sm text-stellar-text-muted">
          Email and password are used for panel login. After sign-in, users open the dashboard for
          their role.
        </p>
        <form onSubmit={handleCreateUser} className={USER_FORM_GRID}>
          <FormSection>Login credentials</FormSection>
          <Input
            label="Login email"
            type="email"
            wrapperClassName="min-w-0"
            value={userForm.email}
            onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <PasswordInput
            label="Login password"
            wrapperClassName="min-w-0"
            value={userForm.password}
            onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))}
            hint={PASSWORD_HINT}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FormSection>Profile</FormSection>
          <Input
            label="Name"
            wrapperClassName="min-w-0"
            value={userForm.name}
            onChange={(e) => setUserForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            wrapperClassName="min-w-0"
            value={userForm.phone}
            onChange={(e) => setUserForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <SearchableSelect
            label="Role"
            wrapperClassName={FORM_FIELD}
            className={FORM_SELECT}
            value={userForm.role}
            onChange={(e) => {
              const role = e.target.value;
              setUserForm((s) => ({
                ...s,
                role,
                branch: ROLES_REQUIRING_BRANCH.includes(role) ? s.branch : '',
                shiftIds: ROLES_WITH_SHIFTS.includes(role) ? s.shiftIds : [],
              }));
            }}
            options={ROLE_OPTIONS}
          />
          {ROLES_REQUIRING_BRANCH.includes(userForm.role) && (
            <SearchableSelect
              label="Branch"
              wrapperClassName={FORM_FIELD}
              className={FORM_SELECT}
              value={userForm.branch}
              onChange={(e) =>
                setUserForm((s) => ({ ...s, branch: e.target.value, shiftIds: [] }))
              }
              options={branchSelectOptions(branches)}
              required
            />
          )}
          {userForm.role === ROLES.EMPLOYEE && (
            <SearchableSelect
              label="Employee type"
              wrapperClassName={FORM_FIELD}
              className={FORM_SELECT}
              value={userForm.employeePosition}
              onChange={(e) =>
                setUserForm((s) => ({ ...s, employeePosition: e.target.value }))
              }
              options={EMPLOYEE_POSITIONS.map((p) => ({ value: p.value, label: p.label }))}
            />
          )}
          {ROLES_WITH_SHIFTS.includes(userForm.role) && userForm.branch && (
            <div className={`${FORM_FIELD} col-span-full`}>
              <label className="form-label">Shifts (optional)</label>
              <ShiftCheckboxGroup
                shifts={shifts}
                value={userForm.shiftIds}
                onChange={(shiftIds) => setUserForm((s) => ({ ...s, shiftIds }))}
              />
            </div>
          )}
          <AddressFields values={userForm} onChange={setUserForm} />
          <DocumentUploadField
            label="Documents (images or PDF, optional)"
            files={userDocFiles}
            onFilesChange={setUserDocFiles}
          />
          <FormActions
            onCancel={closeModal}
            submitLabel="Create user"
            loading={submitting}
          />
        </form>
      </Modal>

      {/* View user */}
      <Modal open={modal === 'viewUser'} title="User details" onClose={closeModal}>
        {selectedUser && (
          <dl className="mt-stellar-4 space-y-stellar-3 text-sm">
            <div>
              <dt className="text-stellar-text-muted">Name</dt>
              <dd className="font-medium text-stellar-text">{selectedUser.name}</dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Email</dt>
              <dd>{selectedUser.email}</dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Role</dt>
              <dd>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Branch</dt>
              <dd>
                {selectedUser.branchId
                  ? formatBranchDisplay(branchMap.get(selectedUser.branchId))
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-stellar-text-muted">Status</dt>
              <dd className="capitalize">{selectedUser.status}</dd>
            </div>
            {selectedUser.shiftIds?.length > 0 && (
              <div>
                <dt className="text-stellar-text-muted">Shifts</dt>
                <dd>
                  {selectedUser.shiftIds
                    .map((id) => shiftMap.get(id)?.name || id)
                    .join(', ') || '—'}
                </dd>
              </div>
            )}
            {selectedUser.address?.line1 && (
              <div>
                <dt className="text-stellar-text-muted">Address</dt>
                <dd>
                  {[
                    selectedUser.address.line1,
                    selectedUser.address.line2,
                    selectedUser.address.city,
                    selectedUser.address.state,
                    selectedUser.address.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </dd>
              </div>
            )}
            {selectedUser.documents?.length > 0 && (
              <div>
                <dt className="text-stellar-text-muted">Documents</dt>
                <dd className="space-y-stellar-1">
                  {selectedUser.documents.map((doc) => (
                    <div key={doc.publicId || doc.url}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stellar-primary hover:underline"
                      >
                        {doc.name || 'Document'}
                      </a>
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
        {selectedUser && (
          <div className="mt-stellar-6">
            <AdminUserPasswordPanel userId={selectedUser.id} userLabel={selectedUser.name} />
          </div>
        )}
        <div className="mt-stellar-6 flex flex-wrap justify-end gap-stellar-2">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Edit user */}
      <Modal
        open={modal === 'editUser'}
        title="Edit user"
        onClose={closeModal}
        className={USER_MODAL_CLASS}
        scrollBody
      >
                {editForm && (
          <form onSubmit={handleEdit} className={USER_FORM_GRID}>
            <FormSection>Login credentials</FormSection>
            <Input
              label="Login email"
              type="email"
              wrapperClassName="min-w-0"
              value={editForm.email}
              onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
            <p className="col-span-full text-sm text-stellar-text-muted md:col-span-1 md:flex md:items-end">
              Use Change password on the user view to reset login password.
            </p>
            <FormSection>Profile</FormSection>
            <Input
              label="Name"
              wrapperClassName="min-w-0"
              value={editForm.name}
              onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              wrapperClassName="min-w-0"
              value={editForm.phone}
              onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))}
            />
            <SearchableSelect
              label="Role"
              wrapperClassName={FORM_FIELD}
              className={FORM_SELECT}
              value={editForm.role}
              onChange={(e) => {
                const role = e.target.value;
                setEditForm((s) => ({
                  ...s,
                  role,
                  branch: ROLES_REQUIRING_BRANCH.includes(role) ? s.branch : '',
                  shiftIds: ROLES_WITH_SHIFTS.includes(role) ? s.shiftIds : [],
                }));
              }}
              options={ROLE_OPTIONS}
            />
            {ROLES_REQUIRING_BRANCH.includes(editForm.role) && (
              <SearchableSelect
                label="Branch"
                wrapperClassName={FORM_FIELD}
                className={FORM_SELECT}
                value={editForm.branch}
                onChange={(e) =>
                  setEditForm((s) => ({ ...s, branch: e.target.value, shiftIds: [] }))
                }
                options={branchSelectOptions(branches)}
                required
              />
            )}
            {editForm.role === ROLES.EMPLOYEE && (
              <SearchableSelect
                label="Employee type"
                wrapperClassName={FORM_FIELD}
                className={FORM_SELECT}
                value={editForm.employeePosition}
                onChange={(e) =>
                  setEditForm((s) => ({ ...s, employeePosition: e.target.value }))
                }
                options={EMPLOYEE_POSITIONS.map((p) => ({ value: p.value, label: p.label }))}
              />
            )}
            {ROLES_WITH_SHIFTS.includes(editForm.role) && editForm.branch && (
              <div className={`${FORM_FIELD} col-span-full`}>
                <label className="form-label">Shifts</label>
                <ShiftCheckboxGroup
                  shifts={shifts}
                  value={editForm.shiftIds}
                  onChange={(shiftIds) => setEditForm((s) => ({ ...s, shiftIds }))}
                />
              </div>
            )}
            <AddressFields values={editForm} onChange={setEditForm} />
            <DocumentUploadField
              label="Add documents (images or PDF)"
              files={editDocFiles}
              onFilesChange={setEditDocFiles}
              existing={editForm.documents}
            />
            <div className={FORM_FIELD}>
              <label className="form-label">Status</label>
              <select
                className={FORM_SELECT}
                value={editForm.status}
                onChange={(e) => setEditForm((s) => ({ ...s, status: e.target.value }))}
              >
                {USER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <FormActions
              onCancel={closeModal}
              submitLabel="Save changes"
              loading={submitting}
            />
          </form>
        )}
      </Modal>

      {/* Deactivate user */}
      <Modal open={modal === 'deactivateUser'} title="Deactivate user" onClose={closeModal}>
                <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Deactivate <strong className="text-stellar-text">{selectedUser?.name}</strong>? They
          will not be able to sign in until reactivated from the Deactivated tab.
        </p>
        <div className="mt-stellar-6 flex justify-end gap-stellar-3">
          <Button variant="secondary" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeactivate} isLoading={submitting}>
            Deactivate
          </Button>
        </div>
      </Modal>

      {/* Activate user */}
      <Modal open={modal === 'activateUser'} title="Activate user" onClose={closeModal}>
                <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Reactivate <strong className="text-stellar-text">{selectedUser?.name}</strong>? They
          will be able to sign in again.
        </p>
        <div className="mt-stellar-6 flex justify-end gap-stellar-3">
          <Button variant="secondary" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleActivate} isLoading={submitting}>
            Activate
          </Button>
        </div>
      </Modal>

      {/* Permanent delete */}
      <Modal
        open={modal === 'deleteUserPermanent'}
        title="Delete user permanently"
        onClose={closeModal}
      >
                <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Permanently delete <strong className="text-stellar-text">{selectedUser?.name}</strong>{' '}
          ({selectedUser?.email})? This removes their account, login sessions, attendance records,
          and uploaded documents. This cannot be undone.
        </p>
        <div className="mt-stellar-6 flex justify-end gap-stellar-3">
          <Button variant="secondary" onClick={closeModal} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handlePermanentDelete} isLoading={submitting}>
            Delete permanently
          </Button>
        </div>
      </Modal>

      <UserAttendanceModal
        user={attendanceUser}
        open={Boolean(attendanceUser)}
        onClose={() => setAttendanceUser(null)}
      />

    </div>
  );
}

export default AdminUsersPage;
