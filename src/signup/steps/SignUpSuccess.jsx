import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Home, CheckCircle, Search, MessageSquare, BarChart2 } from 'lucide-react';

export default function SignUpSuccess() {
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
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1, position: 'relative',
        textAlign: 'center',
      }}>
        {/* Animated check icon — pure CSS, no Lottie, instant render */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366F1,#C084FC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
          boxShadow: '0 0 32px rgba(99,102,241,0.55)',
        }}>
          <CheckCircle size={36} color="#fff" strokeWidth={1.75} />
        </div>

        {/* Brand */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(99,102,241,0.55)' }}>
            <Zap size={13} color="#fff" fill="#fff" strokeWidth={1.75} />
          </div>
          <span className="display-brand is-gradient-text" style={{ fontSize: '1.25rem' }}>InSync</span>
        </div>

        <h2 className="fw-900 display-brand" style={{ color: 'var(--text-primary)', fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
          You're in!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', marginBottom: 28, lineHeight: 1.65 }}>
          Your account has been created. Sign in to start discovering campaigns and building your creator portfolio.
        </p>

        {/* Feature tiles — Lucide icons, no emojis */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          marginBottom: 28,
        }}>
          {[
            { Icon: Search,       color: '#22D3EE', label: 'Discover',  desc: 'Browse live brand campaigns'  },
            { Icon: MessageSquare,color: '#C084FC', label: 'Negotiate', desc: 'Counter-offer built in'       },
            { Icon: BarChart2,    color: '#6366F1', label: 'Track',     desc: 'Live deal status updates'     },
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
            <ArrowRight size={15} strokeWidth={1.75} /> Sign In
          </Link>
          <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding: '11px 24px' }}>
            <Home size={14} strokeWidth={1.75} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
