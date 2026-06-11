import { useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

const TITLES = {
  '/':          { title: 'Dashboard',   sub: 'Overview' },
  '/customers': { title: 'Customers',   sub: 'Manage your audience' },
  '/campaigns': { title: 'Campaigns',   sub: 'Your marketing campaigns' },
  '/ai':        { title: 'AI Studio',   sub: 'AI-powered tools' },
  '/analytics': { title: 'Analytics',   sub: 'Performance insights' },
};

export default function TopBar({ actions }) {
  const { pathname } = useLocation();

  // Match prefix for nested routes
  const key = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)));

  const { title = 'Xeno CRM', sub = '' } = TITLES[key] || {};

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

      <div className="topbar-right">
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
        {actions}
      </div>
    </header>
  );
}
