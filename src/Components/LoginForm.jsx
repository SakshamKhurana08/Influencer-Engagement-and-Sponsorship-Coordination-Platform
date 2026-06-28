import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useTheme } from '../theme/ThemeContext';
import loginAnimation from '../login-animation.json';
import { Sun, Moon, Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Activity, Users, Award } from 'lucide-react';

const METRICS = [
  { Icon: Activity, val: '+24%', label: 'Campaign Growth', color: '#56E1E9' },
  { Icon: Users,    val: '12K+', label: 'Active Creators',  color: '#BB63FF' },
  { Icon: Award,    val: '97%',  label: 'Success Rate',     color: '#56E1E9' },
];

export default function LoginForm() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [message, setMessage]   = useState('');
  const [isError, setIsError]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); setIsError(false);
    if (!email || !password) { setMessage('Email and password are required.'); setIsError(true); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      setMessage('Login successful — redirecting…');
      setTimeout(() => {
        if (user.role === 'admin')           navigate('/admin-dashboard');
        else if (user.role === 'sponsor')    navigate('/sponsor-dashboard/home');
        else if (user.role === 'influencer') navigate('/influencer/dashboard');
        else navigate('/');
      }, 900);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed. Check your credentials.');
      setIsError(true); setLoading(false);
    }
  };

  return (
    <div className="is-auth-page">

      {/* ── Left panel ── */}
      <div className="is-auth-left">
        {/* Depth ring decorations */}
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', border:'1px solid rgba(91,88,235,0.15)', top:'8%', left:'-18%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:250, height:250, borderRadius:'50%', border:'1px solid rgba(86,225,233,0.10)', bottom:'12%', right:'-8%', pointerEvents:'none' }} />

        {/* Single centered vertical stack */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:22, textAlign:'center', maxWidth:320, width:'100%' }}>

          {/* Brand */}
          <div className="d-flex align-items-center gap-2">
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#5B58EB,#BB63FF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(91,88,235,0.60)' }}>
              <Zap size={16} color="#fff" fill="#fff" strokeWidth={1.75} />
            </div>
            <span className="display-brand" style={{ fontSize:'1.45rem', color:'#fff' }}>InSync</span>
          </div>

          {/* Headline */}
          <div>
            <h2 className="display-brand" style={{ fontSize:'2rem', color:'#fff', lineHeight:1.08, fontWeight:900, marginBottom:8 }}>
              Welcome back,<br />
              <span style={{ color:'#56E1E9' }}>Creator.</span>
            </h2>
            <p style={{ color:'rgba(157,180,224,0.78)', fontSize:'0.86rem', lineHeight:1.60, margin:0 }}>
              Manage campaigns, connect with brands, and track your performance in real time.
            </p>
          </div>

          {/* Metric chips */}
          <div className="d-flex flex-column gap-2" style={{ width:'100%' }}>
            {METRICS.map(({ Icon, val, label, color }) => (
              <div key={label} style={{
                background:'rgba(8,15,36,0.50)', backdropFilter:'blur(12px)',
                border:`1px solid ${color}25`, borderRadius:12,
                padding:'10px 14px', display:'flex', alignItems:'center', gap:12,
                textAlign:'left',
              }}>
                <div style={{ width:32, height:32, borderRadius:9, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={15} color={color} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize:'1.05rem', fontWeight:900, color:'#fff', lineHeight:1 }}>{val}</div>
                  <div style={{ fontSize:'0.62rem', fontWeight:700, color:'rgba(157,180,224,0.65)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Lottie */}
          <div style={{ borderRadius:14, overflow:'hidden', opacity:0.88, width:220 }}>
            <Lottie animationData={loginAnimation} loop style={{ width:'100%' }} />
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

        {/* Glass form card */}
        <div className="is-auth-form-card">
          {/* Mobile brand */}
          <div className="d-lg-none d-flex align-items-center gap-2" style={{ marginBottom:16 }}>
            <Zap size={15} color="#5B58EB" strokeWidth={1.75} />
            <span className="display-brand" style={{ fontSize:'1.1rem', color:'#5B58EB' }}>InSync</span>
          </div>

          <h2 className="fw-900 display-brand" style={{ color:'var(--text-primary)', fontSize:'1.65rem', marginBottom:2 }}>Sign In</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', marginBottom:20 }}>
            No account?{' '}
            <Link to="/signup" style={{ color:'#56E1E9', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
          </p>

          {message && (
            <div className={`d-flex align-items-center gap-2 p-3 fw-700 ${isError ? 'is-pill-rejected' : 'is-pill-accepted'}`}
              style={{ borderRadius:10, fontSize:'0.81rem', marginBottom:14 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="is-field" style={{ marginBottom:12 }}>
              <div className="position-relative">
                <Mail size={14} strokeWidth={1.75} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
                <input type="email" className="is-input" placeholder=" " id="login-email"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ paddingLeft:38, paddingTop:20, paddingBottom:6, height:50 }} />
                <label htmlFor="login-email" style={{
                  position:'absolute', left:38, top:'50%', transform:'translateY(-50%)',
                  fontSize:'0.86rem', color:'var(--text-muted)', pointerEvents:'none',
                  transition:'var(--transition-fast)',
                  ...(email ? { top:10, transform:'none', fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#56E1E9' } : {}),
                }}>Email Address</label>
              </div>
            </div>

            {/* Password */}
            <div className="is-field" style={{ marginBottom:18 }}>
              <div className="position-relative">
                <Lock size={14} strokeWidth={1.75} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
                <input type={showPw ? 'text' : 'password'} className="is-input" placeholder=" " id="login-pw"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingLeft:38, paddingRight:42, paddingTop:20, paddingBottom:6, height:50 }} />
                <label htmlFor="login-pw" style={{
                  position:'absolute', left:38, top:'50%', transform:'translateY(-50%)',
                  fontSize:'0.86rem', color:'var(--text-muted)', pointerEvents:'none',
                  transition:'var(--transition-fast)',
                  ...(password ? { top:10, transform:'none', fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#56E1E9' } : {}),
                }}>Password</label>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
                  {showPw ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding:'12px', fontSize:'0.9rem' }} disabled={loading}>
              {loading ? 'Signing in…' : <><ArrowRight size={14} strokeWidth={1.75} /> Sign In</>}
            </button>
          </form>

          <div className="is-divider" style={{ margin:'16px 0' }} />
          <p className="text-center mb-0" style={{ color:'var(--text-muted)', fontSize:'0.79rem' }}>
            Admin portal?{' '}
            <Link to="/login" style={{ color:'#BB63FF', fontWeight:700, textDecoration:'none' }}>Use admin credentials above.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
