import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import Navbar from './Navbar';
import {
  Sparkles, Cpu, Dumbbell, Coffee, Globe, Shirt, Leaf, Camera,
  TrendingUp, Award, Megaphone, Zap, ArrowRight, Building2,
  Star, Radio, ShoppingBag, Tv, Music, BookOpen, Briefcase, Wallet,
  Link2, BarChart2, Shield, MessageSquare, Activity, Layers, Users,
} from 'lucide-react';

/* ── Ticker brands ── */
const BRANDS = [
  { Icon: Building2, name: 'TechCorp' },
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

/* ── Fallback static campaigns (shown while loading or if DB empty) ── */
const FALLBACK = [
  { id:'f1', title:'Summer Glow',   Sponsor:{companyName:'Luminary Beauty'}, category:'Beauty',      budget:120000, _bg:'linear-gradient(145deg,#1a0533,#3d1060)', _Icon:Sparkles },
  { id:'f2', title:'TechDrop 2025', Sponsor:{companyName:'NexaGadgets'},     category:'Tech',         budget:350000, _bg:'linear-gradient(145deg,#091e48,#1a3a8a)', _Icon:Cpu },
  { id:'f3', title:'Fit & Fresh',   Sponsor:{companyName:'AthleteCore'},     category:'Fitness',      budget:80000,  _bg:'linear-gradient(145deg,#0a2353,#0e3a6e)', _Icon:Dumbbell },
  { id:'f4', title:'Urban Grind',   Sponsor:{companyName:'StreetBrew Co.'},  category:'Food',         budget:60000,  _bg:'linear-gradient(145deg,#112C70,#1e4494)', _Icon:Coffee },
  { id:'f5', title:'Wanderlust',    Sponsor:{companyName:'SkyTrail Tours'},  category:'Travel',       budget:200000, _bg:'linear-gradient(145deg,#0d1a40,#1a2e6e)', _Icon:Globe },
  { id:'f6', title:'StyleScript',   Sponsor:{companyName:'ClosetEdit'},      category:'Fashion',      budget:140000, _bg:'linear-gradient(145deg,#1a0a40,#2d1270)', _Icon:Shirt },
  { id:'f7', title:'Clean Home',    Sponsor:{companyName:'EcoNest'},         category:'Lifestyle',    budget:55000,  _bg:'linear-gradient(145deg,#091e48,#0d2e70)', _Icon:Leaf },
  { id:'f8', title:'Pixel Story',   Sponsor:{companyName:'VisionCraft'},     category:'Photography',  budget:95000,  _bg:'linear-gradient(145deg,#0f1a50,#1a2e80)', _Icon:Camera },
];

const BG_POOL = [
  'linear-gradient(145deg,#1a0533,#3d1060)',
  'linear-gradient(145deg,#091e48,#1a3a8a)',
  'linear-gradient(145deg,#0a2353,#0e3a6e)',
  'linear-gradient(145deg,#112C70,#1e4494)',
  'linear-gradient(145deg,#0d1a40,#1a2e6e)',
  'linear-gradient(145deg,#1a0a40,#2d1270)',
  'linear-gradient(145deg,#091e48,#0d2e70)',
  'linear-gradient(145deg,#0f1a50,#1a2e80)',
];

const STATS = [
  { value:'Free', label:'To Get Started',   Icon:Zap,        color:'#22D3EE' },
  { value:'RBAC', label:'Role-Based Access', Icon:Shield,     color:'#C084FC' },
  { value:'Live', label:'Real-time Deals',   Icon:TrendingUp, color:'#6366F1' },
  { value:'Open', label:'Negotiation Flow',  Icon:Award,      color:'#22D3EE' },
];

const PILLARS = [
  { Icon:Link2,         title:'Smart Matchmaking',   desc:'AI-powered pairing between brands and creators based on niche, audience, and campaign goals.',    grad:'linear-gradient(135deg,#6366F1,#C084FC)', glow:'rgba(99,102,241,0.35)' },
  { Icon:BarChart2,     title:'Real-time Analytics', desc:'Track campaign ROI, reach, and engagement from a single unified dashboard — updated live.',        grad:'linear-gradient(135deg,#C084FC,#22D3EE)', glow:'rgba(192,132,252,0.35)' },
  { Icon:Shield,        title:'Secure & Scalable',   desc:'JWT auth, role-based access, and a PostgreSQL-backed infrastructure designed for enterprise scale.', grad:'linear-gradient(135deg,#22D3EE,#6366F1)', glow:'rgba(34,211,238,0.35)' },
  { Icon:MessageSquare, title:'Negotiation Tools',   desc:'Propose terms, counter-offer, and close deals entirely within the platform — no email chains.',     grad:'linear-gradient(135deg,#6366F1,#22D3EE)', glow:'rgba(99,102,241,0.35)' },
];

export default function DeviceDisplay() {
  const [campaigns, setCampaigns] = useState(FALLBACK);
  const [loadingCamps, setLoadingCamps] = useState(true);

  /* Fetch top 8 public campaigns from DB — no auth required */
  useEffect(() => {
    api.get('/api/campaign/public', { params: { limit: 8 } })
      .then(r => {
        const data = r.data;
        const list = Array.isArray(data) ? data : (data.items || []);
        if (list.length > 0) setCampaigns(list.slice(0, 8));
      })
      .catch(() => { /* silently use fallback */ })
      .finally(() => setLoadingCamps(false));
  }, []);

  return (
    <div className="is-page" style={{ overflowY:'auto', minHeight:'100vh' }}>
      <div className="is-page-orb-c" aria-hidden="true" />
      <Navbar />

      {/* ═══ HERO — high contrast, clean obsidian card ═══ */}
      <div style={{ padding:'0 var(--section-px)', paddingTop:'90px' }}>
        <div style={{
          background: 'linear-gradient(145deg, #0A0F1E 0%, #0E1929 60%, #111D38 100%)',
          border: '1px solid rgba(99,102,241,0.22)',
          borderRadius: 24,
          padding: 'clamp(36px,5vh,52px) clamp(28px,5vw,52px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(99,102,241,0.10)',
        }}>
          {/* Grid mesh — very subtle */}
          <div style={{
            position:'absolute', inset:0, zIndex:0, pointerEvents:'none', opacity:0.4,
            backgroundImage:'linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px), linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)',
            backgroundSize:'52px 52px',
          }} />
          {/* Corner glows */}
          <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.28) 0%,transparent 70%)', filter:'blur(70px)', top:'-100px', left:'-80px', pointerEvents:'none', zIndex:0 }} />
          <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,211,238,0.18) 0%,transparent 70%)', filter:'blur(70px)', bottom:'-80px', right:'-60px', pointerEvents:'none', zIndex:0 }} />

          <div style={{ position:'relative', zIndex:1 }}>
            {/* Eyebrow */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, marginBottom:16,
              background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)',
              borderRadius:999, padding:'5px 14px' }}>
              <Zap size={11} color="#22D3EE" strokeWidth={1.75} />
              <span style={{ fontSize:'0.66rem', fontWeight:800, letterSpacing:'0.20em', textTransform:'uppercase', color:'#22D3EE' }}>
                The Creator Economy Platform
              </span>
            </div>

            {/* Main headline */}
            <h1 className="display-brand" style={{
              fontSize:'clamp(2.2rem,4.8vw,3.6rem)', fontWeight:900,
              lineHeight:1.06, letterSpacing:'-0.03em',
              color:'#F9FAFB', marginBottom:16,
            }}>
              Where Brands Meet<br />
              <span style={{ background:'linear-gradient(90deg,#6366F1,#C084FC,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Their Perfect Creator
              </span>
            </h1>

            {/* Subtitle — concise */}
            <p style={{ fontSize:'1.05rem', color:'#9CA3AF', maxWidth:500, marginInline:'auto', lineHeight:1.65, marginBottom:28 }}>
              One workspace to discover campaigns, negotiate deals, and track every collaboration — built for the modern creator economy.
            </p>

            {/* CTAs */}
            <div className="d-flex gap-3 justify-content-center flex-wrap" style={{ marginBottom:0 }}>
              <Link to="/signup" className="is-btn text-decoration-none" style={{
                background:'linear-gradient(135deg,#6366F1,#C084FC)',
                color:'#fff', padding:'13px 32px', fontSize:'0.92rem', fontWeight:800,
                boxShadow:'0 8px 32px rgba(99,102,241,0.50)',
                borderRadius:999,
              }}>
                <Sparkles size={15} strokeWidth={1.75} /> Start for Free
              </Link>
              <Link to="/login" className="is-btn text-decoration-none" style={{
                background:'rgba(255,255,255,0.07)', backdropFilter:'blur(12px)',
                border:'1.5px solid rgba(255,255,255,0.16)', color:'#E5E7EB',
                padding:'13px 32px', fontSize:'0.92rem', borderRadius:999,
              }}>
                Sign In <ArrowRight size={14} strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TICKER ═══ */}
      <div style={{ padding:'16px var(--section-px) 14px' }}>
        <p style={{ textAlign:'center', fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>
          Explore campaigns across every category
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
      <div style={{ padding:'0 var(--section-px) 1.25rem' }}>
        <div className="row g-3 justify-content-center">
          {STATS.map(({ value, label, Icon, color }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="is-stat-card text-center">
                <div style={{ width:42, height:42, borderRadius:11, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
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
      <div style={{ padding:'0 var(--section-px) 1.25rem' }}>
        <h2 className="is-section-title text-center">Platform <span>Pillars</span></h2>
        <div className="row g-3">
          {PILLARS.map(({ Icon, title, desc, grad, glow }) => (
            <div key={title} className="col-sm-6 col-lg-3">
              <div className="is-card h-100 p-4 d-flex flex-column">
                <div style={{ width:46, height:46, borderRadius:13, background:grad, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:`0 6px 20px ${glow}`, flexShrink:0 }}>
                  <Icon size={21} color="#fff" strokeWidth={1.75} />
                </div>
                <h6 className="fw-800 mb-2" style={{ color:'var(--text-primary)', fontSize:'0.91rem' }}>{title}</h6>
                <p className="mb-0" style={{ color:'var(--text-secondary)', fontSize:'0.83rem', lineHeight:1.65, flexGrow:1 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TRENDING CAMPAIGNS — dynamic DB fetch, top 8 ═══ */}
      <div style={{ padding:'0 var(--section-px) 1.5rem' }}>
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
          <h2 className="is-section-title mb-0"><span>Trending</span> Campaigns</h2>
          <Link to="/signup" className="is-btn is-btn-ghost text-decoration-none" style={{ fontSize:'0.81rem' }}>
            View All <ArrowRight size={13} strokeWidth={1.75} />
          </Link>
        </div>

        {loadingCamps ? (
          <div className="d-flex justify-content-center py-4">
            <div className="is-spinner" role="status" aria-label="Loading campaigns" />
          </div>
        ) : (
          <div className="is-camp-grid">
            {campaigns.map((c, idx) => {
              /* Support both DB records and fallback static objects */
              const title    = c.title;
              const brand    = c.Sponsor?.companyName || c.brand || '';
              const cat      = c.category || '';
              const budget   = c.budget ? `₹${Number(c.budget).toLocaleString()}` : (c._budget || '');
              const bg       = c._bg || BG_POOL[idx % BG_POOL.length];
              const IconComp = c._Icon || Megaphone;

              return (
                <div key={c.id || idx} className="is-camp-card">
                  <div className="is-camp-card-header" style={{ background: bg }}>
                    <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(99,102,241,0.25)', filter:'blur(40px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                    <IconComp size={34} color="rgba(255,255,255,0.90)" strokeWidth={1.5} style={{ position:'relative', zIndex:1 }} />
                  </div>
                  <div className="is-camp-card-body">
                    {cat && <span className="is-pill mb-2 d-inline-flex" style={{ background:'rgba(99,102,241,0.15)', color:'#C084FC' }}>{cat}</span>}
                    <h6 className="fw-800 mt-1 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.91rem' }}>{title}</h6>
                    {brand && <p className="mb-1" style={{ color:'var(--text-muted)', fontSize:'0.77rem' }}>{brand}</p>}
                    {budget && (
                      <p className="mb-0 fw-800 mt-auto" style={{ color:'#22D3EE', fontSize:'0.82rem' }}>
                        <Wallet size={11} strokeWidth={1.75} style={{ marginRight:3, verticalAlign:'middle' }} />{budget}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ CTA ═══ */}
      <div style={{ padding:'0 var(--section-px) 3rem' }}>
        <div style={{
          background:'linear-gradient(135deg,#6366F1 0%,#C084FC 55%,#22D3EE 100%)',
          borderRadius:20, padding:'52px 44px', textAlign:'center', color:'#fff',
          position:'relative', overflow:'hidden',
          boxShadow:'0 0 140px rgba(99,102,241,0.30), 0 0 72px rgba(34,211,238,0.18)',
        }}>
          <div style={{ position:'absolute', inset:0, zIndex:0, background:'radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.22) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <h2 className="display-brand mb-3" style={{ fontSize:'clamp(1.6rem,3.8vw,2.6rem)', fontWeight:900 }}>
              Ready to grow your brand?
            </h2>
            <p style={{ color:'rgba(255,255,255,0.82)', marginBottom:26, maxWidth:440, marginInline:'auto', fontSize:'0.97rem' }}>
              Join thousands of sponsors and creators already building the future of digital marketing on InSync.
            </p>
            <Link to="/signup" className="is-btn text-decoration-none"
              style={{ background:'#fff', color:'#060B13', padding:'12px 38px', fontSize:'0.92rem', fontWeight:800, boxShadow:'0 8px 28px rgba(0,0,0,0.22)' }}>
              <Megaphone size={17} strokeWidth={1.75} /> Get Started — It's Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
