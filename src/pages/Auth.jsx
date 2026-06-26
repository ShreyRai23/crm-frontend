import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser } from '../api';
import './Auth.css';

// ── Mock data for the live preview panel ─────────────────────────────────────
const PREVIEW_STATS = [
  { icon: '₹', label: 'Revenue',   value: '₹24.8L', change: '+12.4% this month', orange: true },
  { icon: '👥', label: 'Customers', value: '998',    change: '+34 this month',    orange: false },
  { icon: '📨', label: 'Open Rate', value: '61%',    change: 'across campaigns',  orange: false },
];

const TICKER_ITEMS = [
  { name: 'VIP Win-Back Campaign',      status: 'live',    sent: '142',  rate: '74%' },
  { name: 'Summer Flash Sale — Email',  status: 'done',    sent: '389',  rate: '58%' },
  { name: 'Re-Engagement — SMS',        status: 'running', sent: '98',   rate: '61%' },
  { name: 'New Arrival — WhatsApp',     status: 'done',    sent: '512',  rate: '82%' },
  { name: 'Loyalty Reward — RCS',       status: 'live',    sent: '67',   rate: '69%' },
  { name: 'Churn Prevention — Email',   status: 'done',    sent: '203',  rate: '44%' },
  { name: 'Weekend Promo — WhatsApp',   status: 'running', sent: '445',  rate: '77%' },
  { name: 'Post-Purchase — SMS',        status: 'done',    sent: '778',  rate: '55%' },
];

// Double the items so the infinite scroll loop is seamless
const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

// ── Left panel — animated product preview ────────────────────────────────────
function PreviewPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-content">
        {/* Brand mark */}
        <div className="auth-brand">
          <div className="auth-brand-dot" />
          <span className="auth-brand-name">Kinetics.CRM</span>
        </div>

        {/* Headline */}
        <h1 className="auth-preview-headline">
          Reach every<br />
          shopper with <span>precision.</span>
        </h1>
        <p className="auth-preview-sub">
          AI-native campaigns. Real-time analytics.<br />
          One platform for the entire marketing loop.
        </p>

        {/* Live stat cards */}
        <div className="auth-stats-grid">
          {PREVIEW_STATS.map((s) => (
            <div className="auth-stat-card" key={s.label}>
              <div className="auth-stat-icon">{s.icon}</div>
              <div className="auth-stat-label">{s.label}</div>
              <div className={`auth-stat-value${s.orange ? ' orange' : ''}`}>{s.value}</div>
              <div className="auth-stat-change">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Scrolling campaign ticker */}
        <div className="auth-ticker-label">// Live Campaign Feed</div>
        <div className="auth-ticker-viewport">
          <div className="auth-ticker-inner">
            {TICKER_DOUBLED.map((item, i) => (
              <div className="auth-ticker-row" key={i}>
                <div className={`auth-ticker-status ${item.status}`} />
                <span className="auth-ticker-name">{item.name}</span>
                <span className="auth-ticker-meta">{item.sent} sent</span>
                <span className="auth-ticker-rate">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="auth-left-footer">
          <div className="auth-brand-dot" style={{ width: 6, height: 6 }} />
          All systems operational · MongoDB Atlas · Gemini AI
        </div>
      </div>
    </div>
  );
}

// ── Main Auth page component ─────────────────────────────────────────────────
export default function Auth() {
  const { user, login }  = useAuth();
  const navigate         = useNavigate();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [formKey, setFormKey] = useState(0); // triggers slide re-animation on toggle

  // Form fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  // Already logged in → send to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const toggleMode = (newMode) => {
    setError('');
    setName(''); setEmail(''); setPassword(''); setConfirm('');
    setMode(newMode);
    setFormKey((k) => k + 1); // re-trigger slide animation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (mode === 'register') {
      if (!name.trim()) return setError('Please enter your name.');
      if (password !== confirm) return setError('Passwords do not match.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await loginUser({ email, password });
      } else {
        res = await registerUser({ name, email, password });
      }

      // res = { success, token, user }
      login(res.token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-root">
      <PreviewPanel />

      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Title — key re-mounts to trigger animation */}
          <div className="auth-form-slide" key={formKey}>
            <h2 className="auth-form-title">
              {isLogin ? 'Welcome back.' : 'Create account.'}
            </h2>
            <p className="auth-form-subtitle">
              {isLogin
                ? 'Sign in to your Kinetics.CRM workspace.'
                : 'Set up your CRM in under a minute.'}
            </p>

            {/* Error banner */}
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Name — register only */}
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    className="auth-input"
                    type="text"
                    placeholder="Shrey Rai"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@brand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={isLogin}
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  className="auth-input"
                  type="password"
                  placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm password — register only */}
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                  <input
                    id="auth-confirm"
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    {isLogin ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  isLogin ? 'Sign In →' : 'Create Account →'
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="auth-toggle">
              {isLogin ? (
                <>
                  Don&apos;t have an account?
                  <button className="auth-toggle-btn" onClick={() => toggleMode('register')}>
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?
                  <button className="auth-toggle-btn" onClick={() => toggleMode('login')}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
