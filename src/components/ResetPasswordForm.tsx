import { useState } from 'react';
import { neon } from '../neon';

interface Props {
  token: string;
  onDone: () => void;
}

export function ResetPasswordForm({ token, onDone }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await neon.auth.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError(result.error.message ?? 'Could not reset password. The link may have expired.');
      } else {
        setDone(true);
        // Clear token from URL without a page reload
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(onDone, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="CartSmart" className="auth-logo-icon" />
          <span className="auth-logo-text">CartSmart</span>
        </div>

        <div>
          <h2 className="auth-title">Choose a new password</h2>
          <p className="auth-subtitle">Must be at least 8 characters.</p>
        </div>

        {done ? (
          <p className="auth-message">
            Password updated! Signing you in&hellip;
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reset-password">New password</label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reset-confirm">Confirm password</label>
              <input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
