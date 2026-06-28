import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Settings, LogOut, Sun, Moon, Zap, Flag, Search, BarChart2 } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

function decodeRole() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]))?.role || null;
  } catch { return null; }
}

const NAV = {
  sponsor: [
    { to: '/sponsor-dashboard/home',     Icon: LayoutDashboard, label: 'Overview' },
    { to: '/sponsor-dashboard/campaign', Icon: Megaphone,        label: 'Campaigns' },
    { to: '/sponsor-dashboard/settings', Icon: Settings,         label: 'Settings' },
  ],
  influencer: [
    { to: '/influencer/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  ],
  admin: [
    { to: '/admin-dashboard', Icon: BarChart2,   label: 'Overview'  },
    { to: '/admin-dashboard', Icon: Megaphone,   label: 'Campaigns' },
    { to: '/admin-dashboard', Icon: Flag,        label: 'Flagged'   },
    { to: '/admin-dashboard', Icon: Search,      label: 'Search'    },
  ],
};

const ROLE_LABEL = { sponsor: 'Sponsor Portal', influencer: 'Creator Portal', admin: 'Admin Console' };

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const role = decodeRole();
  const links = NAV[role] || [];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <aside className="is-sidebar">
      {/* Brand */}
      <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid rgba(91,88,235,0.20)' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#5B58EB,#BB63FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(91,88,235,0.60)', flexShrink: 0,
          }}>
            <Zap size={15} color="#fff" fill="#fff" strokeWidth={1.75} />
          </div>
          <span className="display-brand" style={{ fontSize: '1.2rem', color: '#fff' }}>InSync</span>
        </div>
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 999,
          background: 'rgba(86,225,233,0.12)', color: '#56E1E9',
          fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {ROLE_LABEL[role] || 'Portal'}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <p className="is-sidebar-section">Navigation</p>
        {links.map(({ to, Icon, label }) => (
          <NavLink key={label} to={to}
            className={({ isActive }) => `is-sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(91,88,235,0.18)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={toggleTheme} className="is-sidebar-link">
          {theme === 'light' ? <Moon size={15} strokeWidth={1.75} /> : <Sun size={15} strokeWidth={1.75} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button onClick={logout} className="is-sidebar-link" style={{ color: '#f87171' }}>
          <LogOut size={15} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
