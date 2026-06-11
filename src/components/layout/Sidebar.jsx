import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Megaphone, Bot, BarChart3,
  Sparkles, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/customers', label: 'Customers',  icon: Users           },
  { to: '/campaigns', label: 'Campaigns',  icon: Megaphone       },
  { to: '/ai',        label: 'AI Studio',  icon: Bot             },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3       },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          Xeno<span>.</span>CRM
        </div>
        <div className="sidebar-logo-sub">AI-Native Platform</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* AI Suggestions callout */}
      <div className="sidebar-footer">
        <div className="sidebar-ai-badge" onClick={() => navigate('/ai')}>
          <div className="sidebar-ai-badge-label">
            <Sparkles size={10} />
            AI Insights
          </div>
          <div className="sidebar-ai-badge-text">
            Suggestions ready →
          </div>
        </div>
      </div>
    </aside>
  );
}
