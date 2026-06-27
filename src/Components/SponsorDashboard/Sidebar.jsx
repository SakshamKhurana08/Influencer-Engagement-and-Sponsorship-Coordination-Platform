import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Settings, LogOut, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

const LINKS = [
  { to: '/sponsor-dashboard/home',     Icon: LayoutDashboard, label: 'Overview' },
  { to: '/sponsor-dashboard/campaign', Icon: Megaphone,        label: 'Campaigns' },
  { to: '/sponsor-dashboard/settings', Icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <aside className="is-sidebar">

      {/* Brand */}
      <div className="mb-5 px-2">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--brand-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--brand-glow-btn)',
            flexShrink: 0,
          }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span className="display-brand" style={{ fontSize: '1.3rem', color: 'var(--brand-1)' }}>InSync</span>
        </div>
        <span className="is-pill" style={{
          background: 'rgba(230,0,35,0.10)',
          color: 'var(--brand-1)',
          fontSize: '0.65rem',
          letterSpacing: '0.10em',
        }}>
          Sponsor Portal
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-grow-1">
        <p style={{
          fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          padding: '0 16px', marginBottom: 8,
        }}>
          Navigation
        </p>
        {LINKS.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `is-sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div
        className="d-flex flex-column gap-1 pt-4"
        style={{ borderTop: '1px solid var(--border-glass)' }}
      >
        <button
          onClick={toggleTheme}
          className="is-sidebar-link"
          style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="is-sidebar-link"
          style={{ background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
