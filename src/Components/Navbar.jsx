import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { Sun, Moon, Menu, X, Zap } from 'lucide-react';

const LINKS = [
  { to: '/about',   label: 'About'   },
  { to: '/contact', label: 'Contact' },
  { to: '/signup',  label: 'Register' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop floating capsule */}
      <nav className="is-navbar-floating d-none d-md-flex">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366F1,#C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.55)',
          }}>
            <Zap size={14} color="#fff" fill="#fff" strokeWidth={1.75} />
          </div>
          <span className="display-brand" style={{ fontSize: '1.2rem', color: '#6366F1', letterSpacing: '-0.01em' }}>
            InSync
          </span>
        </Link>

        <div className="d-flex align-items-center gap-1">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} className="text-decoration-none" style={({ isActive }) => ({
              padding: '7px 16px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600,
              color: isActive ? '#22D3EE' : 'var(--text-secondary)',
              background: isActive ? 'rgba(86,225,233,0.10)' : 'transparent',
              transition: 'var(--transition)',
            })}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
          <button onClick={toggleTheme} className="is-btn is-btn-ghost"
            style={{ width: 34, height: 34, padding: 0, borderRadius: '50%' }}
            aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={14} strokeWidth={1.75} /> : <Sun size={14} strokeWidth={1.75} />}
          </button>
          <Link to="/login" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '7px 18px', fontSize: '0.83rem' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Mobile bar */}
      <nav className="is-navbar d-md-none" style={{ padding: '0 1.25rem', justifyContent: 'space-between' }}>
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <Zap size={16} color="#6366F1" strokeWidth={1.75} />
          <span className="display-brand" style={{ fontSize: '1.1rem', color: '#6366F1' }}>InSync</span>
        </Link>
        <div className="d-flex gap-2">
          <button onClick={toggleTheme} className="is-btn is-btn-ghost" style={{ width: 34, height: 34, padding: 0, borderRadius: '50%' }}>
            {theme === 'light' ? <Moon size={14} strokeWidth={1.75} /> : <Sun size={14} strokeWidth={1.75} />}
          </button>
          <button onClick={() => setOpen(o => !o)} className="is-btn is-btn-ghost" style={{ width: 34, height: 34, padding: 0, borderRadius: '50%' }}>
            {open ? <X size={15} strokeWidth={1.75} /> : <Menu size={15} strokeWidth={1.75} />}
          </button>
        </div>
        {open && (
          <div style={{
            position: 'absolute', top: 'var(--navbar-h)', left: 0, right: 0, zIndex: 999,
            background: 'rgba(9,20,50,0.97)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.20)',
            padding: '12px 1.25rem 16px', display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {[...LINKS, { to: '/login', label: 'Sign In' }].map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                style={{ padding: '9px 14px', borderRadius: 10, color: 'rgba(157,180,224,0.85)', fontWeight: 500, fontSize: '0.86rem', textDecoration: 'none', transition: 'var(--transition-fast)' }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
