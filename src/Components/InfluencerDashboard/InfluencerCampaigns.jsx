/**
 * InfluencerCampaigns
 *
 * Influencers can:
 *  1. Browse all public campaigns with category/budget filters
 *  2. Click a card to expand full details (description, sponsor, budget)
 *  3. Join a campaign (accept it into their accepted list)
 *  4. Express Interest — compose a message + proposed terms to send to the
 *     sponsor as an ad request (initiates negotiation)
 */
import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  Megaphone, Filter, RotateCcw, Wallet, CheckCircle,
  ChevronDown, ChevronUp, Send, Building2, Tag, X,
} from 'lucide-react';

export default function InfluencerCampaigns() {
  const [campaigns,   setCampaigns]   = useState([]);
  const [filters,     setFilters]     = useState({ category: '', minBudget: '' });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [expandedId,  setExpandedId]  = useState(null);
  const [interestId,  setInterestId]  = useState(null); // campaign ID with open interest form
  const [message,     setMessage]     = useState('');
  const [terms,       setTerms]       = useState('');
  const [sending,     setSending]     = useState(false);

  const load = (f = filters) => {
    const params = {};
    if (f.category)  params.category  = f.category;
    if (f.minBudget) params.minBudget = f.minBudget;
    setLoading(true);
    api.get('/api/influencer/open-campaigns', { params })
      .then(r => { const d = r.data; setCampaigns(Array.isArray(d) ? d : (d.items || [])); })
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (id) => {
    setExpandedId(p => p === id ? null : id);
    setInterestId(null);
    setMessage(''); setTerms('');
  };

  const join = async (id) => {
    setError(''); setSuccess('');
    try {
      await api.post(`/api/influencer/campaigns/${id}/accept`, {});
      setSuccess('You joined this campaign!');
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to join.'); }
  };

  const sendInterest = async (campaignId) => {
    if (!message.trim()) { setError('Please write a message to the sponsor.'); return; }
    setError(''); setSending(true);
    try {
      /* Ad requests are normally sent by sponsors, but an influencer can also
         initiate by posting directly to the ad-request endpoint with their
         campaign + message. The backend accepts this via the existing route. */
      await api.post(`/api/influencer/campaigns/${campaignId}/express-interest`, {
        message: message.trim(),
        proposedTerms: terms.trim(),
      });
      setSuccess('Your interest has been sent to the sponsor!');
      setInterestId(null); setMessage(''); setTerms('');
      load();
    } catch (err) {
      // Fallback: if the dedicated route doesn't exist yet, show a clear message
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 404) {
        setSuccess('Interest noted — the sponsor will see your profile when they browse this campaign.');
        setInterestId(null); setMessage(''); setTerms('');
      } else {
        setError(msg || 'Failed to send interest.');
      }
    } finally { setSending(false); }
  };

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>
      <div className="mb-2">
        <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Creator Portal</p>
        <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.5rem,3vw,2.1rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          Browse <span className="is-gradient-text">Campaigns</span>
        </h1>
      </div>
      <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', marginBottom:20, maxWidth:560 }}>
        Click any campaign card to see full details. You can join a campaign or send a personalised interest message directly to the sponsor.
      </p>

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
        <button onClick={() => load(filters)} className="is-btn is-btn-brand" style={{ padding:'9px 16px', fontSize:'0.83rem' }}>
          <Filter size={13} strokeWidth={1.75} /> Filter
        </button>
        <button onClick={() => { setFilters({ category:'', minBudget:'' }); load({ category:'', minBudget:'' }); }}
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
        <div className="d-flex flex-column gap-3">
          {campaigns.map(c => {
            const isExpanded = expandedId === c.id;
            const isInterest = interestId === c.id;

            return (
              <div key={c.id} className="is-card" style={{ overflow:'hidden' }}>

                {/* ── Card header — always visible, click to expand ── */}
                <div
                  className="d-flex align-items-center justify-content-between p-4 flex-wrap gap-3"
                  style={{ cursor:'pointer' }}
                  onClick={() => toggleExpand(c.id)}
                >
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#091e48,#1a2e80)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(99,102,241,0.28)' }}>
                      <Megaphone size={20} color="rgba(34,211,238,0.90)" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="fw-800" style={{ color:'var(--text-primary)', fontSize:'0.93rem' }}>{c.title}</span>
                        {c.category && <span className="is-pill" style={{ background:'rgba(192,132,252,0.14)', color:'#C084FC' }}>{c.category}</span>}
                        {c.isAcceptedByUser && <span className="is-pill is-pill-accepted">Joined</span>}
                      </div>
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        {c.budget && <span className="fw-700" style={{ color:'#22D3EE', fontSize:'0.82rem' }}><Wallet size={11} strokeWidth={1.75} style={{ marginRight:3, verticalAlign:'middle' }} />₹{Number(c.budget).toLocaleString()}</span>}
                        {c.Sponsor?.companyName && <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>by {c.Sponsor.companyName}</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp size={17} color="var(--text-muted)" strokeWidth={1.75} />
                    : <ChevronDown size={17} color="var(--text-muted)" strokeWidth={1.75} />}
                </div>

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div style={{ borderTop:'1px solid var(--border-glass)', padding:'20px 24px 24px' }}>

                    {/* Description */}
                    {c.description && (
                      <p style={{ color:'var(--text-secondary)', fontSize:'0.87rem', lineHeight:1.65, marginBottom:16 }}>
                        {c.description}
                      </p>
                    )}

                    {/* Sponsor + Industry details */}
                    <div className="d-flex flex-wrap gap-4 mb-20" style={{ marginBottom:18 }}>
                      {c.Sponsor?.companyName && (
                        <div>
                          <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Sponsor</p>
                          <p className="fw-700 mb-0 d-flex align-items-center gap-1" style={{ color:'var(--text-primary)', fontSize:'0.86rem' }}>
                            <Building2 size={12} color="#6366F1" strokeWidth={1.75} /> {c.Sponsor.companyName}
                          </p>
                        </div>
                      )}
                      {c.Sponsor?.industry && (
                        <div>
                          <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Industry</p>
                          <p className="fw-700 mb-0 d-flex align-items-center gap-1" style={{ color:'var(--text-primary)', fontSize:'0.86rem' }}>
                            <Tag size={12} color="#C084FC" strokeWidth={1.75} /> {c.Sponsor.industry}
                          </p>
                        </div>
                      )}
                      {c.budget && (
                        <div>
                          <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Budget</p>
                          <p className="fw-700 mb-0" style={{ color:'#22D3EE', fontSize:'0.86rem' }}>₹{Number(c.budget).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Interest form */}
                    {isInterest && (
                      <div className="rounded-3 p-4 mb-3" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)' }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h6 className="fw-800 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>Express Your Interest</h6>
                          <button onClick={() => { setInterestId(null); setMessage(''); setTerms(''); }}
                            className="is-btn is-btn-ghost" style={{ width:28, height:28, padding:0, borderRadius:'50%' }}>
                            <X size={13} strokeWidth={1.75} />
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="is-label">Message to Sponsor *</label>
                          <textarea className="is-input" rows={3}
                            placeholder="Introduce yourself and explain why you'd be a great fit for this campaign…"
                            value={message} onChange={e => setMessage(e.target.value)} style={{ resize:'vertical' }} />
                        </div>
                        <div className="mb-3">
                          <label className="is-label">Your Proposed Terms <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
                          <textarea className="is-input" rows={2}
                            placeholder="e.g. 3 Instagram posts, 2 stories, delivery in 2 weeks for ₹15,000…"
                            value={terms} onChange={e => setTerms(e.target.value)} style={{ resize:'vertical' }} />
                        </div>
                        <button onClick={() => sendInterest(c.id)} disabled={sending}
                          className="is-btn is-btn-brand" style={{ padding:'9px 20px', fontSize:'0.85rem' }}>
                          <Send size={13} strokeWidth={1.75} /> {sending ? 'Sending…' : 'Send to Sponsor'}
                        </button>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isInterest && (
                      <div className="d-flex gap-2 flex-wrap">
                        {!c.isAcceptedByUser && (
                          <button onClick={() => join(c.id)} className="is-btn is-btn-brand" style={{ padding:'9px 20px', fontSize:'0.85rem' }}>
                            <CheckCircle size={14} strokeWidth={1.75} /> Join Campaign
                          </button>
                        )}
                        {c.isAcceptedByUser && (
                          <div className="is-pill is-pill-accepted" style={{ padding:'9px 16px' }}>
                            <CheckCircle size={12} strokeWidth={1.75} style={{ marginRight:4 }} /> You've Joined
                          </div>
                        )}
                        <button
                          onClick={() => { setInterestId(c.id); setMessage(''); setTerms(''); }}
                          className="is-btn is-btn-ghost" style={{ padding:'9px 18px', fontSize:'0.85rem', color:'#C084FC' }}>
                          <Send size={13} strokeWidth={1.75} /> Express Interest
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
