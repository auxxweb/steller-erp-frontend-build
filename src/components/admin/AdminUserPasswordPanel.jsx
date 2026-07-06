import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import Modal from '../ui/Modal.jsx';
import { regenerateUserPassword, viewUserPassword } from '../../services/userService.js';
import { PASSWORD_HINT, validatePasswordStrength } from '../../utils/passwordValidation.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function AdminUserPasswordPanel({ userId, userLabel }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPassword('');
    setPasswordLoaded(false);
    setChangeModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [userId]);

  const loadCurrentPassword = async () => {
    if (!userId) return;
    setLoadingPassword(true);
    try {
      const res = await viewUserPassword(userId);
      setCurrentPassword(res.data.data.password || '');
      setPasswordLoaded(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load current password'));
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleCopyPassword = async () => {
    let value = currentPassword;
    if (!passwordLoaded) {
      setLoadingPassword(true);
      try {
        const res = await viewUserPassword(userId);
        value = res.data.data.password || '';
        setCurrentPassword(value);
        setPasswordLoaded(true);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not copy password'));
        return;
      } finally {
        setLoadingPassword(false);
      }
    }
    if (!value) {
      toast.error('No password available to copy');
      return;
    }
    try {
      await copyText(value);
      toast.success('Password copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const closeChangeModal = () => {
    setChangeModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validateChangeForm = () => {
    const next = {};
    const strength = validatePasswordStrength(newPassword);
    if (strength.length) next.newPassword = strength[0];
    if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateChangeForm()) return;
    setSubmitting(true);
    try {
      await regenerateUserPassword(userId, { password: newPassword });
      setCurrentPassword(newPassword);
      setPasswordLoaded(true);
      toast.success('Password updated');
      closeChangeModal();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not change password'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="space-y-stellar-4 rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/30 p-stellar-4">
      <div>
        <h3 className="text-sm font-semibold text-stellar-text">Login password</h3>
        <p className="mt-stellar-1 text-xs text-stellar-text-muted">
          View or reset the password for {userLabel || 'this user'}. The current password is not required
          to set a new one.
        </p>
      </div>

      <div className="space-y-stellar-2">
        <PasswordInput
          label="Current password"
          id={`admin-current-password-${userId}`}
          value={passwordLoaded ? currentPassword : ''}
          readOnly
          placeholder={passwordLoaded ? '' : 'Click Show to reveal'}
          autoComplete="off"
          hint={passwordLoaded ? undefined : 'Load the stored password to view or copy it.'}
        />
        <div className="flex flex-wrap gap-stellar-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadCurrentPassword}
            isLoading={loadingPassword}
            disabled={loadingPassword}
          >
            {passwordLoaded ? 'Refresh password' : 'Show current password'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyPassword}
            disabled={loadingPassword}
          >
            Copy to clipboard
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => setChangeModalOpen(true)}>
            Change password
          </Button>
        </div>
      </div>

      <Modal
        open={changeModalOpen}
        title={userLabel ? `Change password — ${userLabel}` : 'Change password'}
        onClose={closeChangeModal}
        className="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-stellar-4">
          <PasswordInput
            label="New password"
            id={`admin-new-password-${userId}`}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            hint={PASSWORD_HINT}
            required
          />
          <PasswordInput
            label="Confirm new password"
            id={`admin-confirm-password-${userId}`}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />
          <div className="flex flex-wrap justify-end gap-stellar-2">
            <Button type="button" variant="secondary" onClick={closeChangeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              {submitting ? 'Saving…' : 'Change password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminUserPasswordPanel;
