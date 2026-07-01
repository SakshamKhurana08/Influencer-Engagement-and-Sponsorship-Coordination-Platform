/**
 * AuthLeftPanel — redesigned branding column for Login and Sign-Up.
 *
 * Design goals:
 *  • Strict 100vh — zero scroll
 *  • Minimal content — brand, one-line tagline, animation, step tracker
 *  • "Back to Home" as a clear pill button at the very top
 *  • Generous whitespace, strong visual hierarchy
 *  • Distinct Lottie animation per mode (login vs signup)
 */
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Zap, ArrowLeft, Check } from 'lucide-react';
import loginAnimation  from '../login-animation.json';
import signupAnimation from '../signup-animation.json';

export default function AuthLeftPanel({ mode = 'login', step = 0, steps = [] }) {
  const isLogin = mode === 'login';

  return (
    <div
      className="is-auth-left"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 36px 36px',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Ambient blobs ── */}
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        filter: 'blur(72px)', top: '-10%', right: '-15%',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
        filter: 'blur(60px)', bottom: '5%', left: '-10%',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* ═══ TOP — Back to Home button (pinned) ═══ */}
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Link
          to="/"
          className="text-decoration-none"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 14px 7px 10px',
            borderRadius: 999,
            border: '1px solid rgba(99,102,241,0.30)',
            background: 'rgba(99,102,241,0.08)',
            color: 'rgba(209,213,219,0.80)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.50)';
            e.currentTarget.style.color = '#22D3EE';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.30)';
            e.currentTarget.style.color = 'rgba(209,213,219,0.80)';
          }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Back to Home
        </Link>
      </div>

      {/* ═══ MIDDLE — Brand + Animation + Headline (true center) ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}>

        {/* Brand mark — icon left, text right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#6366F1,#C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(99,102,241,0.65), 0 0 10px rgba(192,132,252,0.35)',
          }}>
            <Zap size={21} color="#fff" fill="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <div
              className="display-brand"
              style={{ fontSize: '1.60rem', color: '#F9FAFB', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              InSync
            </div>
            <div style={{
              fontSize: '0.55rem', fontWeight: 700,
              color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.13em', marginTop: 3,
            }}>
              Creator Economy Platform
            </div>
          </div>
        </div>

        {/* Animation */}
        {isLogin ? (
          <div style={{ position: 'relative', width: 148, height: 148 }}>
            <div style={{
              position: 'absolute', inset: -3, borderRadius: '50%', zIndex: 0,
              background: 'conic-gradient(from 0deg, #22D3EE 0%, #6366F1 40%, #C084FC 70%, #22D3EE 100%)',
              animation: 'authRingSpin 10s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 3, borderRadius: '50%', zIndex: 1,
              background: 'rgba(8,15,32,0.88)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(34,211,238,0.18)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lottie animationData={loginAnimation} loop style={{ width: '90%' }} />
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
              filter: 'blur(14px)', zIndex: 0,
            }} />
          </div>
        ) : (
          <div style={{ width: 156, position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'radial-gradient(ellipse at 50% 90%, rgba(192,132,252,0.20) 0%, transparent 70%)',
              filter: 'blur(16px)', pointerEvents: 'none',
            }} />
            <div style={{
              borderRadius: 16, overflow: 'hidden', position: 'relative',
              background: 'rgba(8,15,32,0.80)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(192,132,252,0.26)',
              boxShadow: '0 0 30px rgba(99,102,241,0.22)',
            }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,#6366F1,#C084FC,#22D3EE)' }} />
              <Lottie animationData={signupAnimation} loop style={{ width: '100%' }} />
              <div style={{ height: 3, background: 'linear-gradient(90deg,#22D3EE,#C084FC,#6366F1)' }} />
            </div>
          </div>
        )}

        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <h2
            className="display-brand"
            style={{
              fontSize: 'clamp(1.70rem, 2.4vw, 2.20rem)',
              color: '#F9FAFB', lineHeight: 1.06,
              fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10,
            }}
          >
            {isLogin
              ? <><span style={{ color: '#22D3EE' }}>Welcome</span><br />back.</>
              : <>Join the creator<br /><span style={{ color: '#22D3EE' }}>economy.</span></>
            }
          </h2>
          <p style={{
            color: '#6B7280', fontSize: '0.83rem',
            lineHeight: 1.65, margin: 0,
          }}>
            {isLogin
              ? 'Manage campaigns, connect with brands.'
              : 'Create your free account. Start collaborating.'
            }
          </p>
        </div>
      </div>

      {/* ═══ BOTTOM — Step tracker (signup) or minimal divider (login) ═══ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!isLogin && steps.length > 0 ? (
          /* Step tracker — horizontal pills */
          <div>
            <p style={{
              fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: '#4B5563', marginBottom: 12,
            }}>
              Registration Progress
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {steps.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      fontSize: '0.66rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.40s cubic-bezier(0.16,1,0.3,1)',
                      background: i < step
                        ? 'linear-gradient(135deg,#6366F1,#C084FC)'
                        : i === step
                          ? 'rgba(99,102,241,0.20)'
                          : 'rgba(255,255,255,0.06)',
                      color: i <= step ? '#fff' : 'rgba(255,255,255,0.25)',
                      border: i === step ? '2px solid #6366F1' : '2px solid transparent',
                      boxShadow: i === step ? '0 0 16px rgba(99,102,241,0.55)' : 'none',
                    }}>
                      {i < step ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: i <= step ? 700 : 400,
                      color: i <= step ? '#E5E7EB' : 'rgba(255,255,255,0.22)',
                      transition: 'color 0.3s',
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, borderRadius: 2,
                      margin: '-14px 6px 0',   /* align with circle centres */
                      background: i < step
                        ? 'linear-gradient(90deg,#6366F1,#C084FC)'
                        : 'rgba(255,255,255,0.10)',
                      transition: 'background 0.40s ease',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Login bottom — platform tagline */
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.16)',
            background: 'rgba(6,11,19,0.45)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22D3EE',
              boxShadow: '0 0 8px rgba(34,211,238,0.80)',
              flexShrink: 0,
              animation: 'authPulse 2s ease-in-out infinite',
            }} />
            <span style={{ color: '#6B7280', fontSize: '0.74rem', fontWeight: 500 }}>
              Connecting creators and brands in one platform
            </span>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes authRingSpin { to { transform: rotate(360deg); } }
        @keyframes authPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}
