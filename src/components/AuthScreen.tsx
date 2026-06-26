import { useState } from 'react';
import { neon } from '../neon';

type Mode = 'signin' | 'signup' | 'forgot';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await neon.auth.signIn.email({ email, password });
        if (result.error) setError(result.error.message ?? 'Sign in failed.');
      } else if (mode === 'signup') {
        const result = await neon.auth.signUp.email({ email, password, name });
        if (result.error) setError(result.error.message ?? 'Sign up failed.');
      } else {
        const result = await neon.auth.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/`,
        });
        if (result.error) {
          setError(result.error.message ?? 'Could not send reset email.');
        } else {
          setMessage('Check your email for a reset link.');
        }
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

        <h2 className="auth-title">
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'signup' && 'Create an account'}
          {mode === 'forgot' && 'Reset your password'}
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset link'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'signin' && (
            <>
              <button className="auth-link" onClick={() => { setMode('forgot'); setError(''); }}>
                Forgot password?
              </button>
              <span className="auth-links-sep">·</span>
              <button className="auth-link" onClick={() => { setMode('signup'); setError(''); }}>
                Create account
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button className="auth-link" onClick={() => { setMode('signin'); setError(''); }}>
              Already have an account? Sign in
            </button>
          )}
          {mode === 'forgot' && (
            <button className="auth-link" onClick={() => { setMode('signin'); setError(''); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
