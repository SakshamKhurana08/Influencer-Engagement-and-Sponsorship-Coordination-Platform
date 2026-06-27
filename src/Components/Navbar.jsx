import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { Sun, Moon, Menu, X, Zap } from 'lucide-react';

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/signup', label: 'Register' },
  { to: '/login', label: 'Sign In' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Floating capsule bar (desktop) ── */}
      <nav className="is-navbar-floating d-none d-md-flex" style={{ justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--brand-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--brand-glow-btn)',
          }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span className="display-brand" style={{ fontSize: '1.25rem', color: 'var(--brand-1)', letterSpacing: '-0.01em' }}>
            InSync
          </span>
        </Link>

        {/* Links */}
        <div className="d-flex align-items-center gap-1">
          {LINKS.slice(0, 2).map(l => (
            <NavLink key={l.to} to={l.to} className="text-decoration-none" style={({ isActive }) => ({
              padding: '7px 18px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600,
              color: isActive ? 'var(--brand-1)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(230,0,35,0.08)' : 'transparent',
              transition: 'var(--transition)',
            })}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
          <button onClick={toggleTheme} className="is-btn is-btn-ghost"
            style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
            aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <Link to="/login" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Mobile navbar ── */}
      <nav className="is-navbar d-md-none px-4">
        <div className="d-flex align-items-center justify-content-between" style={{ height: 60 }}>
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <Zap size={18} color="var(--brand-1)" />
            <span className="display-brand" style={{ fontSize: '1.2rem', color: 'var(--brand-1)' }}>InSync</span>
          </Link>
          <div className="d-flex gap-2">
            <button onClick={toggleTheme} className="is-btn is-btn-ghost" style={{ width: 36, height: 36, padding: 0 }}>
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button onClick={() => setOpen(o => !o)} className="is-btn is-btn-ghost" style={{ width: 36, height: 36, padding: 0 }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="pb-3 d-flex flex-column gap-1">
            {LINKS.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="is-sidebar-link text-decoration-none">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
