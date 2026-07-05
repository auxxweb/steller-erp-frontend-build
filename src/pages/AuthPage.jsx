import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import useAuth from '../hooks/useAuth.js';
import { getRoleDashboardPath } from '../utils/roleRedirect.js';
import { ROLE_LABELS, ROLES } from '../utils/constants.js';
import { toast } from '../lib/toastStore.js';
import { getApiErrorMessage } from '../utils/userValidation.js';

const VIEWS = {
  LOGIN: 'login',
  FORGOT: 'forgot',
  RESET: 'reset',
};

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, forgotPassword, resetPassword, isLoading } = useAuth();
  const sessionExpired = searchParams.get('expired') === '1';

  const tokenFromUrl = searchParams.get('token');
  const [view, setView] = useState(() => (tokenFromUrl ? VIEWS.RESET : VIEWS.LOGIN));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(() => tokenFromUrl || '');
  const sessionToastShown = useRef(false);

  useEffect(() => {
    if (sessionExpired && view === VIEWS.LOGIN && !sessionToastShown.current) {
      sessionToastShown.current = true;
      toast.info('Your session has expired. Please sign in again.');
    }
  }, [sessionExpired, view]);

  const switchView = (nextView) => {
    setView(nextView);
    if (nextView !== VIEWS.RESET) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login({ email, password });
      const path = getRoleDashboardPath(data.user.role);
      navigate(path, { replace: true });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Unable to sign in. Check your credentials.'),
      );
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();

    try {
      const result = await forgotPassword(email);
      let msg = result.message || 'Check your email for reset instructions.';
      if (import.meta.env.DEV && result.resetUrl) {
        msg = `${result.message} (Dev: link logged in console)`;
        console.info('[auth] Reset URL:', result.resetUrl);
      }
      toast.success(msg);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Unable to process request.'));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const result = await resetPassword({
        token: resetToken,
        password: newPassword,
      });
      toast.success(result.message || 'Password updated. You can sign in now.');
      setTimeout(() => switchView(VIEWS.LOGIN), 2000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Unable to reset password.'));
    }
  };

  const titles = {
    [VIEWS.LOGIN]: { title: 'Welcome back', subtitle: 'Sign in to Stellar ERP — all roles use this portal' },
    [VIEWS.FORGOT]: { title: 'Forgot password', subtitle: 'We will send you a secure reset link' },
    [VIEWS.RESET]: { title: 'Reset password', subtitle: 'Choose a strong new password' },
  };

  const { title, subtitle } = titles[view];

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="mb-stellar-8 flex flex-col items-center text-center animate-fade-in">
        <div className="relative">
          <div
            className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-40"
            style={{
              background:
                'radial-gradient(circle, var(--stellar-silver) 0%, transparent 70%)',
            }}
            aria-hidden
          />
          <Logo variant="full" className="!h-24 sm:!h-28" />
        </div>
        <h1 className="mt-stellar-5 text-xl font-bold tracking-tight text-stellar-text sm:text-2xl">
          Camera Rentals ERP
        </h1>
        <p className="mt-stellar-1 text-xs uppercase tracking-[0.25em] text-stellar-text-muted">
          Enterprise Resource Planning
        </p>
      </div>

      {/* Card */}
      <div
        key={view}
        className="card-elevated overflow-hidden animate-scale-in opacity-0-start p-stellar-6 sm:p-stellar-8"
      >
        <header className="mb-stellar-6">
          <h2 className="text-lg font-semibold tracking-tight text-stellar-text">{title}</h2>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">{subtitle}</p>
        </header>

        {view === VIEWS.LOGIN && (
          <form onSubmit={handleLogin} className="space-y-stellar-4">
            <Input
              label="Email"
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stellar.com"
              disabled={isLoading}
            />

            <PasswordInput
              label="Password"
              id="auth-password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchView(VIEWS.FORGOT)}
                className="text-xs font-medium text-stellar-text-muted transition-stellar hover:text-stellar-text"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Spinner
                  size="sm"
                  className="border-stellar-accent-fg/30 border-t-stellar-accent-fg"
                />
              ) : null}
              Sign in
            </Button>

            <RoleHint />
          </form>
        )}

        {view === VIEWS.FORGOT && (
          <form onSubmit={handleForgot} className="space-y-stellar-4">
            <Input
              label="Email"
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stellar.com"
              disabled={isLoading}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Spinner
                  size="sm"
                  className="border-stellar-accent-fg/30 border-t-stellar-accent-fg"
                />
              ) : null}
              Send reset link
            </Button>

            <button
              type="button"
              onClick={() => switchView(VIEWS.LOGIN)}
              className="w-full text-center text-sm text-stellar-text-muted transition-stellar hover:text-stellar-text"
              disabled={isLoading}
            >
              Back to sign in
            </button>
          </form>
        )}

        {view === VIEWS.RESET && (
          <form onSubmit={handleReset} className="space-y-stellar-4">
            {!tokenFromUrl && (
              <Input
                label="Reset token"
                id="reset-token"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token from email"
                disabled={isLoading}
              />
            )}

            <PasswordInput
              label="New password"
              id="new-password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Min 8 characters with upper, lower, and number"
              disabled={isLoading}
            />

            <PasswordInput
              label="Confirm password"
              id="confirm-password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Spinner
                  size="sm"
                  className="border-stellar-accent-fg/30 border-t-stellar-accent-fg"
                />
              ) : null}
              Update password
            </Button>

            <button
              type="button"
              onClick={() => switchView(VIEWS.LOGIN)}
              className="w-full text-center text-sm text-stellar-text-muted transition-stellar hover:text-stellar-text"
              disabled={isLoading}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>

      <p className="mt-stellar-6 text-center">
        <Link
          to="/"
          className="text-xs text-stellar-text-muted transition-stellar hover:text-stellar-text"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

function RoleHint() {
  return (
    <p className="pt-stellar-2 text-center text-[11px] leading-relaxed text-stellar-text-subtle">
      Your dashboard is assigned automatically:{' '}
      <span className="text-stellar-text-muted">
        {ROLE_LABELS[ROLES.SUPER_ADMIN]}, {ROLE_LABELS[ROLES.BRANCH_ADMIN]},{' '}
        {ROLE_LABELS[ROLES.EMPLOYEE]}
      </span>
    </p>
  );
}

export default AuthPage;
