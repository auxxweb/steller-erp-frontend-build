import { useState } from 'react';
import Button from '../ui/Button.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import { changePassword } from '../../services/authService.js';
import { PASSWORD_HINT, validatePasswordStrength } from '../../utils/passwordValidation.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!currentPassword) next.currentPassword = 'Current password is required';
    const strength = validatePasswordStrength(newPassword);
    if (strength.length) next.newPassword = strength[0];
    if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password updated. Other sessions were signed out.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-stellar-4 max-w-md">
      <PasswordInput
        label="Current password"
        id="settings-current-password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.currentPassword}
      />
      <PasswordInput
        label="New password"
        id="settings-new-password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword}
        hint={PASSWORD_HINT}
      />
      <PasswordInput
        label="Confirm new password"
        id="settings-confirm-password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

export default ChangePasswordForm;
