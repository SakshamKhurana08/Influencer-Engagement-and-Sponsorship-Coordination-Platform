import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function ResetPassword() {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const token                       = searchParams.get('token') || '';

  const [password,  setPassword]    = useState('');
  const [confirm,   setConfirm]     = useState('');
  const [showPw,    setShowPw]      = useState(false);
  const [error,     setError]       = useState('');
  const [success,   setSuccess]     = useState(false);
  const [loading,   setLoading]     = useState(false);

  // Redirect to login after success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate('/login'), 2500);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'This link has expired or is invalid. Request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="is-page d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-app)' }}>
      <div className="is-page-orb-c" aria-hidden="true" />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-surface)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.28)', borderRadius: 20,
        padding: '44px 36px', boxShadow: 'var(--shadow-lg)',
        zIndex: 1, position: 'relative',
      }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <BrandLogo height={26} showName={false} />
          <Link to="/forgot-password" className="is-btn is-btn-ghost text-decoration-none"
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <ArrowLeft size={12} strokeWidth={1.75} /> Request new link
          </Link>
        </div>

        {success ? (
          <div className="text-center">
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,211,238,0.14)', border: '1px solid rgba(34,211,238,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckCircle2 size={28} color="#22D3EE" strokeWidth={1.75} />
            </div>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 8 }}>
              Password updated!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 20 }}>
              Redirecting you to Sign In…
            </p>
          </div>
        ) : (
          <>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 6 }}>
              Set new password
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 24 }}>
              Choose a strong password — at least 6 characters.
            </p>

            {error && (
              <div className="rounded-3 p-3 mb-3 fw-700"
                style={{ fontSize: '0.82rem', background: 'var(--pill-rejected)', color: 'var(--pill-rejected-text)' }}>
                {error}
                {error.toLowerCase().includes('expired') && (
                  <> <Link to="/forgot-password" style={{ color: 'inherit', fontWeight: 900 }}>Request a new link.</Link></>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="is-label">New Password</label>
                <div className="position-relative">
                  <Lock size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="reset-pw" type={showPw ? 'text' : 'password'} className="is-input"
                    placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: 38, paddingRight: 42 }} required />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {showPw ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="is-label">Confirm Password</label>
                <div className="position-relative">
                  <Lock size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="reset-confirm" type={showPw ? 'text' : 'password'} className="is-input"
                    placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    style={{ paddingLeft: 38 }} required />
                </div>
              </div>

              <button type="submit" className="is-btn is-btn-brand w-100"
                style={{ padding: '13px', fontSize: '0.9rem' }} disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
