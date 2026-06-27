import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  X, Send, Users, Megaphone, Wallet,
} from 'lucide-react';

const API = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
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
  const token = localStorage.getItem('token');

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
      const r = await axios.get('/api/campaign/my-campaigns', API(token));
      setCampaigns(r.data || []);
    } catch { setError('Failed to load campaigns.'); }
  };

  const fetchAds = async (id) => {
    try {
      const r = await axios.get(`/api/campaign/${id}/ad-requests`, API(token));
      setCampaignAds(p => ({ ...p, [id]: r.data || [] }));
    } catch {}
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCampaignSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingCampId)
        await axios.put(`/api/campaign/${editingCampId}`, campForm, API(token));
      else
        await axios.post('/api/campaign/', campForm, API(token));
      await fetchCampaigns();
      setShowForm(false); setCampForm(EMPTY_CAMP); setEditingCampId(null);
    } catch { setError('Failed to save campaign.'); }
    finally { setSaving(false); }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try { await axios.delete(`/api/campaign/${id}`, API(token)); await fetchCampaigns(); }
    catch { setError('Failed to delete campaign.'); }
  };

  const startEditCamp = (c) => {
    setCampForm({ title: c.title, description: c.description, category: c.category, budget: c.budget, isPublic: c.isPublic });
    setEditingCampId(c.id);
    setShowForm(true);
  };

  const handleAdSubmit = async (e, campaignId) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingAdId)
        await axios.put(`/api/campaign/ad-request/${editingAdId}`, adForm, API(token));
      else
        await axios.post(`/api/campaign/${campaignId}/ad-request`, adForm, API(token));
      await fetchAds(campaignId);
      setAdForm(EMPTY_AD); setEditingAdId(null); setShowAdForm(null);
    } catch { setError('Failed to save ad request.'); }
    finally { setSaving(false); }
  };

  const deleteAd = async (adId, campId) => {
    if (!window.confirm('Delete this ad request?')) return;
    try { await axios.delete(`/api/campaign/ad-request/${adId}`, API(token)); await fetchAds(campId); }
    catch { setError('Failed to delete ad request.'); }
  };

  const startEditAd = (ad, campId) => {
    setAdForm({ message: ad.message, proposedTerms: ad.proposedTerms });
    setEditingAdId(ad.id);
    setShowAdForm(campId);
  };

  const toggleExpand = (id) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next) fetchAds(next);
  };

  const EmptyState = () => (
    <div className="is-card p-5 text-center">
      <div
        className="mx-auto mb-4 d-flex align-items-center justify-content-center"
        style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--brand-grad)',
          boxShadow: 'var(--brand-glow-btn)',
        }}
      >
        <Megaphone size={28} color="#fff" />
      </div>
      <h6 className="fw-800 mb-2" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
        No campaigns yet
      </h6>
      <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Create your first campaign to start connecting with influencers.
      </p>
      <button onClick={() => setShowForm(true)} className="is-btn is-btn-brand">
        <Plus size={16} /> New Campaign
      </button>
    </div>
  );

  return (
    <div style={{ padding: 'var(--section-py) var(--section-px)', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Sponsor Portal
          </p>
          <h1
            className="display-brand mb-0"
            style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', color: 'var(--text-primary)', fontWeight: 900, letterSpacing: '-0.03em' }}
          >
            Manage Campaigns
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setCampForm(EMPTY_CAMP); setEditingCampId(null); }}
          className="is-btn is-btn-brand"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {error && (
        <div className="rounded-3 p-3 mb-4 fw-700" style={{ fontSize: '0.84rem', background: 'var(--pill-rejected)', color: 'var(--pill-rejected-text)' }}>
          {error}
        </div>
      )}

      {/* ── Campaign Form ── */}
      {showForm && (
        <div className="is-card p-4 mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-800 mb-0" style={{ color: 'var(--text-primary)' }}>
              {editingCampId ? 'Edit Campaign' : 'New Campaign'}
            </h5>
            <button onClick={() => setShowForm(false)} className="is-btn is-btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}>
              <X size={16} />
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
            <div className="d-flex gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="is-btn is-btn-ghost" style={{ padding: '10px 24px' }}>
                Cancel
              </button>
              <button type="submit" className="is-btn is-btn-brand" style={{ padding: '10px 32px' }} disabled={saving}>
                {saving ? 'Saving…' : editingCampId ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Campaign list or empty state ── */}
      {campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="d-flex flex-column gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="is-card">

              {/* Card header — clickable to expand */}
              <div
                className="d-flex align-items-start justify-content-between p-4"
                onClick={() => toggleExpand(c.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex-grow-1 me-3">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <h5 className="fw-800 mb-0" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{c.title}</h5>
                    {c.category && (
                      <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        {c.category}
                      </span>
                    )}
                    <span className={`is-pill ${c.isPublic ? 'is-pill-accepted' : 'is-pill-rejected'}`}>
                      {c.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.875rem' }}>
                      {c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description}
                    </p>
                  )}
                  <div className="d-flex gap-4 flex-wrap align-items-center">
                    {c.budget && (
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-1)' }}>
                        <Wallet size={13} /> ₹{Number(c.budget).toLocaleString()}
                      </span>
                    )}
                    {c.acceptedInfluencers?.length > 0 && (
                      <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>
                        <Users size={13} />
                        {c.acceptedInfluencers.length} influencer{c.acceptedInfluencers.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); startEditCamp(c); }}
                    className="is-btn is-btn-ghost"
                    style={{ width: 34, height: 34, padding: 0, borderRadius: '50%' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteCampaign(c.id); }}
                    className="is-btn is-btn-ghost"
                    style={{ width: 34, height: 34, padding: 0, borderRadius: '50%', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                  {expandedId === c.id
                    ? <ChevronUp size={18} color="var(--text-muted)" />
                    : <ChevronDown size={18} color="var(--text-muted)" />
                  }
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
                          <span key={inf.influencerId} className="is-pill is-pill-accepted">
                            {inf.influencerName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <p className="is-label mb-0">Ad Requests</p>
                      <button
                        onClick={() => { setShowAdForm(c.id); setAdForm(EMPTY_AD); setEditingAdId(null); }}
                        className="is-btn is-btn-ghost"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <Send size={13} /> Send Request
                      </button>
                    </div>

                    {showAdForm === c.id && (
                      <div
                        className="rounded-3 p-4 mb-4"
                        style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}
                      >
                        <form onSubmit={e => handleAdSubmit(e, c.id)}>
                          <div className="row g-3">
                            <div className="col-12">
                              <FormField label="Message">
                                <textarea className="is-input" rows={2}
                                  placeholder="Describe what you need from the influencer…"
                                  value={adForm.message}
                                  onChange={e => setAdForm(p => ({ ...p, message: e.target.value }))}
                                  style={{ resize: 'vertical' }} required />
                              </FormField>
                            </div>
                            <div className="col-12">
                              <FormField label="Proposed Terms">
                                <textarea className="is-input" rows={2}
                                  placeholder="Compensation, deliverables, timeline…"
                                  value={adForm.proposedTerms}
                                  onChange={e => setAdForm(p => ({ ...p, proposedTerms: e.target.value }))}
                                  style={{ resize: 'vertical' }} />
                              </FormField>
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => { setShowAdForm(null); setEditingAdId(null); }}
                              className="is-btn is-btn-ghost"
                              style={{ padding: '8px 16px' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="is-btn is-btn-brand"
                              style={{ padding: '8px 20px' }}
                              disabled={saving}
                            >
                              {saving ? 'Saving…' : editingAdId ? 'Update' : 'Send'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {(campaignAds[c.id] || []).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No ad requests sent yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {campaignAds[c.id].map(ad => (
                          <div
                            key={ad.id}
                            className="d-flex align-items-start justify-content-between gap-3 rounded-3 p-3"
                            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}
                          >
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <StatusPill status={ad.status} />
                              </div>
                              <p className="mb-1 fw-600" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                {ad.message}
                              </p>
                              {ad.proposedTerms && (
                                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  Terms: {ad.proposedTerms}
                                </p>
                              )}
                            </div>
                            <div className="d-flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => startEditAd(ad, c.id)}
                                className="is-btn is-btn-ghost"
                                style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => deleteAd(ad.id, c.id)}
                                className="is-btn is-btn-ghost"
                                style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', color: '#ef4444' }}
                              >
                                <Trash2 size={13} />
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
