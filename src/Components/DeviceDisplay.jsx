import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Sparkles, Cpu, Dumbbell, Coffee, Globe, Shirt, Leaf, Camera,
  Users, Building2, TrendingUp, Award, Megaphone, Zap, ArrowRight,
  Star, Radio, ShoppingBag, Tv, Music, BookOpen, Briefcase, Wallet,
  Link2, BarChart2, Shield, MessageSquare, Activity, Layers,
} from 'lucide-react';

const BRANDS = [
  { Icon: Building2,   name: 'TechCorp' },
  { Icon: ShoppingBag, name: 'ShopStyle' },
  { Icon: Tv,          name: 'StreamVia' },
  { Icon: Music,       name: 'BeatLabs' },
  { Icon: BookOpen,    name: 'LearnHub' },
  { Icon: Briefcase,   name: 'WorkForce' },
  { Icon: Star,        name: 'LuxBrand' },
  { Icon: Radio,       name: 'MediaWave' },
  { Icon: Globe,       name: 'WorldCo' },
  { Icon: Zap,         name: 'FlashNet' },
];
const TICKER = [...BRANDS, ...BRANDS];

const SHOWCASE = [
  { id:1, title:'Summer Glow',   brand:'Luminary Beauty', cat:'Beauty',     budget:'₹1,20,000', Icon:Sparkles, bg:'linear-gradient(145deg,#1a0533,#3d1060)' },
  { id:2, title:'TechDrop 2025', brand:'NexaGadgets',    cat:'Tech',        budget:'₹3,50,000', Icon:Cpu,      bg:'linear-gradient(145deg,#091e48,#1a3a8a)' },
  { id:3, title:'Fit & Fresh',   brand:'AthleteCore',    cat:'Fitness',     budget:'₹80,000',   Icon:Dumbbell, bg:'linear-gradient(145deg,#0a2353,#0e3a6e)' },
  { id:4, title:'Urban Grind',   brand:'StreetBrew Co.', cat:'Food',        budget:'₹60,000',   Icon:Coffee,   bg:'linear-gradient(145deg,#112C70,#1e4494)' },
  { id:5, title:'Wanderlust',    brand:'SkyTrail Tours', cat:'Travel',      budget:'₹2,00,000', Icon:Globe,    bg:'linear-gradient(145deg,#0d1a40,#1a2e6e)' },
  { id:6, title:'StyleScript',   brand:'ClosetEdit',     cat:'Fashion',     budget:'₹1,40,000', Icon:Shirt,    bg:'linear-gradient(145deg,#1a0a40,#2d1270)' },
  { id:7, title:'Clean Home',    brand:'EcoNest',        cat:'Lifestyle',   budget:'₹55,000',   Icon:Leaf,     bg:'linear-gradient(145deg,#091e48,#0d2e70)' },
  { id:8, title:'Pixel Story',   brand:'VisionCraft',    cat:'Photography', budget:'₹95,000',   Icon:Camera,   bg:'linear-gradient(145deg,#0f1a50,#1a2e80)' },
];

const STATS = [
  { value:'12K+', label:'Active Creators',  Icon:Users,     color:'#56E1E9' },
  { value:'3.4K', label:'Brands Connected', Icon:Building2, color:'#BB63FF' },
  { value:'₹28Cr',label:'Campaigns Funded', Icon:TrendingUp,color:'#5B58EB' },
  { value:'97%',  label:'Success Rate',     Icon:Award,     color:'#56E1E9' },
];

const PILLARS = [
  { Icon:Link2,         title:'Smart Matchmaking',   desc:'AI-powered pairing between brands and creators based on niche, audience, and campaign goals.',          grad:'linear-gradient(135deg,#5B58EB,#BB63FF)', glow:'rgba(91,88,235,0.35)' },
  { Icon:BarChart2,     title:'Real-time Analytics', desc:'Track campaign ROI, reach, and engagement from a single unified dashboard — updated live.',              grad:'linear-gradient(135deg,#BB63FF,#56E1E9)', glow:'rgba(187,99,255,0.35)' },
  { Icon:Shield,        title:'Secure & Scalable',   desc:'JWT auth, role-based access, and a PostgreSQL-backed infrastructure designed for enterprise scale.',      grad:'linear-gradient(135deg,#56E1E9,#5B58EB)', glow:'rgba(86,225,233,0.35)' },
  { Icon:MessageSquare, title:'Negotiation Tools',   desc:'Propose terms, counter-offer, and close deals entirely within the platform — no email chains.',          grad:'linear-gradient(135deg,#5B58EB,#56E1E9)', glow:'rgba(91,88,235,0.35)' },
];

const COMPANIES = [
  { name:'NexaGadgets',    sector:'Consumer Tech', Icon:Cpu,      color:'#56E1E9' },
  { name:'Luminary Beauty',sector:'Beauty & Care', Icon:Sparkles, color:'#BB63FF' },
  { name:'AthleteCore',    sector:'Fitness',       Icon:Dumbbell, color:'#5B58EB' },
  { name:'SkyTrail Tours', sector:'Travel',        Icon:Globe,    color:'#56E1E9' },
  { name:'ClosetEdit',     sector:'Fashion',       Icon:Shirt,    color:'#BB63FF' },
  { name:'VisionCraft',    sector:'Photography',   Icon:Camera,   color:'#5B58EB' },
];

export default function DeviceDisplay() {
  return (
    <div className="is-page" style={{ overflowY: 'auto', minHeight: '100vh' }}>
      <div className="is-page-orb-c" aria-hidden="true" />
      <Navbar />

      {/* ═══ HERO — compact, single viewport, gap from navbar ═══ */}
      <div style={{ padding: '0 var(--section-px)', paddingTop: '90px' }}>
        <div className="is-hero" style={{ padding: '44px 40px 36px' }}>
          <p className="is-hero-eyebrow">
            <Zap size={10} strokeWidth={1.75} color="#56E1E9" /> The Creator Economy Platform
          </p>
          <h1 className="is-hero-title display-brand" style={{ fontSize: 'clamp(1.9rem,4.2vw,3.2rem)' }}>
            Where Brands Meet{' '}
            <span style={{ color: '#56E1E9' }}>Their Perfect Creator</span>
          </h1>
          <p className="is-hero-subtitle" style={{ fontSize: '0.96rem', marginTop: 12, maxWidth: 500 }}>
            Discover campaigns, negotiate deals, and track every collaboration inside one elegant workspace.
          </p>

          {/* CTA buttons */}
          <div className="d-flex gap-3 justify-content-center mt-3 flex-wrap">
            <Link to="/signup" className="is-btn text-decoration-none" style={{
              background: '#fff', color: '#0A2353',
              padding: '11px 28px', fontSize: '0.88rem', fontWeight: 800,
              boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
            }}>
              <Sparkles size={15} strokeWidth={1.75} /> Start for Free
            </Link>
            <Link to="/login" className="is-btn text-decoration-none" style={{
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255,255,255,0.28)', color: '#fff',
              padding: '11px 28px', fontSize: '0.88rem',
            }}>
              Sign In <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>

          {/* Metric chips — compact horizontal row */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {[
              { Icon: Activity, label: 'Live Analytics',   val: '+24%', color: '#56E1E9' },
              { Icon: Users,    label: 'Active Campaigns', val: '1.2K', color: '#BB63FF' },
              { Icon: Award,    label: 'Verified Brands',  val: '3.4K', color: '#56E1E9' },
              { Icon: Layers,   label: 'Deals Closed',     val: '8.7K', color: '#BB63FF' },
            ].map(({ Icon, label, val, color }) => (
              <div key={label} style={{
                background: 'rgba(10,35,83,0.55)', backdropFilter: 'blur(16px)',
                border: `1px solid ${color}28`,
                borderRadius: 50, padding: '7px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Icon size={14} color={color} strokeWidth={1.75} />
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{val}</span>
                <span style={{ fontSize: '0.60rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TICKER — tight below hero ═══ */}
      <div style={{ padding: '16px var(--section-px) 14px' }}>
        <p style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          Trusted by leading brands worldwide
        </p>
        <div className="is-ticker">
          <div className="is-ticker-track">
            {TICKER.map(({ Icon, name }, i) => (
              <div key={i} className="is-ticker-item">
                <Icon size={13} strokeWidth={1.75} /> {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div style={{ padding: '0 var(--section-px) 1.25rem' }}>
        <div className="row g-3 justify-content-center">
          {STATS.map(({ value, label, Icon, color }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="is-stat-card text-center">
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Icon size={19} color={color} strokeWidth={1.75} />
                </div>
                <div className="is-stat-value">{value}</div>
                <div className="is-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PILLARS ═══ */}
      <div style={{ padding: '0 var(--section-px) 1.25rem' }}>
        <h2 className="is-section-title text-center">Platform <span>Pillars</span></h2>
        <div className="row g-3">
          {PILLARS.map(({ Icon, title, desc, grad, glow }) => (
            <div key={title} className="col-sm-6 col-lg-3">
              <div className="is-card h-100 p-4 d-flex flex-column">
                <div style={{ width: 46, height: 46, borderRadius: 13, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 6px 20px ${glow}`, flexShrink: 0 }}>
                  <Icon size={21} color="#fff" strokeWidth={1.75} />
                </div>
                <h6 className="fw-800 mb-2" style={{ color: 'var(--text-primary)', fontSize: '0.91rem' }}>{title}</h6>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.65, flexGrow: 1 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CAMPAIGNS ═══ */}
      <div style={{ padding: '0 var(--section-px) 1.25rem' }}>
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
          <h2 className="is-section-title mb-0"><span>Trending</span> Campaigns</h2>
          <Link to="/signup" className="is-btn is-btn-ghost text-decoration-none" style={{ fontSize: '0.81rem' }}>
            View All <ArrowRight size={13} strokeWidth={1.75} />
          </Link>
        </div>
        <div className="is-camp-grid">
          {SHOWCASE.map(({ id, title, brand, cat, budget, Icon, bg }) => (
            <div key={id} className="is-camp-card">
              <div className="is-camp-card-header" style={{ background: bg }}>
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(91,88,235,0.25)', filter: 'blur(40px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                <Icon size={34} color="rgba(255,255,255,0.90)" strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }} />
              </div>
              <div className="is-camp-card-body">
                <span className="is-pill mb-2 d-inline-flex" style={{ background: 'rgba(91,88,235,0.15)', color: '#BB63FF' }}>{cat}</span>
                <h6 className="fw-800 mt-1 mb-1" style={{ color: 'var(--text-primary)', fontSize: '0.91rem' }}>{title}</h6>
                <p className="mb-1" style={{ color: 'var(--text-muted)', fontSize: '0.77rem' }}>{brand}</p>
                <p className="mb-0 fw-800 mt-auto" style={{ color: '#56E1E9', fontSize: '0.82rem' }}>
                  <Wallet size={11} strokeWidth={1.75} style={{ marginRight: 3, verticalAlign: 'middle' }} />{budget}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ COMPANIES ═══ */}
      <div style={{ padding: '0 var(--section-px) 2rem' }}>
        <h2 className="is-section-title">Verified <span>Companies</span></h2>
        <div className="row g-3">
          {COMPANIES.map(({ name, sector, Icon, color }) => (
            <div key={name} className="col-sm-6 col-lg-4">
              <div className="is-card-neon p-4 d-flex align-items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={color} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="fw-800 mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.91rem' }}>{name}</p>
                  <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{sector}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CTA ═══ */}
      <div style={{ padding: '0 var(--section-px) 3rem' }}>
        <div className="is-hero" style={{ padding: '52px 44px' }}>
          <h2 className="display-brand mb-3" style={{ fontSize: 'clamp(1.6rem,3.8vw,2.6rem)', color: '#fff', fontWeight: 900 }}>
            Ready to grow your brand?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.80)', marginBottom: 26, maxWidth: 440, marginInline: 'auto', fontSize: '0.97rem' }}>
            Join thousands of sponsors and creators already building the future of digital marketing on InSync.
          </p>
          <Link to="/signup" className="is-btn text-decoration-none"
            style={{ background: '#fff', color: '#0A2353', padding: '12px 38px', fontSize: '0.92rem', fontWeight: 800, boxShadow: '0 8px 28px rgba(0,0,0,0.22)' }}>
            <Megaphone size={17} strokeWidth={1.75} /> Get Started — It's Free
          </Link>
        </div>
      </div>
    </div>
  );
}
