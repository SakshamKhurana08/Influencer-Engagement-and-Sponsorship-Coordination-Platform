import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Megaphone, Filter, RotateCcw, Wallet, CheckCircle } from 'lucide-react';

export default function InfluencerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [filters,   setFilters]   = useState({ category: '', minBudget: '' });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const fetch = (f = filters) => {
    const params = {};
    if (f.category)  params.category  = f.category;
    if (f.minBudget) params.minBudget = f.minBudget;
    setLoading(true);
    api.get('/api/influencer/open-campaigns', { params })
      .then(r => { const d = r.data; setCampaigns(Array.isArray(d) ? d : (d.items || [])); })
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const accept = async (id) => {
    setError(''); setSuccess('');
    try {
      await api.post(`/api/influencer/campaigns/${id}/accept`, {});
      setSuccess('Campaign joined!');
      fetch();
    } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
  };

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>
      <div className="mb-4">
        <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Creator Portal</p>
        <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          Browse <span className="is-gradient-text">Campaigns</span>
        </h1>
      </div>

      {error   && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-rejected)',  color:'var(--pill-rejected-text)'  }}>{error}</div>}
      {success && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-accepted)', color:'var(--pill-accepted-text)' }}>{success}</div>}

      {/* Filters */}
      <div className="is-card p-3 mb-4 d-flex flex-wrap align-items-end gap-3">
        <div style={{ flex:'1 1 150px' }}>
          <label className="is-label">Category</label>
          <input className="is-input" placeholder="e.g. Fashion"
            value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} />
        </div>
        <div style={{ flex:'1 1 130px' }}>
          <label className="is-label">Min Budget (₹)</label>
          <input className="is-input" type="number" placeholder="10000"
            value={filters.minBudget} onChange={e => setFilters(p => ({ ...p, minBudget: e.target.value }))} />
        </div>
        <button onClick={() => fetch(filters)} className="is-btn is-btn-brand" style={{ padding:'9px 16px', fontSize:'0.83rem' }}>
          <Filter size={13} strokeWidth={1.75} /> Filter
        </button>
        <button onClick={() => { setFilters({ category:'', minBudget:'' }); fetch({ category:'', minBudget:'' }); }}
          className="is-btn is-btn-ghost" style={{ padding:'9px 13px', fontSize:'0.83rem' }}>
          <RotateCcw size={12} strokeWidth={1.75} /> Clear
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="is-spinner" role="status" /></div>
      ) : campaigns.length === 0 ? (
        <div className="is-card p-5 is-empty">
          <div style={{ width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 6px 20px rgba(99,102,241,0.40)' }}>
            <Megaphone size={24} color="#fff" strokeWidth={1.75} />
          </div>
          <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No campaigns found. Try clearing filters.</p>
        </div>
      ) : (
        <div className="is-camp-grid">
          {campaigns.map(c => (
            <div key={c.id} className="is-camp-card">
              <div className="is-camp-card-header" style={{ background:'linear-gradient(145deg,#091e48,#1a2e80)' }}>
                <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(99,102,241,0.25)', filter:'blur(30px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                <Megaphone size={30} color="rgba(34,211,238,0.90)" strokeWidth={1.5} style={{ position:'relative', zIndex:1 }} />
              </div>
              <div className="is-camp-card-body">
                {c.category && <span className="is-pill mb-1 d-inline-flex" style={{ background:'rgba(192,132,252,0.14)', color:'#C084FC' }}>{c.category}</span>}
                <h6 className="fw-800 mt-1 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{c.title}</h6>
                {c.description && <p className="mb-1" style={{ color:'var(--text-secondary)', fontSize:'0.77rem', lineHeight:1.5 }}>{c.description.length>70 ? c.description.slice(0,70)+'…' : c.description}</p>}
                {c.budget && <p className="mb-1 fw-800" style={{ color:'#22D3EE', fontSize:'0.82rem' }}><Wallet size={11} strokeWidth={1.75} style={{ marginRight:3, verticalAlign:'middle' }} />₹{Number(c.budget).toLocaleString()}</p>}
                {c.Sponsor?.companyName && <p className="mb-2" style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>by {c.Sponsor.companyName}</p>}
                {c.isAcceptedByUser
                  ? <div className="is-pill is-pill-accepted w-100 justify-content-center" style={{ padding:'7px', marginTop:'auto' }}><CheckCircle size={11} strokeWidth={1.75} /> Joined</div>
                  : <button onClick={() => accept(c.id)} className="is-btn is-btn-brand w-100" style={{ padding:'8px', fontSize:'0.79rem', marginTop:'auto' }}>Join Campaign</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
