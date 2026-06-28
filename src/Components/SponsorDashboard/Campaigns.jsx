import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  X, Send, Users, Megaphone, Wallet, Zap,
} from 'lucide-react';

const EMPTY_CAMP = { title: '', description: '', category: '', budget: '', isPublic: true };
const EMPTY_AD   = { message: '', proposedTerms: '' };

const StatusPill = ({ status }) => {
  const cls = {
    pending:     'is-pill-pending',
    accepted:    'is-pill-accepted',
    rejected:    'is-pill-rejected',
    negotiation: 'is-pill-negotiation',
  }[status] || 'is-pill-pending';
  return <span className={`is-pill ${cls}`}>{status}</span>;
};

const FormField = ({ label, children }) => (
  <div className="mb-3">
    <label className="is-label">{label}</label>
    {children}
  </div>
);

export default function Campaigns() {
  const [campaigns, setCampaigns]         = useState([]);
  const [expandedId, setExpandedId]       = useState(null);
  const [campaignAds, setCampaignAds]     = useState({});
  const [showForm, setShowForm]           = useState(false);
  const [campForm, setCampForm]           = useState(EMPTY_CAMP);
  const [editingCampId, setEditingCampId] = useState(null);
  const [adForm, setAdForm]               = useState(EMPTY_AD);
  const [editingAdId, setEditingAdId]     = useState(null);
  const [showAdForm, setShowAdForm]       = useState(null);
  const [error, setError]                 = useState('');
  const [saving, setSaving]               = useState(false);

  const fetchCampaigns = async () => {
    try {
      const r = await api.get('/api/campaign/my-campaigns');
      const data = r.data;
      setCampaigns(Array.isArray(data) ? data : (data.items || []));
    } catch { setError('Failed to load campaigns.'); }
  };

  const fetchAds = async (id) => {
    try {
      const r = await api.get(`/api/campaign/${id}/ad-requests`);
      const data = r.data;
      setCampaignAds(p => ({ ...p, [id]: Array.isArray(data) ? data : (data.items || []) }));
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCampaignSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingCampId) await api.put(`/api/campaign/${editingCampId}`, campForm);
      else               await api.post('/api/campaign/', campForm);
      await fetchCampaigns();
      setShowForm(false); setCampForm(EMPTY_CAMP); setEditingCampId(null);
    } catch { setError('Failed to save campaign.'); }
    finally { setSaving(false); }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try { await api.delete(`/api/campaign/${id}`); await fetchCampaigns(); }
    catch { setError('Failed to delete campaign.'); }
  };

  const startEditCamp = (c) => {
    setCampForm({ title: c.title, description: c.description, category: c.category, budget: c.budget, isPublic: c.isPublic });
    setEditingCampId(c.id); setShowForm(true);
  };

  const handleAdSubmit = async (e, campaignId) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingAdId) await api.put(`/api/campaign/ad-request/${editingAdId}`, adForm);
      else             await api.post(`/api/campaign/${campaignId}/ad-request`, adForm);
      await fetchAds(campaignId);
      setAdForm(EMPTY_AD); setEditingAdId(null); setShowAdForm(null);
    } catch { setError('Failed to save ad request.'); }
    finally { setSaving(false); }
  };

  const deleteAd = async (adId, campId) => {
    if (!window.confirm('Delete this ad request?')) return;
    try { await api.delete(`/api/campaign/ad-request/${adId}`); await fetchAds(campId); }
    catch { setError('Failed to delete ad request.'); }
  };

  const startEditAd = (ad, campId) => {
    setAdForm({ message: ad.message, proposedTerms: ad.proposedTerms });
    setEditingAdId(ad.id); setShowAdForm(campId);
  };

  const toggleExpand = (id) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next) fetchAds(next);
  };

  return (
    <div style={{ padding: '1.75rem var(--section-px)' }}>

      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
            Sponsor Portal
          </p>
          <h1 className="display-brand mb-0" style={{ fontSize: 'clamp(1.8rem,3.8vw,2.6rem)', color: 'var(--text-primary)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Manage Campaigns
          </h1>
        </div>
        <button onClick={() => { setShowForm(true); setCampForm(EMPTY_CAMP); setEditingCampId(null); }} className="is-btn is-btn-brand">
          <Plus size={16} strokeWidth={1.75} /> New Campaign
        </button>
      </div>

      {error && <div className="is-pill-rejected rounded-3 p-3 mb-4 small fw-600">{error}</div>}

      {/* Campaign form */}
      {showForm && (
        <div className="is-card p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-800 mb-0" style={{ color: 'var(--text-primary)' }}>
              {editingCampId ? 'Edit Campaign' : 'New Campaign'}
            </h5>
            <button onClick={() => setShowForm(false)} className="is-btn is-btn-ghost" style={{ width: 34, height: 34, padding: 0, borderRadius: '50%' }}>
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
          <form onSubmit={handleCampaignSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <FormField label="Title">
                  <input className="is-input" placeholder="Campaign Title" required
                    value={campForm.title} onChange={e => setCampForm(p => ({ ...p, title: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-md-6">
                <FormField label="Category">
                  <input className="is-input" placeholder="e.g. Fashion, Tech"
                    value={campForm.category} onChange={e => setCampForm(p => ({ ...p, category: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-md-6">
                <FormField label="Budget (₹)">
                  <input className="is-input" type="number" min="0" placeholder="50000"
                    value={campForm.budget} onChange={e => setCampForm(p => ({ ...p, budget: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-md-6 d-flex align-items-end pb-3">
                <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={campForm.isPublic}
                    onChange={e => setCampForm(p => ({ ...p, isPublic: e.target.checked }))}
                    style={{ accentColor: 'var(--brand-1)', width: 16, height: 16 }} />
                  <span className="fw-600" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Publicly visible to influencers
                  </span>
                </label>
              </div>
              <div className="col-12">
                <FormField label="Description">
                  <textarea className="is-input" rows={3} placeholder="Describe your campaign goals…"
                    value={campForm.description} onChange={e => setCampForm(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </FormField>
              </div>
            </div>
            <div className="d-flex gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="is-btn is-btn-ghost" style={{ padding: '9px 20px' }}>Cancel</button>
              <button type="submit" className="is-btn is-btn-brand" style={{ padding: '9px 28px' }} disabled={saving}>
                {saving ? 'Saving…' : editingCampId ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div className="is-card p-5 text-center is-empty">
          <div className="is-icon-box is-icon-box-lg mx-auto mb-3" style={{ boxShadow: 'var(--brand-glow-btn)' }}>
            <Megaphone size={28} color="#fff" strokeWidth={1.75} />
          </div>
          <h6 className="fw-800 mb-2" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>No campaigns yet</h6>
          <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create your first campaign to start connecting with influencers.
          </p>
          <button onClick={() => setShowForm(true)} className="is-btn is-btn-brand"><Plus size={16} strokeWidth={1.75} /> New Campaign</button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {campaigns.map(c => (
            <div key={c.id} className="is-card">
              {/* Card header */}
              <div className="d-flex align-items-start justify-content-between p-4" onClick={() => toggleExpand(c.id)} style={{ cursor: 'pointer' }}>
                <div className="flex-grow-1 me-3">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <h5 className="fw-800 mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.97rem' }}>{c.title}</h5>
                    {c.category && <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{c.category}</span>}
                    <span className={`is-pill ${c.isPublic ? 'is-pill-accepted' : 'is-pill-rejected'}`}>
                      {c.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.86rem' }}>
                      {c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description}
                    </p>
                  )}
                  <div className="d-flex gap-4 flex-wrap align-items-center">
                    {c.budget && (
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-1)' }}>
                        <Wallet size={13} strokeWidth={1.75} /> ₹{Number(c.budget).toLocaleString()}
                      </span>
                    )}
                    {c.acceptedInfluencers?.length > 0 && (
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>
                        <Users size={13} strokeWidth={1.75} /> {c.acceptedInfluencers.length} influencer{c.acceptedInfluencers.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); startEditCamp(c); }} className="is-btn is-btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}>
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteCampaign(c.id); }} className="is-btn is-btn-ghost" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', color: '#ef4444' }}>
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                  {expandedId === c.id
                    ? <ChevronUp size={17} color="var(--text-muted)" strokeWidth={1.75} />
                    : <ChevronDown size={17} color="var(--text-muted)" strokeWidth={1.75} />}
                </div>
              </div>

              {/* Expanded panel */}
              {expandedId === c.id && (
                <div style={{ borderTop: '1px solid var(--border-glass)' }}>
                  {c.acceptedInfluencers?.length > 0 && (
                    <div className="px-4 pt-4">
                      <p className="is-label mb-2">Accepted Influencers</p>
                      <div className="d-flex flex-wrap gap-2">
                        {c.acceptedInfluencers.map(inf => (
                          <span key={inf.influencerId} className="is-pill is-pill-accepted">{inf.influencerName}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-700 mb-3" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>Ad Requests</h6>
                      <button onClick={() => { setShowAdForm(c.id); setAdForm(EMPTY_AD); setEditingAdId(null); }} className="is-btn is-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.80rem' }}>
                        <Send size={13} strokeWidth={1.75} /> Send Request
                      </button>
                    </div>
                    {showAdForm === c.id && (
                      <div className="rounded-3 p-3 mb-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}>
                        <form onSubmit={e => handleAdSubmit(e, c.id)}>
                          <div className="row g-3">
                            <div className="col-12">
                              <FormField label="Message">
                                <textarea className="is-input" rows={2} placeholder="Describe what you need from the influencer…"
                                  value={adForm.message} onChange={e => setAdForm(p => ({ ...p, message: e.target.value }))}
                                  style={{ resize: 'vertical' }} required />
                              </FormField>
                            </div>
                            <div className="col-12">
                              <FormField label="Proposed Terms">
                                <textarea className="is-input" rows={2} placeholder="Compensation, deliverables, timeline…"
                                  value={adForm.proposedTerms} onChange={e => setAdForm(p => ({ ...p, proposedTerms: e.target.value }))}
                                  style={{ resize: 'vertical' }} />
                              </FormField>
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-1">
                            <button type="button" onClick={() => { setShowAdForm(null); setEditingAdId(null); }} className="is-btn is-btn-ghost" style={{ padding: '7px 14px' }}>Cancel</button>
                            <button type="submit" className="is-btn is-btn-brand" style={{ padding: '7px 18px' }} disabled={saving}>
                              {saving ? 'Saving…' : editingAdId ? 'Update' : 'Send'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    {(campaignAds[c.id] || []).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No ad requests sent yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {campaignAds[c.id].map(ad => (
                          <div key={ad.id} className="d-flex align-items-start justify-content-between gap-3 rounded-3 p-3"
                            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <StatusPill status={ad.status} />
                              </div>
                              <p className="mb-1 fw-600" style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{ad.message}</p>
                              {ad.proposedTerms && (
                                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.80rem' }}>Terms: {ad.proposedTerms}</p>
                              )}
                            </div>
                            <div className="d-flex gap-1 flex-shrink-0">
                              <button onClick={() => startEditAd(ad, c.id)} className="is-btn is-btn-ghost" style={{ width: 30, height: 30, padding: 0, borderRadius: '50%' }}>
                                <Pencil size={12} strokeWidth={1.75} />
                              </button>
                              <button onClick={() => deleteAd(ad.id, c.id)} className="is-btn is-btn-ghost" style={{ width: 30, height: 30, padding: 0, borderRadius: '50%', color: '#ef4444' }}>
                                <Trash2 size={12} strokeWidth={1.75} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
