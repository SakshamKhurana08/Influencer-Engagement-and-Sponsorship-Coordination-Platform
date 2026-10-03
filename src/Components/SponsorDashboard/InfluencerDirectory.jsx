/**
 * InfluencerDirectory
 *
 * Sponsors can:
 *  1. Browse all active influencers with search + filters
 *  2. Expand a card to see full profile details
 *  3. Send a direct ad request to any influencer
 */
import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  Users, Search, Filter, RotateCcw, TrendingUp, Hash,
  ChevronDown, ChevronUp, Send, X, Megaphone,
} from 'lucide-react';

export default function InfluencerDirectory() {
  const [influencers, setInfluencers] = useState([]);
  const [campaigns,   setCampaigns]   = useState([]);
  const [filters,     setFilters]     = useState({ category: '', minReach: '', maxReach: '', search: '' });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, pages: 1 });
  const [expandedId,  setExpandedId]  = useState(null);
  const [requestId,   setRequestId]   = useState(null);
  const [form,        setForm]        = useState({ campaignId: '', message: '', proposedTerms: '' });
  const [sending,     setSending]     = useState(false);

  const load = (f = filters, page = 1) => {
    setLoading(true);
    const params = { page };
    if (f.category)  params.category  = f.category;
    if (f.minReach)  params.minReach  = f.minReach;
    if (f.maxReach)  params.maxReach  = f.maxReach;
    if (f.search)    params.search    = f.search;

    api.get('/api/sponsors/influencers', { params })
      .then(r => {
        const d = r.data;
        setInfluencers(Array.isArray(d) ? d : (d.items || []));
        setPagination({ total: d.total || 0, page: d.page || 1, pages: d.pages || 1 });
      })
      .catch(() => setError('Failed to load influencers.'))
      .finally(() => setLoading(false));
  };

  const loadCampaigns = () => {
    api.get('/api/campaign/my-campaigns', { params: { per_page: 50 } })
      .then(r => setCampaigns(r.data?.items || []))
      .catch(() => {});
  };

  useEffect(() => { load(); loadCampaigns(); }, []);

  const applyFilters = () => load(filters, 1);
  const clearFilters = () => {
    const empty = { category: '', minReach: '', maxReach: '', search: '' };
    setFilters(empty);
    load(empty, 1);
  };

  const toggleExpand = (id) => {
    setExpandedId(p => p === id ? null : id);
    setRequestId(null);
    setForm({ campaignId: '', message: '', proposedTerms: '' });
  };

  const openRequestForm = (influencerId) => {
    setRequestId(influencerId);
    setForm({ campaignId: campaigns[0]?.id?.toString() || '', message: '', proposedTerms: '' });
    setError(''); setSuccess('');
  };

  const sendRequest = async (influencerId) => {
    if (!form.campaignId) { setError('Please select a campaign.'); return; }
    if (!form.message.trim()) { setError('Please write a message.'); return; }
    setError(''); setSending(true);
    try {
      await api.post(`/api/campaign/${form.campaignId}/ad-request`, {
        influencerId,
        message: form.message.trim(),
        proposedTerms: form.proposedTerms.trim(),
      });
      setSuccess('Ad request sent successfully!');
      setRequestId(null);
      setForm({ campaignId: '', message: '', proposedTerms: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Users size={12} color="#22D3EE" strokeWidth={1.75} />
          <p className="mb-0" style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Sponsor Portal
          </p>
        </div>
        <h1 className="display-brand mb-1" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', color: 'var(--text-primary)', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Find <span className="is-gradient-text">Influencers</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0, maxWidth: 520 }}>
          Browse creators by category, niche, or reach. Send a direct ad request to get the partnership started.
        </p>
      </div>

      {error   && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize: '0.82rem', background: 'var(--pill-rejected)',  color: 'var(--pill-rejected-text)'  }}>{error}</div>}
      {success && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize: '0.82rem', background: 'var(--pill-accepted)', color: 'var(--pill-accepted-text)' }}>{success}</div>}

      {/* Filters */}
      <div className="is-card p-3 mb-4 d-flex flex-wrap align-items-end gap-3">
        <div style={{ flex: '2 1 180px' }}>
          <label className="is-label">Search by name</label>
          <input className="is-input" placeholder="e.g. Priya"
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && applyFilters()} />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="is-label">Category</label>
          <input className="is-input" placeholder="e.g. Fashion"
            value={filters.category}
            onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} />
        </div>
        <div style={{ flex: '1 1 110px' }}>
          <label className="is-label">Min Reach</label>
          <input className="is-input" type="number" placeholder="10000"
            value={filters.minReach}
            onChange={e => setFilters(p => ({ ...p, minReach: e.target.value }))} />
        </div>
        <div style={{ flex: '1 1 110px' }}>
          <label className="is-label">Max Reach</label>
          <input className="is-input" type="number" placeholder="500000"
            value={filters.maxReach}
            onChange={e => setFilters(p => ({ ...p, maxReach: e.target.value }))} />
        </div>
        <button onClick={applyFilters} className="is-btn is-btn-brand" style={{ padding: '9px 16px', fontSize: '0.83rem' }}>
          <Filter size={13} strokeWidth={1.75} /> Filter
        </button>
        <button onClick={clearFilters} className="is-btn is-btn-ghost" style={{ padding: '9px 13px', fontSize: '0.83rem' }}>
          <RotateCcw size={12} strokeWidth={1.75} /> Clear
        </button>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.80rem', marginBottom: 12 }}>
          {pagination.total} influencer{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="is-spinner" role="status" /></div>
      ) : influencers.length === 0 ? (
        <div className="is-card p-5 is-empty">
          <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg,#6366F1,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(99,102,241,0.40)' }}>
            <Search size={24} color="#fff" strokeWidth={1.75} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No influencers found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {influencers.map(inf => {
            const isExpanded   = expandedId  === inf.id;
            const isRequesting = requestId   === inf.id;

            return (
              <div key={inf.id} className="is-card" style={{ overflow: 'hidden' }}>

                {/* Card header */}
                <div className="d-flex align-items-center justify-content-between p-4 flex-wrap gap-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleExpand(inf.id)}>

                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    {inf.profileImageUrl
                      ? <img src={inf.profileImageUrl} alt={inf.name}
                          className="rounded-circle" style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(99,102,241,0.40)' }} />
                      : <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6366F1,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                            {inf.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                    }
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="fw-800" style={{ color: 'var(--text-primary)', fontSize: '0.93rem' }}>{inf.name}</span>
                        {inf.category && <span className="is-pill" style={{ background: 'rgba(192,132,252,0.14)', color: '#C084FC' }}>{inf.category}</span>}
                        {inf.niche    && <span className="is-pill" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{inf.niche}</span>}
                      </div>
                      {inf.reach && (
                        <span style={{ fontSize: '0.80rem', color: '#22D3EE', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TrendingUp size={11} strokeWidth={1.75} /> {Number(inf.reach).toLocaleString()} followers
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); openRequestForm(inf.id); setExpandedId(inf.id); }}
                      className="is-btn is-btn-brand"
                      style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                      <Send size={12} strokeWidth={1.75} /> Send Request
                    </button>
                    {isExpanded
                      ? <ChevronUp size={17} color="var(--text-muted)" strokeWidth={1.75} />
                      : <ChevronDown size={17} color="var(--text-muted)" strokeWidth={1.75} />}
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-glass)', padding: '20px 24px 24px' }}>

                    <div className="d-flex flex-wrap gap-4 mb-4">
                      {inf.category && (
                        <div>
                          <p style={{ fontSize: '0.60rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-muted)', marginBottom: 3 }}>Category</p>
                          <p className="fw-700 mb-0 d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                            <Hash size={12} color="#C084FC" strokeWidth={1.75} /> {inf.category}
                          </p>
                        </div>
                      )}
                      {inf.niche && (
                        <div>
                          <p style={{ fontSize: '0.60rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-muted)', marginBottom: 3 }}>Niche</p>
                          <p className="fw-700 mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{inf.niche}</p>
                        </div>
                      )}
                      {inf.reach && (
                        <div>
                          <p style={{ fontSize: '0.60rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-muted)', marginBottom: 3 }}>Reach</p>
                          <p className="fw-700 mb-0" style={{ color: '#22D3EE', fontSize: '0.86rem' }}>{Number(inf.reach).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Request form */}
                    {isRequesting && (
                      <div className="rounded-3 p-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h6 className="fw-800 mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.90rem' }}>
                            Send Ad Request to {inf.name}
                          </h6>
                          <button onClick={() => setRequestId(null)} className="is-btn is-btn-ghost"
                            style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}>
                            <X size={13} strokeWidth={1.75} />
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="is-label">Campaign *</label>
                          {campaigns.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              No campaigns yet. <a href="/sponsor-dashboard/campaign" style={{ color: '#6366F1' }}>Create one first.</a>
                            </p>
                          ) : (
                            <select className="is-input" value={form.campaignId}
                              onChange={e => setForm(p => ({ ...p, campaignId: e.target.value }))}>
                              <option value="">Select a campaign...</option>
                              {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="is-label">Message *</label>
                          <textarea className="is-input" rows={3}
                            placeholder="Introduce your campaign and why this influencer is a great fit..."
                            value={form.message}
                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                            style={{ resize: 'vertical' }} />
                        </div>

                        <div className="mb-3">
                          <label className="is-label">Proposed Terms <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                          <textarea className="is-input" rows={2}
                            placeholder="e.g. 2 posts + 1 reel, budget 20000..."
                            value={form.proposedTerms}
                            onChange={e => setForm(p => ({ ...p, proposedTerms: e.target.value }))}
                            style={{ resize: 'vertical' }} />
                        </div>

                        <button onClick={() => sendRequest(inf.id)} disabled={sending || campaigns.length === 0}
                          className="is-btn is-btn-brand" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
                          <Megaphone size={13} strokeWidth={1.75} /> {sending ? 'Sending...' : 'Send Request'}
                        </button>
                      </div>
                    )}

                    {!isRequesting && (
                      <button onClick={() => openRequestForm(inf.id)} className="is-btn is-btn-ghost"
                        style={{ padding: '8px 18px', fontSize: '0.84rem', color: '#C084FC' }}>
                        <Send size={13} strokeWidth={1.75} /> Send Ad Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button disabled={pagination.page <= 1}
            onClick={() => load(filters, pagination.page - 1)}
            className="is-btn is-btn-ghost" style={{ padding: '7px 16px', fontSize: '0.83rem' }}>
            Prev
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem', display: 'flex', alignItems: 'center' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button disabled={pagination.page >= pagination.pages}
            onClick={() => load(filters, pagination.page + 1)}
            className="is-btn is-btn-ghost" style={{ padding: '7px 16px', fontSize: '0.83rem' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
