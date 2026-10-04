import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/api/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="is-page d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-app)' }}>
      <div className="is-page-orb-c" aria-hidden="true" />

      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.28)',
        borderRadius: 20,
        padding: '44px 36px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1, position: 'relative',
        textAlign: 'center',
      }}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
          <BrandLogo height={28} showName={false} />
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Loader2 size={28} color="#6366F1" strokeWidth={1.75} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 8 }}>
              Verifying…
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Please wait while we verify your email.
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={30} color="#22D3EE" strokeWidth={1.75} />
            </div>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 8 }}>
              Email verified!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.65, marginBottom: 24 }}>
              Your email address has been confirmed. Your registration is now under admin review.
              You'll be notified once your account is approved — usually within 24–48 hours.
            </p>
            <Link to="/login" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '11px 32px' }}>
              Back to Sign In
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={30} color="#f87171" strokeWidth={1.75} />
            </div>
            <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 8 }}>
              Link expired
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.65, marginBottom: 24 }}>
              This verification link has expired or is invalid. Verification links are valid for 24 hours.
              Please register again to receive a new one.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/signup" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '11px 24px' }}>
                Register Again
              </Link>
              <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding: '11px 20px' }}>
                Home
              </Link>
            </div>
          </>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
