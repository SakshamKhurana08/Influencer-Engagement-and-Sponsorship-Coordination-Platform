import { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Tag, Wallet, TrendingUp, Megaphone, Settings, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SponsorHome() {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Not authenticated.'); setLoading(false); return; }
    axios.get('/api/sponsors/details', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setSponsor(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load profile.'); setLoading(false); });
  }, []);

  if (loading) return <div className="is-spinner" />;

  if (error) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <p style={{ color: '#ef4444', fontWeight: 700 }}>{error}</p>
    </div>
  );

  const INFO_CARDS = [
    {
      Icon: Building2,
      label: 'Company',
      value: sponsor?.companyName || '—',
      grad: 'linear-gradient(135deg,#e60023,#d63384)',
    },
    {
      Icon: Tag,
      label: 'Industry',
      value: sponsor?.industry || '—',
      grad: 'linear-gradient(135deg,#d63384,#7c3aed)',
    },
    {
      Icon: Wallet,
      label: 'Campaign Budget',
      value: `₹${(sponsor?.budget || 0).toLocaleString()}`,
      grad: 'linear-gradient(135deg,#7c3aed,#0d9488)',
    },
  ];

  const ACTIONS = [
    {
      Icon: Megaphone,
      title: 'Manage Campaigns',
      desc: 'Create, edit, and send ad requests to influencers across every category.',
      to: '/sponsor-dashboard/campaign',
      grad: 'linear-gradient(135deg,#e60023,#d63384)',
    },
    {
      Icon: BarChart3,
      title: 'View Performance',
      desc: 'Track how your active campaigns are performing in real time.',
      to: '/sponsor-dashboard/campaign',
      grad: 'linear-gradient(135deg,#d63384,#7c3aed)',
    },
    {
      Icon: Settings,
      title: 'Account Settings',
      desc: 'Update your company profile, industry, and budget preferences.',
      to: '/sponsor-dashboard/settings',
      grad: 'linear-gradient(135deg,#7c3aed,#0d9488)',
    },
  ];

  return (
    <div style={{ padding: 'var(--section-py) var(--section-px)', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow-btn)' }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <p className="mb-0" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Sponsor Dashboard
          </p>
        </div>
        <h1 className="display-brand" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', color: 'var(--text-primary)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 0 }}>
          Welcome back,{' '}
          <span className="is-gradient-text">{sponsor?.companyName || 'Sponsor'}</span>
        </h1>
      </div>

      {/* ── Info stat cards ── */}
      <div className="row g-4 mb-5">
        {INFO_CARDS.map(({ Icon, label, value, grad }) => (
          <div key={label} className="col-sm-4">
            <div className="is-stat-card h-100">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 6px 20px rgba(230,0,35,0.28)' }}>
                <Icon size={20} color="#fff" />
              </div>
              <div className="is-stat-label">{label}</div>
              <div className="is-stat-value" style={{ fontSize: '1.3rem', marginTop: 6 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <h2 className="is-section-title">
        Quick <span>Actions</span>
      </h2>
      <div className="row g-4">
        {ACTIONS.map(({ Icon, title, desc, to, grad }) => (
          <div key={title} className="col-md-4">
            <Link to={to} className="is-card-neon d-flex flex-column p-4 text-decoration-none h-100" style={{ minHeight: 180 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 6px 20px rgba(230,0,35,0.28)', flexShrink: 0 }}>
                <Icon size={22} color="#fff" />
              </div>
              <h6 className="fw-800 mb-2" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{title}</h6>
              <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.6, flexGrow: 1 }}>{desc}</p>
              <div className="d-flex align-items-center gap-1 mt-3" style={{ color: 'var(--brand-1)', fontSize: '0.8rem', fontWeight: 700 }}>
                Open <ArrowRight size={13} />
              </div>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
