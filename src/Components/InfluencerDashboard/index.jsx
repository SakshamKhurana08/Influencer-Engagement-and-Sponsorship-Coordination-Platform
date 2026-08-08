/**
 * Influencer Overview — summary stats + quick-action cards.
 * Re-exports as default so App.jsx import still works.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import {
  User, Megaphone, FileText, Settings, Zap,
  TrendingUp, CheckCircle, Clock, ArrowRight, Hash, Users,
} from 'lucide-react';

export default function InfluencerDashboard() {
  const navigate    = useNavigate();
  const [profile, setProfile] = useState({});
  const [user,    setUser]    = useState({});
  const [ads,     setAds]     = useState([]);
  const [camps,   setCamps]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    Promise.all([
      api.get('/api/influencer/profile').then(r => { setProfile(r.data.influencer); setUser(r.data.user); }),
      api.get('/api/influencer/ad-requests').then(r => setAds(Array.isArray(r.data) ? r.data : [])),
      api.get('/api/influencer/open-campaigns').then(r => { const d = r.data; setCamps(Array.isArray(d) ? d : (d.items || [])); }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height:'60vh' }}>
      <div className="is-spinner" role="status" />
    </div>
  );

  const av       = profile.profileImageUrl || null;
  const joined   = camps.filter(c => c.isAcceptedByUser).length;
  const accepted = ads.filter(a => a.status === 'accepted').length;
  const pending  = ads.filter(a => a.status === 'pending' || a.status === 'negotiation').length;

  const QUICK = [
    { Icon: Megaphone, title: 'Browse Campaigns',  desc: 'Discover open campaigns matching your niche.',   to: '/influencer/campaigns', color: '#6366F1' },
    { Icon: FileText,  title: 'My Deals',           desc: 'View and manage all your ad requests.',          to: '/influencer/deals',     color: '#C084FC' },
    { Icon: Settings,  title: 'Profile & Settings', desc: 'Update your bio, niche, reach and photo.',       to: '/influencer/settings',  color: '#22D3EE' },
  ];

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        {av
          ? <img src={av} alt="avatar" className="rounded-circle" style={{ width:52, height:52, objectFit:'cover', border:'2px solid #6366F1', boxShadow:'0 0 18px rgba(99,102,241,0.40)', flexShrink:0 }} />
          : <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width:52, height:52, background:'linear-gradient(135deg,#6366F1,#C084FC)', boxShadow:'0 0 18px rgba(99,102,241,0.40)', flexShrink:0 }}>
              <User size={24} color="#fff" strokeWidth={1.75} />
            </div>
        }
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Zap size={12} color="#22D3EE" strokeWidth={1.75} />
            <p className="mb-0" style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
              Creator Portal
            </p>
          </div>
          <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
            Welcome, <span className="is-gradient-text">{user.name || 'Creator'}</span>
          </h1>
        </div>
      </div>

      {/* Stat row */}
      <div className="row g-3 mb-4">
        {[
          { Icon: Megaphone,   label: 'Campaigns Joined',    value: joined,   color: '#6366F1' },
          { Icon: CheckCircle, label: 'Accepted Deals',      value: accepted, color: '#22D3EE' },
          { Icon: Clock,       label: 'Pending Requests',    value: pending,  color: '#C084FC' },
          { Icon: TrendingUp,  label: 'Total Reach',         value: profile.reach ? Number(profile.reach).toLocaleString() : '—', color: '#22D3EE' },
        ].map(({ Icon, label, value, color }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="is-stat-card" style={{ height:'auto' }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={16} color={color} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="is-stat-value" style={{ fontSize:'1.35rem' }}>{value}</div>
                  <div className="is-stat-label">{label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile snippet */}
      <div className="is-card p-4 mb-4 d-flex align-items-center gap-4 flex-wrap">
        <div className="d-flex gap-4 flex-wrap flex-grow-1">
          {[
            { I: Hash,  l: 'Category', v: profile.category, c: '#C084FC' },
            { I: Hash,  l: 'Niche',    v: profile.niche,    c: '#6366F1' },
            { I: Users, l: 'Reach',    v: profile.reach ? `${Number(profile.reach).toLocaleString()} followers` : '—', c: '#22D3EE' },
          ].map(({ I, l, v, c }) => (
            <div key={l}>
              <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>{l}</p>
              <p className="fw-700 mb-0 d-flex align-items-center gap-1" style={{ color:'var(--text-primary)', fontSize:'0.88rem' }}>
                <I size={12} color={c} strokeWidth={1.75} /> {v || '—'}
              </p>
            </div>
          ))}
        </div>
        <Link to="/influencer/settings" className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'7px 14px', fontSize:'0.79rem', flexShrink:0 }}>
          Edit Profile <ArrowRight size={12} strokeWidth={1.75} />
        </Link>
      </div>

      {/* Quick actions */}
      <h2 className="is-section-title" style={{ marginBottom:14 }}>Quick <span>Actions</span></h2>
      <div className="row g-3">
        {QUICK.map(({ Icon, title, desc, to, color }) => (
          <div key={title} className="col-md-4">
            <Link to={to} className="is-card-neon d-flex flex-column p-4 text-decoration-none h-100" style={{ minHeight:140 }}>
              <div style={{ width:42, height:42, borderRadius:11, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, flexShrink:0 }}>
                <Icon size={19} color={color} strokeWidth={1.75} />
              </div>
              <h6 className="fw-800 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{title}</h6>
              <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.81rem', lineHeight:1.6, flexGrow:1 }}>{desc}</p>
              <div className="d-flex align-items-center gap-1 mt-3" style={{ color:'#22D3EE', fontSize:'0.77rem', fontWeight:700 }}>
                Open <ArrowRight size={12} strokeWidth={1.75} />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
