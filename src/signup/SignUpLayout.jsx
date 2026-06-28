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
    <div className="is-auth-page">

      {/* ── Left marketing panel (desktop only — hidden via CSS @media) ── */}
      <div className="is-auth-left">
        {/* Depth rings */}
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', border:'1px solid rgba(91,88,235,0.15)', top:'4%', left:'-20%', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', width:240, height:240, borderRadius:'50%', border:'1px solid rgba(86,225,233,0.10)', bottom:'7%', right:'-10%', pointerEvents:'none', zIndex:1 }} />

        {/* All content centered as a single vertical stack */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center', maxWidth:320, width:'100%' }}>

          {/* Brand */}
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#5B58EB,#BB63FF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(91,88,235,0.60)' }}>
              <Zap size={15} color="#fff" fill="#fff" strokeWidth={1.75} />
            </div>
            <span className="display-brand" style={{ fontSize:'1.35rem', color:'#fff' }}>InSync</span>
          </Link>

          {/* Animation */}
          <Lottie animationData={signupAnimation} loop style={{ width:180, opacity:0.92, flexShrink:0 }} />

          {/* Headline */}
          <div>
            <h2 className="display-brand" style={{ fontSize:'1.75rem', color:'#fff', fontWeight:900, lineHeight:1.08, marginBottom:12 }}>
              Join the creator<br />
              <span style={{ color:'#56E1E9' }}>economy today.</span>
            </h2>
            <div className="d-flex flex-column gap-2" style={{ textAlign:'left' }}>
              {PERKS.map(p => (
                <div key={p} className="d-flex align-items-center gap-2">
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'rgba(86,225,233,0.18)', border:'1px solid rgba(86,225,233,0.38)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check size={9} color="#56E1E9" strokeWidth={2.5} />
                  </div>
                  <span style={{ color:'rgba(172,196,230,0.88)', fontSize:'0.82rem', fontWeight:500 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step progress */}
          <div className="d-flex align-items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="d-flex align-items-center gap-1">
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width:24, height:24, fontSize:'0.68rem', fontWeight:800, flexShrink:0,
                    transition:'all 0.45s var(--ease-spring)',
                    background: i <= step ? 'linear-gradient(135deg,#5B58EB,#BB63FF)' : 'rgba(255,255,255,0.10)',
                    color:'#fff',
                    boxShadow: i <= step ? '0 0 12px rgba(91,88,235,0.65)' : 'none',
                  }}>
                  {i < step ? <Check size={11} strokeWidth={2.5} /> : i + 1}
                </div>
                <span style={{ color: i <= step ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight: i <= step ? 700 : 400 }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div style={{ width:12, height:2, borderRadius:2, marginLeft:2,
                    background: i < step ? 'linear-gradient(90deg,#5B58EB,#BB63FF)' : 'rgba(255,255,255,0.15)',
                    transition:'background 0.45s ease' }} />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="is-auth-right" style={{ position:'relative', zIndex:1 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="is-btn is-btn-ghost"
          style={{ position:'absolute', top:16, right:18, width:32, height:32, padding:0, borderRadius:'50%' }}
          aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={13} strokeWidth={1.75} /> : <Sun size={13} strokeWidth={1.75} />}
        </button>

        {/* Mobile brand */}
        <div style={{ position:'absolute', top:16, left:18 }}>
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 d-lg-none">
            <Zap size={14} color="#5B58EB" strokeWidth={1.75} />
            <span className="display-brand" style={{ fontSize:'1rem', color:'#5B58EB' }}>InSync</span>
          </Link>
        </div>

        {/* Form card */}
        <div className="is-auth-form-card">
          {/* Mobile step dots */}
          <div className="d-lg-none d-flex gap-2 align-items-center" style={{ marginBottom:16, marginTop:4 }}>
            {STEPS.map((label, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <div style={{ width: i === step ? 18 : 5, height:5, borderRadius:999,
                  background: i <= step ? '#5B58EB' : 'var(--border-subtle)',
                  transition:'all 0.45s var(--ease-spring)' }} />
                {i === step && <span style={{ fontSize:'0.60rem', fontWeight:700, color:'#56E1E9', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>}
              </div>
            ))}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
