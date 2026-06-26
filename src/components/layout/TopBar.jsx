import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TITLES = {
  '/':          { title: 'Dashboard',   sub: 'Overview' },
  '/dashboard': { title: 'Dashboard',   sub: 'Overview' },
  '/customers': { title: 'Customers',   sub: 'Manage your audience' },
  '/campaigns': { title: 'Campaigns',   sub: 'Your marketing campaigns' },
  '/ai':        { title: 'AI Studio',   sub: 'AI-powered tools' },
  '/analytics': { title: 'Analytics',   sub: 'Performance insights' },
  '/profile':   { title: 'Profile',     sub: 'Your account' },
};

export default function TopBar({ actions }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const key = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)));

  const { title = 'Kinetics.CRM', sub = '' } = TITLES[key] || {};

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="flex flex-col" style={{ gap: 1 }}>
          <span className="topbar-breadcrumb" style={{ fontSize: 11 }}>
            // {sub}
          </span>
          <span className="topbar-title">{title}</span>
        </div>
      </div>

      <div className="topbar-right" style={{ gap: 12 }}>
        {/* Live status pill */}
        <div className="flex items-center gap-2" style={{
          background: 'var(--bg-card-alt)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          padding: '5px 10px',
          fontSize: 12,
          color: 'var(--success)',
          gap: 6,
        }}>
          <Activity size={12} />
          <span style={{ fontWeight: 600 }}>Live</span>
        </div>

        {/* Extra page actions slot */}
        {actions}

        {/* ── User section ───────────────────────────────────────── */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Avatar — clickable → profile page */}
            <button
              onClick={() => navigate('/profile')}
              title={`View profile — ${user.name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: 'var(--bg-card-alt)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 12px 5px 6px',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--orange)';
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-card-alt)';
              }}
            >
              {/* Avatar circle */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              {/* Name */}
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-1)',
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.name}
              </span>
            </button>

            {/* Logout button — red, bold */}
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                color: '#EF4444',
                fontFamily: 'var(--font-body)',
                letterSpacing: 0.2,
                transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e)   => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <LogOut size={12} strokeWidth={2.5} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
