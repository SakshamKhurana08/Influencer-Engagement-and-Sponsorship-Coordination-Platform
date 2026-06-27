import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import {
  User, Tag, Hash, Users, Pencil, Check, X,
  Sun, Moon, LogOut, Filter, CheckCircle, XCircle,
  Megaphone, FileText, Zap, Wallet, RotateCcw,
} from 'lucide-react';

const API = () => ({});  // interceptor handles auth — kept so unused-var lint doesn't fire

const StatusPill = ({ status }) => {
  const map = {
    pending:     'is-pill-pending',
    accepted:    'is-pill-accepted',
    rejected:    'is-pill-rejected',
    negotiation: 'is-pill-negotiation',
  };
  return <span className={`is-pill ${map[status] || 'is-pill-pending'}`}>{status}</span>;
};

export default function InfluencerDashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState({});
  const [user, setUser]           = useState({});
  const [adRequests, setAds]      = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filters, setFilters]     = useState({ category: '', minBudget: '' });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [editMode, setEditMode]   = useState(false);
  const [editData, setEditData]   = useState({});
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    Promise.all([fetchProfile(), fetchAds(), fetchCampaigns()])
      .finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const r = await api.get('/api/influencer/profile');
      setProfile(r.data.influencer); setUser(r.data.user);
      setEditData({ name: r.data.user.name, category: r.data.influencer.category, niche: r.data.influencer.niche, reach: r.data.influencer.reach });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      setError('Failed to load profile.');
    }
  };

  const fetchAds = async () => {
    try {
      const r = await api.get('/api/influencer/ad-requests');
      setAds(Array.isArray(r.data) ? r.data : []);
    } catch {}
  };

  const fetchCampaigns = async (f = filters) => {
    try {
      const params = {};
      if (f.category)  params.category  = f.category;
      if (f.minBudget) params.minBudget = f.minBudget;
      const r = await api.get('/api/influencer/open-campaigns', { params });
      // API now returns paginated { items, total, page, pages }
      const data = r.data;
      setCampaigns(Array.isArray(data) ? data : (data.items || []));
    } catch { /* silently ignore */ }
  };

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.category || !editData.niche || !editData.reach) {
      setError('All fields are required.'); return;
    }
    setError(''); setSuccess('');
    try {
      await api.put('/api/influencer/profile', editData);
      setUser(p => ({ ...p, name: editData.name }));
      setProfile(p => ({ ...p, ...editData }));
      setSuccess('Profile updated!');
      setEditMode(false);
    } catch { setError('Failed to save profile.'); }
  };

  const handleAdAction = async (id, action) => {
    setError('');
    try {
      await api.post(`/api/influencer/ad-requests/${id}/${action}`, {});
      fetchAds();
    } catch (err) { setError(err.response?.data?.message || 'Action failed.'); }
  };

  const handleAcceptCampaign = async (campId) => {
    setError('');
    try {
      await api.post(`/api/influencer/campaigns/${campId}/accept`, {});
      fetchCampaigns();
    } catch (err) { setError(err.response?.data?.message || 'Failed to accept campaign.'); }
  };

  const applyFilters  = () => fetchCampaigns(filters);
  const clearFilters  = () => { setFilters({ category: '', minBudget: '' }); fetchCampaigns({ category: '', minBudget: '' }); };
  const logout        = () => { localStorage.removeItem('token'); localStorage.removeItem('userRole'); navigate('/login'); };

  const getImageUrl = () => {
    const raw = profile.profileImageUrl;
    if (!raw) return null;
    return `/uploads/influencer_photos/${raw.split(/[\\/]/).pop()}`;
  };

  if (loading) return <div className="is-spinner" />;

  const avatarUrl = getImageUrl();

  return (
    <div className="is-page" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <div className="is-page-orb-c" />

      {/* ── Sticky Navbar ── */}
      <nav className="is-navbar px-4" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="d-flex align-items-center justify-content-between" style={{ height: 64 }}>
          <div className="d-flex align-items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="rounded-circle"
                style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid var(--brand-1)', boxShadow: 'var(--brand-glow-btn)' }} />
            ) : (
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: 'var(--brand-grad)', boxShadow: 'var(--brand-glow-btn)', flexShrink: 0 }}>
                <User size={18} color="#fff" />
              </div>
            )}
            <div>
              <p className="mb-0 fw-700" style={{ color: 'var(--text-primary)', lineHeight: 1.2, fontSize: '0.9rem' }}>{user.name}</p>
              <span className="is-pill" style={{ background: 'rgba(230,0,35,0.10)', color: 'var(--brand-1)', fontSize: '0.62rem' }}>Creator</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={toggleTheme} className="is-btn is-btn-ghost" style={{ width: 38, height: 38, padding: 0, borderRadius: '50%' }}>
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button onClick={logout} className="is-btn is-btn-ghost" style={{ padding: '8px 18px', color: '#ef4444', fontSize: '0.82rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '2.5rem var(--section-px)', maxWidth: 1400, margin: '0 auto' }}>

        {/* Alerts */}
        {error   && <div className="rounded-3 p-3 mb-4 fw-700" style={{ fontSize: '0.84rem', background: 'var(--pill-rejected)', color: 'var(--pill-rejected-text)' }}>{error}</div>}
        {success && <div className="rounded-3 p-3 mb-4 fw-700" style={{ fontSize: '0.84rem', background: 'var(--pill-accepted)', color: 'var(--pill-accepted-text)' }}>{success}</div>}

        <div className="row g-4">

          {/* ── LEFT: Profile sidebar ── */}
          <div className="col-lg-3">

            {/* Profile card */}
            <div className="is-card p-4 mb-4">
              <div className="text-center mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="profile" className="rounded-circle mb-3"
                    style={{ width: 92, height: 92, objectFit: 'cover', border: '3px solid var(--brand-1)', boxShadow: 'var(--brand-glow)' }} />
                ) : (
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: 92, height: 92, background: 'var(--brand-grad)', boxShadow: 'var(--brand-glow)' }}>
                    <User size={38} color="#fff" />
                  </div>
                )}
                {!editMode && (
                  <>
                    <h5 className="fw-800 mb-1" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{user.name}</h5>
                    <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{profile.category}</span>
                  </>
                )}
              </div>

              {editMode ? (
                <div>
                  {[
                    { key: 'name',     label: 'Name',     Icon: User,  type: 'text' },
                    { key: 'category', label: 'Category', Icon: Tag,   type: 'text' },
                    { key: 'niche',    label: 'Niche',    Icon: Hash,  type: 'text' },
                    { key: 'reach',    label: 'Reach',    Icon: Users, type: 'number' },
                  ].map(({ key, label, Icon: FieldIcon, type }) => (
                    <div key={key} className="mb-3">
                      <label className="is-label">{label}</label>
                      <div className="position-relative">
                        <FieldIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="is-input" type={type} value={editData[key] || ''}
                          onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                          style={{ paddingLeft: 34 }} />
                      </div>
                    </div>
                  ))}
                  <div className="d-flex gap-2 mt-3">
                    <button onClick={handleSaveProfile} className="is-btn is-btn-brand" style={{ flex: 1, padding: '9px' }}>
                      <Check size={14} /> Save
                    </button>
                    <button onClick={() => setEditMode(false)} className="is-btn is-btn-ghost" style={{ width: 40, height: 40, padding: 0, borderRadius: '50%' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { Icon: Hash,  label: 'Niche',  value: profile.niche },
                    { Icon: Users, label: 'Reach',  value: profile.reach ? `${Number(profile.reach).toLocaleString()}` : '—' },
                  ].map(({ Icon: StatIcon, label, value }) => (
                    <div key={label} className="d-flex align-items-center gap-2 mb-3">
                      <StatIcon size={15} color="var(--text-muted)" />
                      <div>
                        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                        <p className="mb-0 fw-700" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{value || '—'}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setEditMode(true)} className="is-btn is-btn-ghost w-100 mt-2" style={{ padding: '9px', fontSize: '0.82rem' }}>
                    <Pencil size={14} /> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Mini stat cards */}
            <div className="is-stat-card mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow-btn)' }}>
                  <Megaphone size={17} color="#fff" />
                </div>
                <div>
                  <div className="is-stat-value" style={{ fontSize: '1.6rem' }}>{campaigns.filter(c => c.isAcceptedByUser).length}</div>
                  <div className="is-stat-label">Campaigns Joined</div>
                </div>
              </div>
            </div>

            <div className="is-stat-card">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#0d9488,#2dd4bf)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={17} color="#fff" strokeWidth={3} />
                </div>
                <div>
                  <div className="is-stat-value" style={{ fontSize: '1.6rem' }}>{adRequests.filter(a => a.status === 'accepted').length}</div>
                  <div className="is-stat-label">Accepted Deals</div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Main content ── */}
          <div className="col-lg-9">

            {/* Tab switcher */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {[
                { key: 'campaigns', label: 'Open Campaigns', Icon: Megaphone, count: campaigns.length },
                { key: 'ads',       label: 'Ad Requests',    Icon: FileText,  count: adRequests.length },
              ].map(({ key, label, Icon: TabIcon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`is-btn ${activeTab === key ? 'is-btn-brand' : 'is-btn-ghost'}`}
                  style={{ padding: '9px 22px', fontSize: '0.875rem' }}
                >
                  <TabIcon size={15} /> {label}
                  <span style={{
                    marginLeft: 6, padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem',
                    background: activeTab === key ? 'rgba(255,255,255,0.22)' : 'var(--bg-surface-2)',
                    color: activeTab === key ? '#fff' : 'var(--text-muted)',
                  }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Campaigns tab ── */}
            {activeTab === 'campaigns' && (
              <>
                {/* Filter bar */}
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
                  <button onClick={applyFilters} className="is-btn is-btn-brand" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Filter size={14} /> Filter
                  </button>
                  <button onClick={clearFilters} className="is-btn is-btn-ghost" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="is-card p-5 text-center">
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--brand-glow-btn)' }}>
                      <Megaphone size={26} color="#fff" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No campaigns found. Try clearing filters.</p>
                  </div>
                ) : (
                  <div className="is-masonry">
                    {campaigns.map(c => (
                      <div key={c.id} className="is-masonry-item">
                        {/* Gradient card header */}
                        <div style={{
                          height: 88,
                          background: 'var(--brand-grad)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(20px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                          <Megaphone size={32} color="rgba(255,255,255,0.92)" strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }} />
                        </div>
                        <div className="p-3 pb-4">
                          {c.category && (
                            <span className="is-pill mb-2" style={{ background: 'rgba(230,0,35,0.10)', color: 'var(--brand-1)', display: 'inline-flex' }}>
                              {c.category}
                            </span>
                          )}
                          <h6 className="fw-800 mt-2 mb-1" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{c.title}</h6>
                          {c.description && (
                            <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                              {c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                            </p>
                          )}
                          {c.budget && (
                            <p className="mb-1 fw-800" style={{ color: 'var(--brand-1)', fontSize: '0.875rem' }}>
                              <Wallet size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              ₹{Number(c.budget).toLocaleString()}
                            </p>
                          )}
                          {c.Sponsor?.companyName && (
                            <p className="mb-3" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>by {c.Sponsor.companyName}</p>
                          )}
                          {c.isAcceptedByUser ? (
                            <div className="is-pill is-pill-accepted w-100 justify-content-center" style={{ padding: '8px' }}>
                              <CheckCircle size={13} /> Joined
                            </div>
                          ) : (
                            <button onClick={() => handleAcceptCampaign(c.id)} className="is-btn is-btn-brand w-100" style={{ padding: '9px', fontSize: '0.8rem' }}>
                              Accept Campaign
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Ad Requests tab ── */}
            {activeTab === 'ads' && (
              <div className="d-flex flex-column gap-3">
                {adRequests.length === 0 ? (
                  <div className="is-card p-5 text-center">
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#d63384,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <FileText size={26} color="#fff" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No ad requests yet.</p>
                  </div>
                ) : (
                  adRequests.map(req => (
                    <div key={req.id} className="is-card p-4">
                      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span className="fw-800" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {req.Campaign?.Sponsor?.companyName || req.Campaign?.title || 'Campaign'}
                            </span>
                            <StatusPill status={req.status} />
                          </div>
                          {req.message && (
                            <p className="mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.875rem' }}>
                              {req.message}
                            </p>
                          )}
                          {req.proposedTerms && (
                            <div className="rounded-3 p-2" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <span className="fw-700">Terms: </span>{req.proposedTerms}
                            </div>
                          )}
                        </div>
                        {req.status === 'pending' && (
                          <div className="d-flex gap-2 flex-shrink-0">
                            <button onClick={() => handleAdAction(req.id, 'accept')} className="is-btn is-btn-brand" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button onClick={() => handleAdAction(req.id, 'reject')} className="is-btn is-btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#ef4444' }}>
                              <XCircle size={13} /> Decline
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
