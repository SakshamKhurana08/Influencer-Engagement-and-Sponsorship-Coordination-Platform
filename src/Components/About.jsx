import Lottie from 'lottie-react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowLeft, Link2, BarChart2, Shield, MessageSquare, Zap, Target, Rocket, HeartHandshake } from 'lucide-react';
import aboutAnimation from '../about-animation.json';
import Navbar from './Navbar';

const PILLARS = [
  {
    Icon: Link2, title: 'Smart Matchmaking',
    desc: 'AI-powered pairing between brands and creators based on niche, audience, and measurable campaign goals.',
    grad: 'linear-gradient(135deg,#e60023,#d63384)',
  },
  {
    Icon: BarChart2, title: 'Real-time Analytics',
    desc: 'Track campaign ROI, reach, and engagement from a single unified dashboard — updated live.',
    grad: 'linear-gradient(135deg,#d63384,#7c3aed)',
  },
  {
    Icon: Shield, title: 'Secure & Scalable',
    desc: 'JWT auth, role-based access, and a PostgreSQL-backed infrastructure designed for enterprise reliability.',
    grad: 'linear-gradient(135deg,#7c3aed,#0d9488)',
  },
  {
    Icon: MessageSquare, title: 'Negotiation Tools',
    desc: 'Propose terms, counter-offer, and close deals entirely within the platform — no email chains needed.',
    grad: 'linear-gradient(135deg,#0d9488,#e60023)',
  },
];

const TIMELINE = [
  { year:'2023', Icon: Zap,           title:'Platform Founded',       desc:'InSync was born from a single idea: influencer marketing deserved a modern, transparent home.' },
  { year:'2024', Icon: Target,        title:'10,000 Creators Joined', desc:'Rapid adoption across fashion, tech, and lifestyle verticals with 10K verified creator profiles.' },
  { year:'2025', Icon: Rocket,        title:'Enterprise Launch',      desc:'Full sponsor portal, campaign analytics dashboard, and negotiation suite released to the public.' },
  { year:'2026', Icon: HeartHandshake,title:'₹28 Crore Facilitated',  desc:'Platform crossed ₹28 crore in successfully facilitated campaign budgets across 3,400+ brands.' },
];

export default function About() {
  return (
    <div className="is-page" style={{ overflowY:'auto', minHeight:'100vh' }}>
      <div className="is-page-orb-c" />
      <Navbar />

      {/* ═══ HERO ═══ */}
      <div className="is-section" style={{ paddingTop:'clamp(5rem,10vh,8rem)' }}>
        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-lg-2 d-flex justify-content-center">
            <Lottie animationData={aboutAnimation} loop style={{ maxWidth:460, width:'100%' }} />
          </div>
          <div className="col-lg-6 order-lg-1">
            <Link to="/" className="is-btn is-btn-ghost text-decoration-none d-inline-flex mb-4" style={{ padding:'8px 18px', fontSize:'0.82rem' }}>
              <ArrowLeft size={14} /> Home
            </Link>
            <h1 className="display-brand mb-4" style={{ fontSize:'clamp(2.4rem,5vw,3.6rem)', color:'var(--text-primary)', lineHeight:1.08, letterSpacing:'-0.03em' }}>
              We're building the<br />
              <span className="is-gradient-text">future of creator</span><br />
              marketing.
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'1.05rem', lineHeight:1.75, marginBottom:32, maxWidth:480 }}>
              InSync connects brands with creators to build impactful, authentic digital campaigns — from first contact to final delivery, all in one transparent platform.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/signup" className="is-btn is-btn-brand text-decoration-none" style={{ padding:'12px 30px' }}>
                <Rocket size={16} /> Join InSync
              </Link>
              <Link to="/login" className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'12px 30px' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GLASSMORPHIC PILLARS ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <h2 className="is-section-title text-center">
          Our Core <span>Pillars</span>
        </h2>
        <div className="row g-4">
          {PILLARS.map(({ Icon, title, desc, grad }) => (
            <div key={title} className="col-sm-6 col-lg-3">
              <div className="is-card h-100 p-4" style={{ display:'flex', flexDirection:'column' }}>
                {/* Gradient icon */}
                <div style={{ width:52, height:52, borderRadius:15, background:grad, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, boxShadow:'0 6px 24px rgba(230,0,35,0.30)', flexShrink:0 }}>
                  <Icon size={24} color="#fff" strokeWidth={2} />
                </div>
                <h6 className="fw-800 mb-2" style={{ color:'var(--text-primary)', fontSize:'0.95rem' }}>{title}</h6>
                <p className="mb-0" style={{ color:'var(--text-secondary)', fontSize:'0.86rem', lineHeight:1.65, flexGrow:1 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TIMELINE ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <h2 className="is-section-title text-center">
          Our <span>Journey</span>
        </h2>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          {TIMELINE.map(({ year, Icon, title, desc }, i) => (
            <div key={year} className="d-flex gap-4 mb-5 align-items-start" style={{ position:'relative' }}>
              {/* Connector line */}
              {i < TIMELINE.length - 1 && (
                <div style={{ position:'absolute', left:27, top:56, width:2, height:'calc(100% + 8px)', background:'var(--brand-grad)', opacity:0.25 }} />
              )}
              {/* Icon node */}
              <div style={{ flexShrink:0, width:54, height:54, borderRadius:'50%', background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--brand-glow-btn)', zIndex:1 }}>
                <Icon size={22} color="#fff" />
              </div>
              {/* Content */}
              <div className="is-card p-4 flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                  <span className="is-pill" style={{ background:'var(--brand-grad)', color:'#fff', fontSize:'0.68rem' }}>{year}</span>
                  <h6 className="fw-800 mb-0" style={{ color:'var(--text-primary)' }}>{title}</h6>
                </div>
                <p className="mb-0" style={{ color:'var(--text-secondary)', fontSize:'0.87rem', lineHeight:1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CONTACT ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="is-card p-4 p-md-5">
              <h2 className="is-section-title">Get in <span>Touch</span></h2>
              {[
                { Icon: Mail,   text:'customer-care@insync.org' },
                { Icon: Phone,  text:'+91 44 3993 XXXX' },
                { Icon: MapPin, text:'Vellore Institute of Technology' },
              ].map(({ Icon, text }) => (
                <div key={text} className="d-flex align-items-center gap-3 mb-4">
                  <div className="is-icon-box is-icon-box-sm">
                    <Icon size={16} color="#fff" />
                  </div>
                  <span style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height:48 }} />
    </div>
  );
}
