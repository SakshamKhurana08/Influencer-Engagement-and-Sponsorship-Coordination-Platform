/**
 * SponsorRequests — dedicated page for all influencer-initiated ad requests.
 *
 * Sponsors can:
 *  - See every request across all their campaigns in one place
 *  - Filter by status (all / pending / negotiation / accepted / rejected)
 *  - Accept a request
 *  - Reject a request
 *  - Counter-offer (negotiate) with revised terms
 */
import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  FileText, CheckCircle2, XCircle, MessageSquare,
  User, Hash, TrendingUp, Megaphone, Check, X, Zap,
} from 'lucide-react';

const StatusPill = ({ status }) => {
  const map = {
    pending:     'is-pill-pending',
    accepted:    'is-pill-accepted',
    rejected:    'is-pill-rejected',
    negotiation: 'is-pill-negotiation',
  };
  return <span className={`is-pill ${map[status] || 'is-pill-pending'}`}>{status}</span>;
};

const FILTERS = ['all', 'pending', 'negotiation', 'accepted', 'rejected'];

export default function SponsorRequests() {
  const [requests,      setRequests]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [filter,        setFilter]        = useState('all');
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [counterTerms,  setCounterTerms]  = useState('');
  const [saving,        setSaving]        = useState(false);

  const load = (status = 'all') => {
    setLoading(true);
    const params = status !== 'all' ? { status } : {};
    api.get('/api/sponsors/requests', { params })
      .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Failed to load requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, action, extra = {}) => {
    setError(''); setSaving(true);
    try {
      await api.post(`/api/sponsors/requests/${id}/respond`, { action, ...extra });
      setSuccess(`Request ${action}ed successfully.`);
      setNegotiatingId(null); setCounterTerms('');
      load(filter);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request.`);
    } finally { setSaving(false); }
  };

  const handleFilter = (f) => {
    setFilter(f);
    load(f);
  };

  const displayed = requests; // filtering done server-side

  /* count by status for tab badges */
  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1; return acc;
  }, {});

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Zap size={12} color="#22D3EE" strokeWidth={1.75} />
          <p className="mb-0" style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
            Sponsor Portal
          </p>
        </div>
        <h1 className="display-brand mb-1" style={{ fontSize:'clamp(1.8rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          Influencer <span className="is-gradient-text">Requests</span>
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', margin:0, maxWidth:520 }}>
          Influencers who expressed interest in your campaigns appear here. Review their profile and terms, then accept, reject, or negotiate.
        </p>
      </div>

      {error   && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-rejected)',  color:'var(--pill-rejected-text)'  }}>{error}</div>}
      {success && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-accepted)', color:'var(--pill-accepted-text)' }}>{success}</div>}

      {/* Status filter tabs */}
      <div className="is-tabs mb-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilter(f)}
            className={`is-tab${filter === f ? ' active' : ''}`}
            style={{ textTransform:'capitalize' }}>
            {f}
            {f !== 'all' && counts[f] > 0 && (
              <span style={{ marginLeft:5, padding:'1px 7px', borderRadius:999, fontSize:'0.64rem',
                background: filter===f ? 'rgba(255,255,255,0.18)' : 'rgba(99,102,241,0.12)',
                color: filter===f ? '#fff' : 'var(--text-muted)' }}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="is-spinner" role="status" /></div>
      ) : displayed.length === 0 ? (
        <div className="is-card p-5 is-empty">
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#C084FC,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(192,132,252,0.35)' }}>
            <FileText size={26} color="#fff" strokeWidth={1.75} />
          </div>
          <p style={{ color:'var(--text-muted)', fontWeight:600 }}>
            No {filter === 'all' ? '' : filter} requests yet.
          </p>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', maxWidth:320, marginInline:'auto' }}>
            When influencers express interest in your campaigns, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {displayed.map(req => (
            <div key={req.id} className="is-card p-4">
              <div className="d-flex align-items-start gap-4 flex-wrap">

                {/* ── Influencer avatar + info ── */}
                <div className="d-flex align-items-start gap-3 flex-grow-1">
                  {req.influencer?.profileImageUrl
                    ? <img src={req.influencer.profileImageUrl} alt={req.influencer.name}
                        className="rounded-circle" style={{ width:48, height:48, objectFit:'cover', flexShrink:0, border:'2px solid rgba(99,102,241,0.40)' }} />
                    : <div style={{ width:48, height:48, borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg,#6366F1,#C084FC)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow:'0 0 16px rgba(99,102,241,0.35)' }}>
                        <User size={22} color="#fff" strokeWidth={1.75} />
                      </div>
                  }

                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Name + status */}
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="fw-800" style={{ color:'var(--text-primary)', fontSize:'0.93rem' }}>
                        {req.influencer?.name || 'Influencer'}
                      </span>
                      <StatusPill status={req.status} />
                    </div>

                    {/* Influencer stats */}
                    <div className="d-flex flex-wrap gap-3 mb-2">
                      {req.influencer?.category && (
                        <span style={{ fontSize:'0.77rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                          <Hash size={11} strokeWidth={1.75} color="#C084FC" /> {req.influencer.category}
                        </span>
                      )}
                      {req.influencer?.niche && (
                        <span style={{ fontSize:'0.77rem', color:'var(--text-secondary)' }}>
                          {req.influencer.niche}
                        </span>
                      )}
                      {req.influencer?.reach && (
                        <span style={{ fontSize:'0.77rem', color:'#22D3EE', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                          <TrendingUp size={11} strokeWidth={1.75} /> {Number(req.influencer.reach).toLocaleString()} followers
                        </span>
                      )}
                    </div>

                    {/* Campaign */}
                    {req.Campaign?.title && (
                      <div className="d-flex align-items-center gap-1 mb-2" style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                        <Megaphone size={11} strokeWidth={1.75} />
                        <span>Campaign: <strong style={{ color:'var(--text-secondary)' }}>{req.Campaign.title}</strong></span>
                      </div>
                    )}

                    {/* Message */}
                    {req.message && (
                      <p className="mb-2" style={{ color:'var(--text-secondary)', fontSize:'0.86rem', lineHeight:1.60 }}>
                        {req.message}
                      </p>
                    )}

                    {/* Proposed terms */}
                    {req.proposedTerms && (
                      <div className="rounded-3 p-2 mb-2" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)', fontSize:'0.81rem', color:'var(--text-secondary)' }}>
                        <span className="fw-700" style={{ color:'#22D3EE' }}>Proposed Terms: </span>
                        {req.proposedTerms}
                      </div>
                    )}

                    {/* Negotiate form */}
                    {negotiatingId === req.id && (
                      <div className="rounded-3 p-3 mt-2" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)' }}>
                        <label className="is-label mb-2">Your Counter-Offer Terms</label>
                        <textarea className="is-input mb-2" rows={2}
                          placeholder="Describe your revised terms — budget, deliverables, timeline…"
                          value={counterTerms} onChange={e => setCounterTerms(e.target.value)}
                          style={{ resize:'vertical' }} />
                        <div className="d-flex gap-2">
                          <button onClick={() => respond(req.id, 'negotiate', { counterTerms })}
                            disabled={saving || !counterTerms.trim()}
                            className="is-btn is-btn-brand" style={{ padding:'6px 14px', fontSize:'0.80rem' }}>
                            <Check size={12} strokeWidth={1.75} /> Send Counter-Offer
                          </button>
                          <button onClick={() => { setNegotiatingId(null); setCounterTerms(''); }}
                            className="is-btn is-btn-ghost" style={{ padding:'6px 11px', fontSize:'0.80rem' }}>
                            <X size={12} strokeWidth={1.75} /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Action buttons ── */}
                {(req.status === 'pending' || req.status === 'negotiation') && negotiatingId !== req.id && (
                  <div className="d-flex flex-column gap-2 flex-shrink-0">
                    <button onClick={() => respond(req.id, 'accept')} disabled={saving}
                      className="is-btn is-btn-brand" style={{ padding:'8px 18px', fontSize:'0.83rem', width:'100%' }}>
                      <CheckCircle2 size={13} strokeWidth={1.75} /> Accept
                    </button>
                    <button onClick={() => { setNegotiatingId(req.id); setCounterTerms(''); }}
                      className="is-btn is-btn-ghost" style={{ padding:'8px 16px', fontSize:'0.83rem', color:'#C084FC', width:'100%' }}>
                      <MessageSquare size={13} strokeWidth={1.75} /> Negotiate
                    </button>
                    <button onClick={() => respond(req.id, 'reject')} disabled={saving}
                      className="is-btn is-btn-ghost" style={{ padding:'8px 16px', fontSize:'0.83rem', color:'#f87171', width:'100%' }}>
                      <XCircle size={13} strokeWidth={1.75} /> Decline
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div className="is-pill is-pill-accepted flex-shrink-0" style={{ padding:'8px 14px', alignSelf:'flex-start' }}>
                    <CheckCircle2 size={12} strokeWidth={1.75} style={{ marginRight:4 }} /> Accepted
                  </div>
                )}
                {req.status === 'rejected' && (
                  <div className="is-pill is-pill-rejected flex-shrink-0" style={{ padding:'8px 14px', alignSelf:'flex-start' }}>
                    <XCircle size={12} strokeWidth={1.75} style={{ marginRight:4 }} /> Declined
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
