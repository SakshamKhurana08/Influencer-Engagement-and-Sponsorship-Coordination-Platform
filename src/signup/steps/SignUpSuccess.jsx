import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '../../success-animation.json';
import { Zap, ArrowRight, Home } from 'lucide-react';

export default function SignUpSuccess() {
  return (
    <div className="is-page d-flex align-items-center justify-content-center" style={{ minHeight:'100vh', padding:24 }}>
      <div className="is-page-orb-c" />
      <div className="is-card p-5 text-center" style={{ maxWidth:520, width:'100%', zIndex:1, position:'relative' }}>
        <div style={{ width:180, margin:'0 auto 24px' }}>
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--brand-glow-btn)' }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span className="display-brand is-gradient-text" style={{ fontSize:'1.4rem' }}>InSync</span>
        </div>
        <h2 className="fw-900 mb-2 display-brand" style={{ color:'var(--text-primary)', fontSize:'2.2rem', letterSpacing:'-0.02em' }}>
          You're in!
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'1rem', marginBottom:36, lineHeight:1.65 }}>
          Your account has been created. Sign in to start discovering campaigns and building your creator portfolio.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" className="is-btn is-btn-brand text-decoration-none" style={{ padding:'12px 32px' }}>
            <ArrowRight size={16} /> Sign In
          </Link>
          <Link to="/" className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'12px 28px' }}>
            <Home size={15} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
