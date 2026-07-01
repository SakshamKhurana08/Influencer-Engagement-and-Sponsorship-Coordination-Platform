import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { Sun, Moon, Zap, ArrowLeft } from 'lucide-react';
import AuthLeftPanel from '../Components/AuthLeftPanel';

const STEPS = ['Account', 'Profile', 'Review'];

function useStepIndex() {
  const { pathname } = useLocation();
  if (pathname.includes('step3')) return 2;
  if (pathname.includes('step2')) return 1;
  return 0;
}

export default function SignUpLayout() {
  const { theme, toggleTheme } = useTheme();
  const step = useStepIndex();

  return (
    <div className="is-auth-page">
      {/* ── Shared left branding panel ── */}
      <AuthLeftPanel mode="signup" step={step} steps={STEPS} />

      {/* ── Right form panel ── */}
      <div className="is-auth-right" style={{ position:'relative', zIndex:1 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="is-btn is-btn-ghost"
          style={{ position:'absolute', top:16, right:18, width:32, height:32, padding:0, borderRadius:'50%' }}
          aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={13} strokeWidth={1.75} /> : <Sun size={13} strokeWidth={1.75} />}
        </button>

        {/* Mobile header */}
        <div className="d-lg-none" style={{ position:'absolute', top:16, left:18 }}>
          <div className="d-flex align-items-center justify-content-between" style={{ gap:12 }}>
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <Zap size={14} color="#6366F1" strokeWidth={1.75} />
              <span className="display-brand" style={{ fontSize:'1rem', color:'#6366F1' }}>InSync</span>
            </Link>
            <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'4px 10px', fontSize:'0.73rem' }}>
              <ArrowLeft size={11} strokeWidth={1.75} /> Home
            </Link>
          </div>
        </div>

        {/* Form card */}
        <div className="is-auth-form-card">
          {/* Mobile step dots */}
          <div className="d-lg-none d-flex gap-2 align-items-center" style={{ marginBottom:16, marginTop:4 }}>
            {STEPS.map((label, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <div style={{
                  width: i === step ? 20 : 5, height:5, borderRadius:999,
                  background: i <= step ? '#6366F1' : 'var(--border-subtle)',
                  transition:'all 0.45s var(--ease-spring)',
                }} />
                {i === step && (
                  <span style={{ fontSize:'0.60rem', fontWeight:700, color:'#22D3EE', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
