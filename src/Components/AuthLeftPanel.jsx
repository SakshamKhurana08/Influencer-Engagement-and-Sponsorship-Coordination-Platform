/**
 * AuthLeftPanel — shared branding column for Login and Sign-Up.
 * Full-height, 3-zone layout: top nav | middle content | bottom stats.
 * Everything fits within 100vh with no overflow.
 */
import { Link }  from 'react-router-dom';
import Lottie    from 'lottie-react';
import { Zap, Check, ArrowLeft, Megaphone, BarChart2, Shield } from 'lucide-react';
import loginAnimation  from '../login-animation.json';
import signupAnimation from '../signup-animation.json';

const LOGIN_FEATURES = [
  { Icon: Megaphone, label: 'Discover Campaigns', desc: 'Browse live brand campaigns across every niche',  color: '#22D3EE' },
  { Icon: BarChart2, label: 'Track Your Deals',   desc: 'Accept, negotiate, and manage ad requests live', color: '#C084FC' },
  { Icon: Shield,    label: 'Secure by Design',   desc: 'JWT auth, RBAC, end-to-end data protection',    color: '#22D3EE' },
];

const PERKS = [
  { text: 'Discover thousands of brand campaigns',  color: '#22D3EE' },
  { text: 'Negotiate terms directly with sponsors', color: '#C084FC' },
  { text: 'Real-time performance analytics',         color: '#22D3EE' },
  { text: 'Secure, role-based workspace',            color: '#C084FC' },
];

const STATS = [
  { val: '12K+', label: 'Creators',     color: '#22D3EE' },
  { val: '3.4K', label: 'Brands',       color: '#C084FC' },
  { val: '97%',  label: 'Success Rate', color: '#22D3EE' },
];

export default function AuthLeftPanel({ mode = 'login', step = 0, steps = [] }) {
  const isLogin = mode === 'login';

  return (
    <div className="is-auth-left" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '28px 36px',
      height: '100vh',
      overflow: 'hidden',
    }}>

      {/* ── Decorative rings ── */}
      <div style={{ position:'absolute', width:480, height:480, borderRadius:'50%', border:'1px solid rgba(99,102,241,0.10)', top:'-15%', right:'-25%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(34,211,238,0.07)', bottom:'5%', left:'-15%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 68%)', filter:'blur(65px)', top:'15%', right:'0%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,211,238,0.12) 0%,transparent 68%)', filter:'blur(55px)', bottom:'20%', left:'5%', pointerEvents:'none' }} />

      {/* ═══ ZONE 1 — Top navigation ═══ */}
      <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
        <Link to="/"
          className="text-decoration-none d-flex align-items-center gap-1"
          style={{ color:'rgba(156,163,175,0.60)', fontSize:'0.72rem', fontWeight:600, marginBottom:20, display:'inline-flex' }}
          onMouseEnter={e => e.currentTarget.style.color='#22D3EE'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(156,163,175,0.60)'}>
          <ArrowLeft size={12} strokeWidth={1.75} /> Back to Home
        </Link>

        {/* Brand row */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#6366F1,#C084FC)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 22px rgba(99,102,241,0.70)',
          }}>
            <Zap size={19} color="#fff" fill="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <div className="display-brand" style={{ fontSize:'1.5rem', color:'#F9FAFB', lineHeight:1, letterSpacing:'-0.02em' }}>InSync</div>
            <div style={{ fontSize:'0.58rem', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.12em' }}>Creator Economy Platform</div>
          </div>
        </div>
      </div>

      {/* ═══ ZONE 2 — Main content (headline + content + animation) ═══ */}
      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:18, paddingTop:8, paddingBottom:8, minHeight:0 }}>

        {/* Headline */}
        <div>
          <h2 className="display-brand" style={{ fontSize:'clamp(1.55rem,2.5vw,2.1rem)', color:'#F9FAFB', lineHeight:1.08, fontWeight:900, marginBottom:8, letterSpacing:'-0.03em' }}>
            {isLogin
              ? <><span style={{ color:'#F9FAFB' }}>Welcome back,</span><br /><span style={{ color:'#22D3EE' }}>Creator.</span></>
              : <><span style={{ color:'#F9FAFB' }}>Join the creator</span><br /><span style={{ color:'#22D3EE' }}>economy today.</span></>
            }
          </h2>
          <p style={{ color:'#9CA3AF', fontSize:'0.82rem', lineHeight:1.60, margin:0, maxWidth:320 }}>
            {isLogin
              ? 'Sign in to manage campaigns, connect with brands, and track your performance in real time.'
              : 'Create your free account and start connecting with top brands and sponsors across every niche.'}
          </p>
        </div>

        {/* Two-column layout: content left, animation right */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-start', minHeight:0 }}>

          {/* Left: features / perks */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, minWidth:0 }}>
            {isLogin ? (
              LOGIN_FEATURES.map(({ Icon, label, desc, color }) => (
                <div key={label} style={{
                  display:'flex', alignItems:'center', gap:10,
                  background:'rgba(6,11,19,0.55)', backdropFilter:'blur(14px)',
                  border:`1px solid ${color}20`, borderRadius:12,
                  padding:'9px 12px',
                }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:`${color}15`, border:`1px solid ${color}26`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={14} color={color} strokeWidth={1.75} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'0.78rem', fontWeight:800, color:'#F9FAFB', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
                    <div style={{ fontSize:'0.65rem', fontWeight:500, color:'#6B7280', marginTop:1 }}>{desc}</div>
                  </div>
                </div>
              ))
            ) : (
              PERKS.map(({ text, color }) => (
                <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:`${color}18`, border:`1px solid ${color}34`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <Check size={9} color={color} strokeWidth={2.5} />
                  </div>
                  <span style={{ color:'#D1D5DB', fontSize:'0.81rem', fontWeight:500, lineHeight:1.50 }}>{text}</span>
                </div>
              ))
            )}
          </div>

          {/* Right: animation — contained, no overflow */}
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isLogin ? (
              <div style={{ position:'relative', width:120, height:120 }}>
                {/* Spinning ring */}
                <div style={{
                  position:'absolute', inset:-3, borderRadius:'50%', zIndex:0,
                  background:'conic-gradient(from 0deg,#22D3EE 0%,#6366F1 40%,#C084FC 70%,#22D3EE 100%)',
                  animation:'panelSpin 10s linear infinite',
                }} />
                {/* Frosted circle */}
                <div style={{
                  position:'absolute', inset:3, borderRadius:'50%', zIndex:1,
                  background:'rgba(8,15,32,0.90)', backdropFilter:'blur(10px)',
                  border:'1px solid rgba(34,211,238,0.18)',
                  overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Lottie animationData={loginAnimation} loop style={{ width:'90%' }} />
                </div>
              </div>
            ) : (
              <div style={{ width:120, borderRadius:14, overflow:'hidden', background:'rgba(8,15,32,0.80)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(192,132,252,0.26)', boxShadow:'0 0 24px rgba(99,102,241,0.20)' }}>
                <div style={{ height:2, background:'linear-gradient(90deg,#6366F1,#C084FC,#22D3EE)' }} />
                <Lottie animationData={signupAnimation} loop style={{ width:'100%' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ ZONE 3 — Bottom: stats + step tracker ═══ */}
      <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>

        {/* Stats strip */}
        <div style={{
          display:'flex',
          background:'rgba(6,11,19,0.60)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(99,102,241,0.20)', borderRadius:13, overflow:'hidden',
          marginBottom: !isLogin && steps.length > 0 ? 16 : 0,
        }}>
          {STATS.map(({ val, label, color }, i) => (
            <div key={label} style={{
              flex:1, padding:'10px 6px', textAlign:'center',
              borderRight: i < STATS.length-1 ? '1px solid rgba(99,102,241,0.12)' : 'none',
            }}>
              <div style={{ fontSize:'1.10rem', fontWeight:900, color, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:'0.58rem', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Step tracker — signup only */}
        {!isLogin && steps.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {steps.map((label, i) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  fontSize:'0.66rem', fontWeight:800, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.40s var(--ease-spring)',
                  background: i <= step ? 'linear-gradient(135deg,#6366F1,#C084FC)' : 'rgba(255,255,255,0.08)',
                  color:'#fff',
                  boxShadow: i <= step ? '0 0 12px rgba(99,102,241,0.65)' : 'none',
                }}>
                  {i < step ? <Check size={11} strokeWidth={2.5} /> : i+1}
                </div>
                <span style={{ color: i <= step ? '#F9FAFB' : 'rgba(255,255,255,0.30)', fontSize:'0.70rem', fontWeight: i <= step ? 700 : 400 }}>
                  {label}
                </span>
                {i < steps.length-1 && (
                  <div style={{ width:18, height:2, borderRadius:2, marginLeft:2,
                    background: i < step ? 'linear-gradient(90deg,#6366F1,#C084FC)' : 'rgba(255,255,255,0.12)',
                    transition:'background 0.40s ease' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes panelSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
