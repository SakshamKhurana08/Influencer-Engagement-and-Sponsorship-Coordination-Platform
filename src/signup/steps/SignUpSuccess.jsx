import { Link } from 'react-router-dom';
import { Home, Clock, Search, MessageSquare, BarChart2 } from 'lucide-react';
import BrandLogo from '../../Components/BrandLogo';

export default function SignUpSuccess() {
  return (
    <div className="is-page d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-app)' }}>
      <div className="is-page-orb-c" aria-hidden="true" />

      <div style={{
        width: '100%', maxWidth: 460,
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.28)',
        borderRadius: 20,
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1, position: 'relative',
        textAlign: 'center',
      }}>
        {/* Pending icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366F1,#C084FC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
          boxShadow: '0 0 32px rgba(99,102,241,0.55)',
        }}>
          <Clock size={36} color="#fff" strokeWidth={1.75} />
        </div>

        {/* Brand */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <BrandLogo height={28} showName={false} />
        </div>

        <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '1.9rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Application Submitted!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', marginBottom: 10, lineHeight: 1.65 }}>
          Your registration is <strong style={{ color: '#C084FC' }}>pending admin approval</strong>.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 28, lineHeight: 1.65 }}>
          Once approved, you'll be able to sign in and access your dashboard.
          You can check back anytime using the Sign In button below.
        </p>

        {/* What happens next */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          marginBottom: 28,
        }}>
          {[
            { Icon: Clock,         color: '#C084FC', label: 'Review',   desc: 'Admin reviews your details'  },
            { Icon: Search,        color: '#22D3EE', label: 'Approval', desc: 'Account activated on approval' },
            { Icon: MessageSquare, color: '#6366F1', label: 'Access',   desc: 'Sign in and start exploring'  },
          ].map(({ Icon, color, label, desc }) => (
            <div key={label} style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-glass)',
              borderRadius: 11, padding: '12px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>{label}</div>
              <div style={{ fontSize: '0.60rem', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.3 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '11px 28px' }}>
            Sign In
          </Link>
          <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding: '11px 24px' }}>
            <Home size={14} strokeWidth={1.75} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
