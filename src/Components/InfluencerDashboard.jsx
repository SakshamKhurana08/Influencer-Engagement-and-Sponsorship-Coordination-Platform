import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import {
  User, Tag, Hash, Users, Pencil, Check, X,
  Sun, Moon, LogOut, Filter, CheckCircle, XCircle, Megaphone, FileText,
} from 'lucide-react';

const API = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const StatusPill = ({ status }) => {
  const map = {
    pending: 'is-pill-pending', accepted: 'is-pill-accepted',
    rejected: 'is-pill-rejected', negotiation: 'is-pill-negotiation',
  };
  return <span className={`is-pill ${map[status] || 'is-pill-pending'}`}>{status}</span>;
};

export default function InfluencerDashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profile, setProfile]   = useState({});
  const [user, setUser]         = useState({});
  const [adRequests, setAds]    = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filters, setFilters]   = useState({ category: '', minBudget: '' });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('campaigns');

  /* ── Fetch all data ── */
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([fetchProfile(), fetchAds(), fetchCampaigns()])
      .finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const r = await axios.get('/api/influencer/profile', API(token));
      setProfile(r.data.influencer); setUser(r.data.user);
      setEditData({ name: r.data.user.name, category: r.data.influencer.category, niche: r.data.influencer.niche, reach: r.data.influencer.reach });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      setError('Failed to load profile.');
    }
  };

  const fetchAds = async () => {
    try {
      const r = await axios.get('/api/influencer/ad-requests', API(token));
      setAds(Array.isArray(r.data) ? r.data : []);
    } catch { /* silently ignore */ }
  };

  const fetchCampaigns = async (f = filters) => {
    try {
      const params = {};
      if (f.category)  params.category  = f.category;
      if (f.minBudget) params.minBudget = f.minBudget;
      const r = await axios.get('/api/influencer/open-campaigns', { ...API(token), params });
      setCampaigns(Array.isArray(r.data) ? r.data : []);
    } catch { /* silently ignore */ }
  };

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.category || !editData.niche || !editData.reach) {
      setError('All fields are required.'); return;
    }
    setError(''); setSuccess('');
    try {
      await axios.put('/api/influencer/profile', editData, API(token));
      setUser(p => ({ ...p, name: editData.name }));
      setProfile(p => ({ ...p, ...editData }));
      setSuccess('Profile updated!'); setEditMode(false);
    } catch { setError('Failed to save profile.'); }
  };

  const handleAdAction = async (id, action) => {
    setError('');
    try {
      await axios.post(`/api/influencer/ad-requests/${id}/${action}`, {}, API(token));
      fetchAds();
    } catch (err) { setError(err.response?.data?.message || 'Action failed.'); }
  };

  const handleAcceptCampaign = async (campId) => {
    setError('');
    try {
      await axios.post(`/api/influencer/campaigns/${campId}/accept`, {}, API(token));
      fetchCampaigns();
    } catch (err) { setError(err.response?.data?.message || 'Failed to accept campaign.'); }
  };

  const applyFilters = () => fetchCampaigns(filters);

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('userRole'); navigate('/login'); };

  /* ── Profile image URL ── */
  const getImageUrl = () => {
    const raw = profile.profileImageUrl;
    if (!raw) return null;
    const filename = raw.split(/[\\/]/).pop();
    return `/uploads/influencer_photos/${filename}`;
  };

  if (loading) return <div className="is-spinner" />;

  return (
    <div className="is-page" style={{ minHeight: '100vh', overflowY: 'auto' }}>

      {/* ── Sticky Navbar ── */}
      <nav className="is-navbar px-4">
        <div style={{ height: 64 }} className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            {getImageUrl()
              ? <img src={getImageUrl()} alt="avatar" className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid var(--border)' }} />
              : <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'var(--brand-grad)' }}>
                  <User size={18} color="#fff" />
                </div>
            }
            <div>
              <p className="mb-0 fw-700" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</p>
              <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.65rem' }}>Influencer</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button onClick={toggleTheme} className="is-btn is-btn-ghost" style={{ width: 38, height: 38, padding: 0, borderRadius: '50%' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={logout} className="is-btn is-btn-ghost" style={{ padding: '8px 16px', color: '#ef4444', fontSize: '0.85rem' }}>
              <LogOut size={15} className="me-1" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '2rem var(--section-px)' }}>
        {/* Alerts */}
        {error   && <div className="is-pill-rejected  rounded-3 p-3 mb-3 small fw-600">{error}</div>}
        {success && <div className="is-pill-accepted  rounded-3 p-3 mb-3 small fw-600">{success}</div>}

        <div className="row g-4">

          {/* ── Left: Profile ── */}
          <div className="col-lg-3">
            <div className="is-card p-4">
              {/* Avatar */}
              <div className="text-center mb-4">
                {getImageUrl()
                  ? <img src={getImageUrl()} alt="profile" className="rounded-circle mb-3"
                      style={{ width: 88, height: 88, objectFit: 'cover', border: '3px solid var(--border)' }} />
                  : <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 88, height: 88, background: 'var(--brand-grad)' }}>
                      <User size={36} color="#fff" />
                    </div>
                }
                {!editMode && (
                  <>
                    <h5 className="fw-700 mb-1" style={{ color: 'var(--text-primary)' }}>{user.name}</h5>
                    <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      {profile.category}
                    </span>
                  </>
                )}
              </div>

              {/* Edit / View */}
              {editMode ? (
                <div>
                  {[
                    { key: 'name',     label: 'Name',     Icon: User,  type: 'text' },
                    { key: 'category', label: 'Category', Icon: Tag,   type: 'text' },
                    { key: 'niche',    label: 'Niche',    Icon: Hash,  type: 'text' },
                    { key: 'reach',    label: 'Reach',    Icon: Users, type: 'number' },
                  ].map(({ key, label, Icon, type }) => (
                    <div key={key} className="mb-3">
                      <label className="is-label">{label}</label>
                      <div className="position-relative">
                        <Icon size={14} className="position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="is-input" type={type} value={editData[key] || ''}
                          onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                          style={{ paddingLeft: 34 }} />
                      </div>
                    </div>
                  ))}
                  <div className="d-flex gap-2 mt-3">
                    <button onClick={handleSaveProfile} className="is-btn is-btn-accent flex-grow-1" style={{ padding: '9px' }}>
                      <Check size={14} className="me-1" /> Save
                    </button>
                    <button onClick={() => setEditMode(false)} className="is-btn is-btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { Icon: Hash,  label: 'Niche',   value: profile.niche },
                    { Icon: Users, label: 'Reach',   value: profile.reach ? `${Number(profile.reach).toLocaleString()}` : '—' },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="d-flex align-items-center gap-2 mb-3">
                      <Icon size={15} color="var(--text-muted)" />
                      <div>
                        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                        <p className="mb-0 fw-600" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value || '—'}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setEditMode(true)} className="is-btn is-btn-ghost w-100 mt-2" style={{ padding: '9px', fontSize: '0.85rem' }}>
                    <Pencil size={14} className="me-1" /> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="is-stat-card mt-4">
              <div className="is-stat-value">{campaigns.filter(c => c.isAcceptedByUser).length}</div>
              <div className="is-stat-label">Campaigns Joined</div>
            </div>
            <div className="is-stat-card mt-3">
              <div className="is-stat-value">{adRequests.filter(a => a.status === 'accepted').length}</div>
              <div className="is-stat-label">Accepted Deals</div>
            </div>
          </div>

          {/* ── Right: Tabs ── */}
          <div className="col-lg-9">
            {/* Tab pills */}
            <div className="d-flex gap-2 mb-4">
              {[
                { key: 'campaigns', label: `Open Campaigns (${campaigns.length})` },
                { key: 'ads',       label: `Ad Requests (${adRequests.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`is-btn ${activeTab === t.key ? 'is-btn-brand' : 'is-btn-ghost'}`}
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Campaigns Tab ── */}
            {activeTab === 'campaigns' && (
              <>
                {/* Filters */}
                <div className="is-card p-3 mb-4 d-flex flex-wrap align-items-end gap-3">
                  <div style={{ flex: '1 1 160px' }}>
                    <label className="is-label">Category</label>
                    <input className="is-input" placeholder="e.g. Fashion"
                      value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label className="is-label">Min Budget (₹)</label>
                    <input className="is-input" type="number" placeholder="10000"
                      value={filters.minBudget} onChange={e => setFilters(p => ({ ...p, minBudget: e.target.value }))} />
                  </div>
                  <button onClick={applyFilters} className="is-btn is-btn-accent" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Filter size={14} className="me-1" /> Filter
                  </button>
                  <button onClick={() => { setFilters({ category: '', minBudget: '' }); fetchCampaigns({ category: '', minBudget: '' }); }}
                    className="is-btn is-btn-ghost" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                    Clear
                  </button>
                </div>

                {/* Masonry grid */}
                {campaigns.length === 0 ? (
                  <div className="is-card p-5 text-center">
                    <div className="is-icon-box is-icon-box-lg mx-auto mb-4">
                      <Megaphone size={28} color="#fff" />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>No campaigns found. Try clearing filters.</p>
                  </div>
                ) : (
                  <div className="is-masonry">
                    {campaigns.map(c => (
                      <div key={c.id} className="is-masonry-item">
                        <div style={{
                          height: 80,
                          background: 'var(--brand-grad)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.10)', filter:'blur(20px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                          <Megaphone size={28} color="rgba(255,255,255,0.90)" strokeWidth={1.5} style={{ position:'relative', zIndex:1 }} />
                        </div>
                        <div className="p-3">
                          <h6 className="fw-700 mb-1" style={{ color: 'var(--text-primary)' }}>{c.title}</h6>
                          {c.category && (
                            <span className="is-pill mb-2" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem' }}>
                              {c.category}
                            </span>
                          )}
                          {c.description && (
                            <p className="small mt-2 mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                            </p>
                          )}
                          {c.budget && (
                            <p className="small fw-700 mb-2" style={{ color: 'var(--brand-1)' }}>₹{Number(c.budget).toLocaleString()}</p>
                          )}
                          {c.Sponsor?.companyName && (
                            <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>by {c.Sponsor.companyName}</p>
                          )}
                          {c.isAcceptedByUser
                            ? <div className="is-pill is-pill-accepted w-100 justify-content-center"><CheckCircle size={13} className="me-1" /> Joined</div>
                            : <button onClick={() => handleAcceptCampaign(c.id)} className="is-btn is-btn-accent w-100" style={{ padding: '8px', fontSize: '0.8rem' }}>
                                Accept Campaign
                              </button>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Ad Requests Tab ── */}
            {activeTab === 'ads' && (
              <div className="d-flex flex-column gap-3">
                {adRequests.length === 0 ? (
                  <div className="is-card p-5 text-center">
                    <div className="is-icon-box is-icon-box-lg mx-auto mb-4">
                      <FileText size={28} color="#fff" />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>No ad requests yet.</p>
                  </div>
                ) : (
                  adRequests.map(req => (
                    <div key={req.id} className="is-card p-4">
                      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span className="fw-700" style={{ color: 'var(--text-primary)' }}>
                              {req.Campaign?.Sponsor?.companyName || req.Campaign?.title || 'Campaign'}
                            </span>
                            <StatusPill status={req.status} />
                          </div>
                          {req.message && (
                            <p className="small mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {req.message}
                            </p>
                          )}
                          {req.proposedTerms && (
                            <div className="rounded-3 p-2 small" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              <span className="fw-600">Terms: </span>{req.proposedTerms}
                            </div>
                          )}
                        </div>

                        {req.status === 'pending' && (
                          <div className="d-flex gap-2 flex-shrink-0">
                            <button onClick={() => handleAdAction(req.id, 'accept')} className="is-btn is-btn-accent" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                              <CheckCircle size={13} className="me-1" /> Accept
                            </button>
                            <button onClick={() => handleAdAction(req.id, 'reject')} className="is-btn is-btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#ef4444' }}>
                              <XCircle size={13} className="me-1" /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
