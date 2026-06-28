import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { Building2, Tag, Wallet, Megaphone, Settings, ArrowRight, Zap, BarChart3, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SponsorHome() {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/api/sponsors/details')
      .then(r => { setSponsor(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load profile.'); setLoading(false); });
  }, []);

  if (loading) return <div className="is-spinner-wrap"><div className="is-spinner" role="status" /></div>;
  if (error)   return <div className="is-spinner-wrap"><p style={{ color:'#f87171', fontWeight:700 }}>{error}</p></div>;

  const INFO_CARDS = [
    { Icon: Building2,  label: 'Company',        value: sponsor?.companyName || '—',                    color: '#5B58EB' },
    { Icon: Tag,        label: 'Industry',        value: sponsor?.industry || '—',                       color: '#BB63FF' },
    { Icon: Wallet,     label: 'Campaign Budget', value: `₹${(sponsor?.budget || 0).toLocaleString()}`, color: '#56E1E9' },
  ];

  const ACTIONS = [
    { Icon: Megaphone, title: 'Manage Campaigns', desc: 'Create, edit, and send ad requests to influencers across every category.',          to: '/sponsor-dashboard/campaign', color: '#5B58EB' },
    { Icon: BarChart3,  title: 'View Performance', desc: 'Track how your active campaigns are performing with live analytics.',              to: '/sponsor-dashboard/campaign', color: '#BB63FF' },
    { Icon: Settings,   title: 'Account Settings', desc: 'Update your company profile, industry, and campaign budget preferences.',         to: '/sponsor-dashboard/settings', color: '#56E1E9' },
  ];

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Zap size={12} color="#56E1E9" strokeWidth={1.75} />
          <p className="mb-0" style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
            Sponsor Dashboard
          </p>
        </div>
        <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.7rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          Welcome back,{' '}
          <span className="is-gradient-text">{sponsor?.companyName || 'Sponsor'}</span>
        </h1>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        {INFO_CARDS.map(({ Icon, label, value, color }) => (
          <div key={label} className="col-sm-4">
            <div className="is-stat-card">
              <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, flexShrink:0 }}>
                <Icon size={18} color={color} strokeWidth={1.75} />
              </div>
              <div className="is-stat-label">{label}</div>
              <div className="is-stat-value" style={{ fontSize:'1.15rem', marginTop:4 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="is-section-title" style={{ marginBottom:16 }}>Quick <span>Actions</span></h2>
      <div className="row g-3">
        {ACTIONS.map(({ Icon, title, desc, to, color }) => (
          <div key={title} className="col-md-4">
            <Link to={to} className="is-card-neon d-flex flex-column p-4 text-decoration-none h-100" style={{ minHeight:152 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, flexShrink:0 }}>
                <Icon size={20} color={color} strokeWidth={1.75} />
              </div>
              <h6 className="fw-800 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{title}</h6>
              <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.81rem', lineHeight:1.6, flexGrow:1 }}>{desc}</p>
              <div className="d-flex align-items-center gap-1 mt-3" style={{ color:'#56E1E9', fontSize:'0.77rem', fontWeight:700 }}>
                Open <ArrowRight size={12} strokeWidth={1.75} />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
