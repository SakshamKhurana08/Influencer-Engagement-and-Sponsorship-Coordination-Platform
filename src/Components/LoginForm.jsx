import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useTheme } from '../theme/ThemeContext';
import loginAnimation from '../login-animation.json';
import { Sun, Moon, Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); setIsError(false);
    if (!email || !password) { setMessage('Email and password are required.'); setIsError(true); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
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
    <div className="is-page d-flex" style={{ minHeight:'100vh', overflowY:'auto' }}>
      <div className="is-page-orb-c" />

      {/* ── Left atmospheric panel ── */}
      <div className="d-none d-lg-flex flex-column align-items-center justify-content-center"
        style={{ width:'48%', background:'var(--brand-grad)', padding:'56px 48px', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {/* Inner glow shapes */}
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:'-150px', left:'-150px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(124,58,237,0.18)', bottom:'-100px', right:'-100px', filter:'blur(60px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%', maxWidth:380 }}>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-6" style={{ marginBottom:40 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.20)', border:'1.5px solid rgba(255,255,255,0.40)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span className="display-brand" style={{ fontSize:'1.6rem', color:'#fff' }}>InSync</span>
          </div>
          <h2 className="display-brand mb-3" style={{ fontSize:'2.6rem', color:'#fff', lineHeight:1.1, fontWeight:900 }}>
            Welcome back,<br />Creator.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'1rem', lineHeight:1.7, marginBottom:40 }}>
            Sign in to manage campaigns, connect with brands, and track your performance metrics in real time.
          </p>
          <div style={{ width:'100%', borderRadius:16, overflow:'hidden' }}>
            <Lottie animationData={loginAnimation} loop style={{ width:'100%', maxWidth:340, margin:'0 auto' }} />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 p-md-5"
        style={{ background:'var(--bg-app)', position:'relative', zIndex:1 }}>

        {/* Top controls */}
        <div className="d-flex justify-content-between align-items-center w-100 mb-5" style={{ maxWidth:440 }}>
          <div className="d-lg-none d-flex align-items-center gap-2">
            <Zap size={18} color="var(--brand-1)" />
            <span className="display-brand" style={{ fontSize:'1.2rem', color:'var(--brand-1)' }}>InSync</span>
          </div>
          <button onClick={toggleTheme} className="is-btn is-btn-ghost ms-auto" style={{ width:40, height:40, padding:0, borderRadius:'50%' }}>
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        <div className="w-100" style={{ maxWidth:440 }}>
          {/* Header */}
          <div className="mb-6" style={{ marginBottom:32 }}>
            <h2 className="fw-900 mb-1 display-brand" style={{ color:'var(--text-primary)', fontSize:'2rem' }}>Sign In</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color:'var(--brand-1)', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`d-flex align-items-center gap-2 rounded-4 p-3 mb-4 small fw-700 ${isError ? 'is-pill-rejected' : 'is-pill-accepted'}`}
              style={{ borderRadius:12 }}>
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email — floating label */}
            <div className="is-field mb-4">
              <div className="position-relative">
                <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
                <input
                  type="email" className="is-input" placeholder=" " id="login-email"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ paddingLeft:40, paddingTop:22, paddingBottom:8, height:56 }}
                />
                <label htmlFor="login-email" style={{
                  position:'absolute', left:40, top:'50%', transform:'translateY(-50%)',
                  fontSize:'0.9rem', color:'var(--text-muted)', pointerEvents:'none',
                  transition:'var(--transition-fast)',
                  ...(email ? { top:14, transform:'none', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--brand-1)' } : {}),
                }}>
                  Email Address
                </label>
              </div>
            </div>

            {/* Password — floating label */}
            <div className="is-field mb-5">
              <div className="position-relative">
                <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
                <input
                  type={showPw ? 'text' : 'password'} className="is-input" placeholder=" " id="login-pw"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingLeft:40, paddingRight:44, paddingTop:22, paddingBottom:8, height:56 }}
                />
                <label htmlFor="login-pw" style={{
                  position:'absolute', left:40, top:'50%', transform:'translateY(-50%)',
                  fontSize:'0.9rem', color:'var(--text-muted)', pointerEvents:'none',
                  transition:'var(--transition-fast)',
                  ...(password ? { top:14, transform:'none', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--brand-1)' } : {}),
                }}>
                  Password
                </label>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding:'14px', fontSize:'0.95rem' }} disabled={loading}>
              {loading ? 'Signing in…' : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          <div className="is-divider" />
          <p className="text-center mb-0" style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
            Admin portal?{' '}
            <Link to="/login" style={{ color:'var(--brand-1)', fontWeight:700, textDecoration:'none' }}>Use your admin credentials above.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
