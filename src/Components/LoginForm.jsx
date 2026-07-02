import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { Sun, Moon, Eye, EyeOff, Zap, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLeftPanel from './AuthLeftPanel';

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
      {/* ── Shared left branding panel ── */}
      <AuthLeftPanel mode="login" />

      {/* ── Right form panel ── */}
      <div className="is-auth-right" style={{ position:'relative', zIndex:1 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="is-btn is-btn-ghost"
          style={{ position:'absolute', top:16, right:18, width:32, height:32, padding:0, borderRadius:'50%' }}
          aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={13} strokeWidth={1.75} /> : <Sun size={13} strokeWidth={1.75} />}
        </button>

        <div className="is-auth-form-card">
          {/* Mobile header row */}
          <div className="d-lg-none d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2">
              <Zap size={15} color="#6366F1" strokeWidth={1.75} />
              <span className="display-brand" style={{ fontSize:'1.1rem', color:'#6366F1' }}>InSync</span>
            </div>
            <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'5px 12px', fontSize:'0.75rem' }}>
              <ArrowLeft size={12} strokeWidth={1.75} /> Home
            </Link>
          </div>

          <h2 className="fw-900 display-brand" style={{ color:'var(--text-primary)', fontSize:'1.65rem', marginBottom:4 }}>
            Sign In
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', marginBottom:22 }}>
            No account?{' '}
            <Link to="/signup" style={{ color:'#22D3EE', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
          </p>

          {message && (
            <div className={`d-flex align-items-center gap-2 p-3 fw-700 ${isError ? 'is-pill-rejected' : 'is-pill-accepted'}`}
              style={{ borderRadius:10, fontSize:'0.81rem', marginBottom:14 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
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
                  ...(email ? { top:10, transform:'none', fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#22D3EE' } : {}),
                }}>Email Address</label>
              </div>
            </div>

            {/* Password */}
            <div className="is-field" style={{ marginBottom:20 }}>
              <div className="position-relative">
                <Lock size={14} strokeWidth={1.75} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
                <input type={showPw ? 'text' : 'password'} className="is-input" placeholder=" " id="login-pw"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingLeft:38, paddingRight:42, paddingTop:20, paddingBottom:6, height:50 }} />
                <label htmlFor="login-pw" style={{
                  position:'absolute', left:38, top:'50%', transform:'translateY(-50%)',
                  fontSize:'0.86rem', color:'var(--text-muted)', pointerEvents:'none',
                  transition:'var(--transition-fast)',
                  ...(password ? { top:10, transform:'none', fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#22D3EE' } : {}),
                }}>Password</label>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
                  {showPw ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding:'13px', fontSize:'0.9rem' }} disabled={loading}>
              {loading ? 'Signing in…' : <><ArrowRight size={14} strokeWidth={1.75} /> Sign In</>}
            </button>
          </form>

          <div className="is-divider" style={{ margin:'18px 0' }} />
          <p className="text-center mb-0" style={{ color:'var(--text-muted)', fontSize:'0.79rem' }}>
            Admin portal?{' '}
            <Link to="/login" style={{ color:'#C084FC', fontWeight:700, textDecoration:'none' }}>Use admin credentials above.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
