import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { FileText, Check, X, Pencil, CheckCircle, XCircle } from 'lucide-react';

const StatusPill = ({ status }) => {
  const map = { pending:'is-pill-pending', accepted:'is-pill-accepted', rejected:'is-pill-rejected', negotiation:'is-pill-negotiation' };
  return <span className={`is-pill ${map[status]||'is-pill-pending'}`}>{status}</span>;
};

export default function InfluencerDeals() {
  const [ads,           setAds]           = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [counterTerms,  setCounterTerms]  = useState('');
  const [filter,        setFilter]        = useState('all');

  const load = () => {
    api.get('/api/influencer/ad-requests')
      .then(r => setAds(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Failed to load deals.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const action = async (id, act) => {
    setError(''); setSuccess('');
    try { await api.post(`/api/influencer/ad-requests/${id}/${act}`, {}); setSuccess(`Request ${act}ed.`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Action failed.'); }
  };

  const negotiate = async (id) => {
    if (!counterTerms.trim()) { setError('Enter counter-offer terms.'); return; }
    setError('');
    try {
      await api.post(`/api/influencer/ad-requests/${id}/negotiate`, { counterTerms });
      setNegotiatingId(null); setCounterTerms(''); setSuccess('Counter-offer sent.'); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const FILTERS = ['all', 'pending', 'negotiation', 'accepted', 'rejected'];
  const displayed = filter === 'all' ? ads : ads.filter(a => a.status === filter);

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>
      <div className="mb-4">
        <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Creator Portal</p>
        <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          My <span className="is-gradient-text">Deals</span>
        </h1>
      </div>

      {error   && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-rejected)',  color:'var(--pill-rejected-text)'  }}>{error}</div>}
      {success && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-accepted)', color:'var(--pill-accepted-text)' }}>{success}</div>}

      {/* Status filter tabs */}
      <div className="is-tabs mb-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`is-tab${filter===f?' active':''}`}
            style={{ textTransform:'capitalize' }}>
            {f}
            {f !== 'all' && <span style={{ marginLeft:5, padding:'1px 7px', borderRadius:999, fontSize:'0.64rem', background: filter===f?'rgba(255,255,255,0.18)':'rgba(99,102,241,0.12)', color: filter===f?'#fff':'var(--text-muted)' }}>{ads.filter(a=>a.status===f).length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="is-spinner" role="status" /></div>
      ) : displayed.length === 0 ? (
        <div className="is-card p-5 is-empty">
          <div style={{ width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#C084FC,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 6px 20px rgba(192,132,252,0.40)' }}>
            <FileText size={24} color="#fff" strokeWidth={1.75} />
          </div>
          <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No {filter === 'all' ? '' : filter} deals yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {displayed.map(req => (
            <div key={req.id} className="is-card p-4">
              <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <span className="fw-800" style={{ color:'var(--text-primary)', fontSize:'0.91rem' }}>
                      {req.Campaign?.Sponsor?.companyName || req.Campaign?.title || 'Campaign'}
                    </span>
                    <StatusPill status={req.status} />
                    {req.Campaign?.title && (
                      <span style={{ color:'var(--text-muted)', fontSize:'0.77rem' }}>— {req.Campaign.title}</span>
                    )}
                  </div>

                  {req.message && (
                    <p className="mb-2" style={{ color:'var(--text-secondary)', lineHeight:1.55, fontSize:'0.85rem' }}>{req.message}</p>
                  )}
                  {req.proposedTerms && (
                    <div className="rounded-3 p-2 mb-2" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)', fontSize:'0.80rem', color:'var(--text-secondary)' }}>
                      <span className="fw-700" style={{ color:'#22D3EE' }}>Terms: </span>{req.proposedTerms}
                    </div>
                  )}

                  {/* Counter-offer form */}
                  {negotiatingId === req.id && (
                    <div className="mt-2 rounded-3 p-3" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)' }}>
                      <label className="is-label mb-2">Your Counter-Offer</label>
                      <textarea className="is-input mb-2" rows={2} placeholder="Describe your revised terms…"
                        value={counterTerms} onChange={e => setCounterTerms(e.target.value)} style={{ resize:'vertical' }} />
                      <div className="d-flex gap-2">
                        <button onClick={() => negotiate(req.id)} className="is-btn is-btn-brand" style={{ padding:'6px 14px', fontSize:'0.78rem' }}>
                          <Check size={12} strokeWidth={1.75} /> Send
                        </button>
                        <button onClick={() => { setNegotiatingId(null); setCounterTerms(''); }} className="is-btn is-btn-ghost" style={{ padding:'6px 11px', fontSize:'0.78rem' }}>
                          <X size={12} strokeWidth={1.75} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons — only for pending/negotiation */}
                {(req.status === 'pending' || req.status === 'negotiation') && negotiatingId !== req.id && (
                  <div className="d-flex gap-2 flex-shrink-0 flex-wrap">
                    <button onClick={() => action(req.id, 'accept')} className="is-btn is-btn-brand" style={{ padding:'7px 14px', fontSize:'0.80rem' }}>
                      <CheckCircle size={12} strokeWidth={1.75} /> Accept
                    </button>
                    <button onClick={() => { setNegotiatingId(req.id); setCounterTerms(''); }}
                      className="is-btn is-btn-ghost" style={{ padding:'7px 13px', fontSize:'0.80rem', color:'#C084FC' }}>
                      <Pencil size={12} strokeWidth={1.75} /> Negotiate
                    </button>
                    <button onClick={() => action(req.id, 'reject')} className="is-btn is-btn-ghost" style={{ padding:'7px 13px', fontSize:'0.80rem', color:'#f87171' }}>
                      <XCircle size={12} strokeWidth={1.75} /> Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
