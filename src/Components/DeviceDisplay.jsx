import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Sparkles, Cpu, Dumbbell, Coffee, Globe, Shirt, Leaf, Camera,
  Users, Building2, TrendingUp, Award, Megaphone, Zap, ArrowRight,
  Star, Radio, ShoppingBag, Tv, Music, BookOpen, Briefcase,
} from 'lucide-react';

/* ─── Brand ticker data ─── */
const BRANDS = [
  { Icon: Building2, name: 'TechCorp' },
  { Icon: ShoppingBag, name: 'ShopStyle' },
  { Icon: Tv, name: 'StreamVia' },
  { Icon: Music, name: 'BeatLabs' },
  { Icon: BookOpen, name: 'LearnHub' },
  { Icon: Briefcase, name: 'WorkForce' },
  { Icon: Star, name: 'LuxBrand' },
  { Icon: Radio, name: 'MediaWave' },
  { Icon: Globe, name: 'WorldCo' },
  { Icon: Zap, name: 'FlashNet' },
];
const TICKER = [...BRANDS, ...BRANDS]; // doubled for seamless loop

/* ─── Showcase campaigns ─── */
const SHOWCASE = [
  { id:1, title:'Summer Glow',   brand:'Luminary Beauty', category:'Beauty',      budget:'₹1,20,000', Icon:Sparkles, bgA:'#3d0017', bgB:'#6d0030', h:210 },
  { id:2, title:'TechDrop 2025', brand:'NexaGadgets',    category:'Tech',         budget:'₹3,50,000', Icon:Cpu,      bgA:'#0d0d2b', bgB:'#1a1a5e', h:270 },
  { id:3, title:'Fit & Fresh',   brand:'AthleteCore',    category:'Fitness',      budget:'₹80,000',   Icon:Dumbbell, bgA:'#002b1a', bgB:'#004d2e', h:175 },
  { id:4, title:'Urban Grind',   brand:'StreetBrew Co.', category:'Food',         budget:'₹60,000',   Icon:Coffee,   bgA:'#2b1a00', bgB:'#4d2e00', h:250 },
  { id:5, title:'Wanderlust',    brand:'SkyTrail Tours', category:'Travel',       budget:'₹2,00,000', Icon:Globe,    bgA:'#1a0033', bgB:'#35006b', h:195 },
  { id:6, title:'StyleScript',   brand:'ClosetEdit',     category:'Fashion',      budget:'₹1,40,000', Icon:Shirt,    bgA:'#2b0025', bgB:'#56004a', h:235 },
  { id:7, title:'Clean Home',    brand:'EcoNest',        category:'Lifestyle',    budget:'₹55,000',   Icon:Leaf,     bgA:'#002b10', bgB:'#004d1e', h:185 },
  { id:8, title:'Pixel Story',   brand:'VisionCraft',    category:'Photography',  budget:'₹95,000',   Icon:Camera,   bgA:'#00162b', bgB:'#00284d', h:290 },
];

/* ─── Stats ─── */
const STATS = [
  { value:'12K+', label:'Active Creators', Icon:Users },
  { value:'3.4K', label:'Brands Connected', Icon:Building2 },
  { value:'₹28Cr',label:'Campaigns Funded', Icon:TrendingUp },
  { value:'97%',  label:'Success Rate',     Icon:Award },
];

/* ─── Verified companies section ─── */
const COMPANIES = [
  { name:'NexaGadgets',    sector:'Consumer Tech', Icon:Cpu },
  { name:'Luminary Beauty',sector:'Beauty & Care', Icon:Sparkles },
  { name:'AthleteCore',    sector:'Fitness',       Icon:Dumbbell },
  { name:'SkyTrail Tours', sector:'Travel',        Icon:Globe },
  { name:'ClosetEdit',     sector:'Fashion',       Icon:Shirt },
  { name:'VisionCraft',    sector:'Photography',   Icon:Camera },
];

export default function DeviceDisplay() {
  return (
    <div className="is-page" style={{ overflowY:'auto', minHeight:'100vh' }}>
      {/* Violet orb center */}
      <div className="is-page-orb-c" />
      <Navbar />

      {/* ═══ HERO ═══ */}
      <div style={{ padding:'96px var(--section-px) 0', paddingTop:'clamp(6rem,10vh,9rem)' }}>
        <div className="is-hero">
          <p className="is-hero-eyebrow">
            <Zap size={11} /> The Creator Economy Platform
          </p>
          <h1 className="is-hero-title display-brand">
            Where Brands Meet<br />
            <span style={{ opacity:0.88 }}>Their Perfect Creator</span>
          </h1>
          <p className="is-hero-subtitle">
            Discover campaigns, negotiate deals, and track every collaboration — all inside one elegant workspace built for the modern creator economy.
          </p>
          <div className="d-flex gap-3 justify-content-center mt-5 flex-wrap">
            <Link to="/signup" className="is-btn text-decoration-none"
              style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(16px)', border:'1.5px solid rgba(255,255,255,0.40)', color:'#fff', padding:'13px 32px', fontSize:'0.9rem' }}>
              <Sparkles size={16} /> Start for Free
            </Link>
            <Link to="/login" className="is-btn text-decoration-none"
              style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)', border:'1.5px solid rgba(255,255,255,0.22)', color:'rgba(255,255,255,0.90)', padding:'13px 32px', fontSize:'0.9rem' }}>
              Sign In <ArrowRight size={15} />
            </Link>
          </div>

          {/* Floating 3-D abstract shapes */}
          <div style={{ marginTop:56, display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap', opacity:0.92 }}>
            {[
              { Icon:TrendingUp, label:'Live Analytics',   val:'+24%' },
              { Icon:Users,      label:'Active Campaigns', val:'1.2K' },
              { Icon:Award,      label:'Verified Brands',  val:'3.4K' },
            ].map(({ Icon, label, val }) => (
              <div key={label} style={{
                background:'rgba(255,255,255,0.14)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(255,255,255,0.30)',
                borderRadius:16, padding:'14px 22px', minWidth:140,
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              }}>
                <Icon size={22} color="#fff" />
                <span style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', lineHeight:1 }}>{val}</span>
                <span style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.72)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TICKER ═══ */}
      <div style={{ padding:'48px 0 40px' }}>
        <p style={{ textAlign:'center', fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:20 }}>
          Trusted by leading brands worldwide
        </p>
        <div className="is-ticker">
          <div className="is-ticker-track">
            {TICKER.map(({ Icon, name }, i) => (
              <div key={i} className="is-ticker-item">
                <Icon size={16} />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="is-section">
        <div className="row g-4 justify-content-center">
          {STATS.map(({ value, label, Icon }) => (
            <div key={label} className="col-6 col-md-3">
              <div className="is-stat-card text-center">
                <div style={{ width:48, height:48, borderRadius:14, background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'var(--brand-glow-btn)' }}>
                  <Icon size={22} color="#fff" />
                </div>
                <div className="is-stat-value">{value}</div>
                <div className="is-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MASONRY CAMPAIGNS ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <h2 className="is-section-title mb-0">
            <span>Trending</span> Campaigns
          </h2>
          <Link to="/signup" className="is-btn is-btn-ghost text-decoration-none" style={{ fontSize:'0.82rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="is-masonry">
          {SHOWCASE.map(({ id, title, brand, category, budget, Icon, bgA, bgB, h }) => (
            <div key={id} className="is-masonry-item">
              <div style={{
                height:h,
                background:`linear-gradient(145deg, ${bgA} 0%, ${bgB} 100%)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative', overflow:'hidden',
              }}>
                {/* Glow orb */}
                <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(230,0,35,0.20)', filter:'blur(60px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                <Icon size={h > 220 ? 56 : 42} color="rgba(255,255,255,0.90)" strokeWidth={1.4} style={{ position:'relative', zIndex:1 }} />
              </div>
              <div className="p-3 pb-4">
                <span className="is-pill" style={{ background:'rgba(230,0,35,0.12)', color:'var(--brand-1)', marginBottom:8, display:'inline-flex' }}>{category}</span>
                <h6 className="fw-800 mt-2 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.95rem' }}>{title}</h6>
                <p className="mb-1" style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{brand}</p>
                <p className="mb-0 fw-800" style={{ color:'var(--brand-1)', fontSize:'0.85rem' }}>{budget}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ VERIFIED COMPANIES ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <h2 className="is-section-title">
          Verified <span>Companies</span>
        </h2>
        <div className="row g-4">
          {COMPANIES.map(({ name, sector, Icon }) => (
            <div key={name} className="col-sm-6 col-lg-4">
              <div className="is-card-neon p-4 d-flex align-items-center gap-3">
                <div className="is-icon-box">
                  <Icon size={22} color="#fff" />
                </div>
                <div>
                  <p className="fw-800 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.95rem' }}>{name}</p>
                  <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{sector}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CTA BAND ═══ */}
      <div className="is-section" style={{ paddingTop:0 }}>
        <div className="is-hero" style={{ padding:'64px 48px', borderRadius:22 }}>
          <h2 className="display-brand mb-3" style={{ fontSize:'clamp(1.8rem,4vw,3rem)', color:'#fff', fontWeight:900 }}>
            Ready to grow your brand?
          </h2>
          <p style={{ color:'rgba(255,255,255,0.82)', marginBottom:32, maxWidth:480, marginInline:'auto' }}>
            Join thousands of sponsors and creators already building the future of digital marketing on InSync.
          </p>
          <Link to="/signup" className="is-btn text-decoration-none"
            style={{ background:'#fff', color:'var(--brand-1)', padding:'14px 40px', fontSize:'0.95rem', fontWeight:800, boxShadow:'0 8px 32px rgba(0,0,0,0.22)' }}>
            <Megaphone size={18} /> Get Started — It's Free
          </Link>
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height:48 }} />
    </div>
  );
}
