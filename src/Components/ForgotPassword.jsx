import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Always show the same message — no info leak regardless of API response
    try { await api.post('/api/auth/forgot-password', { email }); }
    catch { /* suppress — same UX either way */ }
    setLoading(false);
    setSubmitted(true);
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
          <Link to="/login" className="is-btn is-btn-ghost text-decoration-none"
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <ArrowLeft size={12} strokeWidth={1.75} /> Back to Login
          </Link>
        </div>

        {!submitted ? (
          <>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 6 }}>
              Forgot password?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 24, lineHeight: 1.65 }}>
              Enter your email address and we'll send you a reset link if an account exists.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="is-label">Email Address</label>
                <div className="position-relative">
                  <Mail size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="is-input" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: 38 }} required />
                </div>
              </div>
              <button type="submit" className="is-btn is-btn-brand w-100"
                style={{ padding: '13px', fontSize: '0.9rem' }} disabled={loading}>
                {loading ? 'Sending…' : <><Send size={14} strokeWidth={1.75} /> Send Reset Link</>}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,211,238,0.14)', border: '1px solid rgba(34,211,238,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Mail size={24} color="#22D3EE" strokeWidth={1.75} />
            </div>
            <h2 className="fw-900 display-brand text-center" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 10 }}>
              Check your inbox
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
              If that email is registered on Cofluence, a reset link has been sent. The link expires in 15 minutes.
            </p>
            <Link to="/login" className="is-btn is-btn-brand w-100 text-decoration-none d-flex justify-content-center"
              style={{ padding: '12px' }}>
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
