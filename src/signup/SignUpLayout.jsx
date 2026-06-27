import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useTheme } from '../theme/ThemeContext';
import { Sun, Moon, Zap, Check } from 'lucide-react';
import signupAnimation from '../signup-animation.json';

const STEPS = ['Account', 'Profile', 'Review'];

function useStepIndex() {
  const path = window.location.pathname;
  if (path.includes('step3')) return 2;
  if (path.includes('step2')) return 1;
  return 0;
}

const PERKS = [
  'Discover thousands of brand campaigns',
  'Negotiate terms directly with sponsors',
  'Real-time performance analytics',
  'Secure, role-based workspace',
];

export default function SignUpLayout() {
  const { theme, toggleTheme } = useTheme();
  const step = useStepIndex();

  return (
    <div className="is-page d-flex" style={{ minHeight: '100vh', overflowY: 'auto' }}>

      {/* ── Left atmospheric panel ── */}
      <div
        className="d-none d-lg-flex flex-column"
        style={{
          width: '40%', flexShrink: 0,
          background: 'var(--brand-grad)',
          padding: '48px 40px',
          position: 'relative', overflow: 'hidden',
          justifyContent: 'space-between',
        }}
      >
        {/* Background depth shapes */}
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'rgba(255,255,255,0.07)', top:'-180px', left:'-180px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(124,58,237,0.20)', bottom:'-120px', right:'-100px', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.05)', bottom:'40%', left:'-80px', pointerEvents:'none' }} />

        {/* Brand */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none" style={{ position:'relative', zIndex:1 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.20)', border:'1.5px solid rgba(255,255,255,0.40)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span className="display-brand" style={{ fontSize:'1.5rem', color:'#fff' }}>InSync</span>
        </Link>

        {/* Center content */}
        <div style={{ position:'relative', zIndex:1 }}>
          <Lottie animationData={signupAnimation} loop style={{ width:240, margin:'0 auto 28px' }} />
          <h2 className="display-brand mb-3" style={{ fontSize:'2rem', color:'#fff', fontWeight:900, lineHeight:1.1 }}>
            Join the creator<br />economy today.
          </h2>
          <div className="d-flex flex-column gap-2 mt-4">
            {PERKS.map(p => (
              <div key={p} className="d-flex align-items-center gap-2">
                <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
                <span style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.875rem', fontWeight:500 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step progress */}
        <div className="d-flex align-items-center gap-3" style={{ position:'relative', zIndex:1 }}>
          {STEPS.map((label, i) => (
            <div key={label} className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle fw-800"
                style={{
                  width: 28, height: 28, fontSize: '0.72rem',
                  background: i <= step ? '#fff' : 'rgba(255,255,255,0.22)',
                  color: i <= step ? 'var(--brand-1)' : '#fff',
                  transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                  flexShrink: 0,
                }}
              >
                {i < step ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <span style={{
                color: i <= step ? '#fff' : 'rgba(255,255,255,0.50)',
                fontSize: '0.78rem',
                fontWeight: i <= step ? 700 : 400,
                transition: 'all 0.3s ease',
              }}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 20, height: 2, borderRadius: 2,
                  background: i < step ? '#fff' : 'rgba(255,255,255,0.25)',
                  transition: 'background 0.5s ease',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-start p-4 p-md-5"
        style={{ background: 'var(--bg-app)', overflowY: 'auto', position: 'relative', zIndex: 1 }}
      >
        {/* Top bar */}
        <div className="d-flex justify-content-between align-items-center w-100 mb-4" style={{ maxWidth: 520 }}>
          <div className="d-lg-none d-flex align-items-center gap-2">
            <Zap size={18} color="var(--brand-1)" />
            <Link to="/" className="display-brand text-decoration-none" style={{ fontSize: '1.2rem', color: 'var(--brand-1)' }}>
              InSync
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            className="is-btn is-btn-ghost ms-auto"
            style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        {/* Mobile step dots */}
        <div className="d-lg-none d-flex gap-2 mb-5 align-items-center">
          {STEPS.map((label, i) => (
            <div key={i} className="d-flex align-items-center gap-2">
              <div style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 999,
                background: i <= step ? 'var(--brand-1)' : 'var(--border-subtle)',
                transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
              }} />
              {i === step && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              )}
            </div>
          ))}
        </div>

        <div className="w-100" style={{ maxWidth: 520 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
