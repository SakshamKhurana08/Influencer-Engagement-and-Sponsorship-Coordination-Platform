import { Link } from 'react-router-dom';
import {
  Mail, MapPin, ArrowLeft,
  Link2, BarChart2, Shield, MessageSquare,
  Zap, Target, Rocket, HeartHandshake,
  Users, Building2, TrendingUp, Award,
} from 'lucide-react';
import Navbar from './Navbar';

const PILLARS = [
  { Icon: Link2,         title: 'Smart Matchmaking',   desc: 'Connect brands with the right creators based on niche, audience, and campaign goals.',       grad: 'linear-gradient(135deg,#6366F1,#C084FC)', glow: 'rgba(99,102,241,0.40)' },
  { Icon: BarChart2,     title: 'Real-time Analytics', desc: 'Track campaign status, ad requests, and deal progress from a single unified dashboard.',      grad: 'linear-gradient(135deg,#C084FC,#22D3EE)', glow: 'rgba(192,132,252,0.40)' },
  { Icon: Shield,        title: 'Secure & Scalable',   desc: 'JWT authentication, role-based access control, and a REST API built on SQLite.',              grad: 'linear-gradient(135deg,#22D3EE,#6366F1)', glow: 'rgba(34,211,238,0.40)' },
  { Icon: MessageSquare, title: 'Negotiation Tools',   desc: 'Propose terms, counter-offer, and close deals entirely within the platform — no email chains.', grad: 'linear-gradient(135deg,#6366F1,#22D3EE)', glow: 'rgba(99,102,241,0.40)' },
];

const TIMELINE = [
  { year: '2025', Icon: Zap,            title: 'Platform Built',         desc: 'InSync was developed as a full-stack influencer engagement platform connecting sponsors and creators.',  color: '#6366F1' },
  { year: '2025', Icon: Rocket,         title: 'Public Launch',          desc: 'Sponsor portal, influencer dashboard, campaign management, and negotiation suite launched.',            color: '#C084FC' },
  { year: '2025', Icon: Target,         title: 'Role-Based Access',      desc: 'Admin, sponsor, and influencer roles with dedicated dashboards and scoped API access.',                  color: '#22D3EE' },
  { year: '2026', Icon: HeartHandshake, title: 'Negotiation Suite',      desc: 'Full counter-offer and negotiation flow — sponsors and creators close deals entirely within InSync.',   color: '#C084FC' },
];

const STATS = [
  { value: 'Free',  label: 'To Get Started',    Icon: Users,      color: '#22D3EE' },
  { value: 'RBAC',  label: 'Role-Based Access',  Icon: Building2,  color: '#C084FC' },
  { value: 'Live',  label: 'Real-time Deals',    Icon: TrendingUp, color: '#6366F1' },
  { value: 'Open',  label: 'Negotiation Flow',   Icon: Award,      color: '#22D3EE' },
];

const CONTACT = [
  { Icon: Mail,   text: 'support@insync.dev',  color: '#22D3EE' },
  { Icon: MapPin, text: 'New Delhi, India',    color: '#6366F1' },
];

export default function About() {
  return (
    <div className="is-page" style={{ overflowY: 'auto', minHeight: '20vh' }}>
      <div className="is-page-orb-c" aria-hidden="true" />
      <Navbar />

      {/* ═══ HERO ═══ */}
      <div style={{ padding: '74px var(--section-px) 2rem' }}>
        <div className="row align-items-stretch g-4">

          {/* Left: text */}
          <div className="col-lg-6 d-flex flex-column justify-content-center">
            <Link to="/" className="is-btn is-btn-ghost text-decoration-none d-inline-flex mb-3"
              style={{ padding: '5px 12px', fontSize: '0.78rem', width: 'fit-content' }}>
              <ArrowLeft size={13} strokeWidth={1.75} /> Home
            </Link>
            <h1 className="display-brand" style={{ fontSize: 'clamp(1.9rem,4.2vw,3rem)', color: 'var(--text-primary)', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 14 }}>
              We're building the<br />
              <span className="is-gradient-text">future of creator</span><br />
              marketing.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.70, marginBottom: 22, maxWidth: 460 }}>
              InSync connects brands with creators to build impactful, authentic digital campaigns — from first contact to final delivery, all in one transparent platform.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/signup" className="is-btn is-btn-brand text-decoration-none" style={{ padding: '10px 24px' }}>
                <Rocket size={15} strokeWidth={1.75} /> Join InSync
              </Link>
              <Link to="/login" className="is-btn is-btn-ghost text-decoration-none" style={{ padding: '10px 24px' }}>
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: instant-render stats grid (replaces Lottie) */}
          <div className="col-lg-6 d-flex align-items-center">
            <div style={{ width: '100%' }}>
              {/* Top stat row */}
              <div className="row g-3 mb-3">
                {STATS.map(({ value, label, Icon, color }) => (
                  <div key={label} className="col-6">
                    <div style={{
                      background: 'var(--bg-surface)',
                      backdropFilter: 'var(--glass-blur)',
                      border: `1px solid ${color}25`,
                      borderRadius: 14,
                      padding: '16px 18px',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} color={color} strokeWidth={1.75} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bottom feature bar */}
              <div style={{
                background: 'var(--brand-grad)',
                borderRadius: 14,
                padding: '18px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                boxShadow: 'var(--brand-glow-btn)',
              }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4 }}>Platform Status</p>
                  <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Now Live</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Fashion', 'Tech', 'Travel', 'Food'].map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PILLARS ═══ */}
      <div style={{ padding: '0 var(--section-px) 2rem' }}>
        <h2 className="is-section-title text-center">Our Core <span>Pillars</span></h2>
        <div className="row g-3">
          {PILLARS.map(({ Icon, title, desc, grad, glow }) => (
            <div key={title} className="col-sm-6 col-lg-3">
              <div className="is-card h-100 p-4 d-flex flex-column">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: `0 6px 20px ${glow}`, flexShrink: 0 }}>
                  <Icon size={20} color="#fff" strokeWidth={1.75} />
                </div>
                <h6 className="fw-800 mb-2" style={{ color: 'var(--text-primary)', fontSize: '0.90rem' }}>{title}</h6>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.65, flexGrow: 1 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TIMELINE — 2×2 grid, no connector line, instant render ═══ */}
      <div style={{ padding: '0 var(--section-px) 2rem' }}>
        <h2 className="is-section-title text-center">Our <span>Journey</span></h2>
        <div className="row g-3">
          {TIMELINE.map(({ year, Icon, title, desc, color }) => (
            <div key={year} className="col-sm-6">
              <div className="is-card h-100 p-4 d-flex gap-3">
                <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
                  <Icon size={19} color={color} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="is-pill d-inline-flex mb-2" style={{ background: 'var(--brand-grad)', color: '#fff', fontSize: '0.58rem' }}>{year}</span>
                  <h6 className="fw-800 mb-1" style={{ color: 'var(--text-primary)', fontSize: '0.90rem' }}>{title}</h6>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', lineHeight: 1.62 }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CONTACT ═══ */}
      <div style={{ padding: '0 var(--section-px) 3rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="is-card p-4">
              <h2 className="is-section-title">Get in <span>Touch</span></h2>
              {CONTACT.map(({ Icon, text, color }) => (
                <div key={text} className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={color} strokeWidth={1.75} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
