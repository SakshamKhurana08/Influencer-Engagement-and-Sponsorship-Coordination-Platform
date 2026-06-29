import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  User, Tag, Hash, Users, Pencil, Check, X, Filter,
  CheckCircle, XCircle, Megaphone, FileText, Zap, Wallet, RotateCcw,
} from 'lucide-react';
import Sidebar from './SponsorDashboard/Sidebar';

const StatusPill = ({ status }) => {
  const map = { pending:'is-pill-pending', accepted:'is-pill-accepted', rejected:'is-pill-rejected', negotiation:'is-pill-negotiation' };
  return <span className={`is-pill ${map[status]||'is-pill-pending'}`}>{status}</span>;
};

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile]             = useState({});
  const [user, setUser]                   = useState({});
  const [adRequests, setAds]              = useState([]);
  const [campaigns, setCampaigns]         = useState([]);
  const [filters, setFilters]             = useState({ category:'', minBudget:'' });
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [editMode, setEditMode]           = useState(false);
  const [editData, setEditData]           = useState({});
  const [activeTab, setActiveTab]         = useState('campaigns');
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [counterTerms, setCounterTerms]   = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    Promise.all([fetchProfile(), fetchAds(), fetchCampaigns()]).finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const r = await api.get('/api/influencer/profile');
      setProfile(r.data.influencer); setUser(r.data.user);
      setEditData({ name:r.data.user.name, category:r.data.influencer.category, niche:r.data.influencer.niche, reach:r.data.influencer.reach });
    } catch (err) { if (err.response?.status===401) navigate('/login'); setError('Failed to load profile.'); }
  };

  const fetchAds = async () => {
    try { const r = await api.get('/api/influencer/ad-requests'); setAds(Array.isArray(r.data)?r.data:[]); } catch {}
  };

  const fetchCampaigns = async (f=filters) => {
    try {
      const params = {}; if (f.category) params.category=f.category; if (f.minBudget) params.minBudget=f.minBudget;
      const r = await api.get('/api/influencer/open-campaigns',{params});
      const d = r.data; setCampaigns(Array.isArray(d)?d:(d.items||[]));
    } catch {}
  };

  const saveProfile = async () => {
    if (!editData.name||!editData.category||!editData.niche||!editData.reach){setError('All fields required.');return;}
    setError(''); setSuccess('');
    try {
      await api.put('/api/influencer/profile',editData);
      setUser(p=>({...p,name:editData.name})); setProfile(p=>({...p,...editData}));
      setSuccess('Profile updated.'); setEditMode(false);
    } catch { setError('Failed to save profile.'); }
  };

  const handleAdAction = async (id,action) => {
    setError('');
    try { await api.post(`/api/influencer/ad-requests/${id}/${action}`,{}); fetchAds(); }
    catch(err){ setError(err.response?.data?.message||'Action failed.'); }
  };

  const handleNegotiate = async id => {
    if(!counterTerms.trim()){setError('Enter counter-offer terms.');return;}
    setError('');
    try { await api.post(`/api/influencer/ad-requests/${id}/negotiate`,{counterTerms}); setNegotiatingId(null); setCounterTerms(''); setSuccess('Counter-offer sent.'); fetchAds(); }
    catch(err){ setError(err.response?.data?.message||'Failed.'); }
  };

  const acceptCampaign = async id => {
    setError('');
    try { await api.post(`/api/influencer/campaigns/${id}/accept`,{}); fetchCampaigns(); }
    catch(err){ setError(err.response?.data?.message||'Failed.'); }
  };

  const applyFilters = () => fetchCampaigns(filters);
  const clearFilters = () => { setFilters({category:'',minBudget:''}); fetchCampaigns({category:'',minBudget:''}); };
  // profileImageUrl is now a base64 data URI — use it directly as <img src>
  const avatarUrl = () => profile.profileImageUrl || null;

  if (loading) return (
    <div style={{ minHeight:'100vh' }}>
      <Sidebar />
      <main className="is-dash-main d-flex align-items-center justify-content-center">
        <div className="is-spinner" role="status" />
      </main>
    </div>
  );

  const av = avatarUrl();

  return (
    <div style={{ minHeight:'100vh' }}>
      <Sidebar />
      <main className="is-dash-main">
        <div style={{ padding:'1.75rem var(--section-px)' }}>

          {error   && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-rejected)', color:'var(--pill-rejected-text)' }}>{error}</div>}
          {success && <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background:'var(--pill-accepted)', color:'var(--pill-accepted-text)' }}>{success}</div>}

          <div className="row g-4">
            {/* Profile sidebar */}
            <div className="col-lg-3">
              <div className="is-card p-4 mb-3">
                <div className="text-center mb-3">
                  {av
                    ? <img src={av} alt="profile" className="rounded-circle mb-3" style={{ width:80, height:80, objectFit:'cover', border:'2px solid #6366F1', boxShadow:'0 0 20px rgba(99,102,241,0.40)' }} />
                    : <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width:80, height:80, background:'linear-gradient(135deg,#6366F1,#C084FC)', boxShadow:'0 0 20px rgba(99,102,241,0.40)' }}>
                        <User size={32} color="#fff" strokeWidth={1.75} />
                      </div>
                  }
                  {!editMode && (
                    <>
                      <h6 className="fw-800 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.94rem' }}>{user.name}</h6>
                      <span style={{ padding:'2px 10px', borderRadius:999, background:'rgba(34,211,238,0.12)', color:'#22D3EE', fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.07em', textTransform:'uppercase' }}>
                        {profile.category}
                      </span>
                    </>
                  )}
                </div>

                {editMode ? (
                  <div>
                    {[{k:'name',l:'Name',I:User},{k:'category',l:'Category',I:Tag},{k:'niche',l:'Niche',I:Hash},{k:'reach',l:'Reach',I:Users,t:'number'}].map(({k,l,I,t='text'}) => (
                      <div key={k} className="mb-2">
                        <label className="is-label">{l}</label>
                        <div className="position-relative">
                          <I size={13} strokeWidth={1.75} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                          <input className="is-input" type={t} value={editData[k]||''} onChange={e=>setEditData(p=>({...p,[k]:e.target.value}))} style={{ paddingLeft:30 }} />
                        </div>
                      </div>
                    ))}
                    <div className="d-flex gap-2 mt-3">
                      <button onClick={saveProfile} className="is-btn is-btn-brand" style={{ flex:1, padding:'8px' }}><Check size={13} strokeWidth={1.75} /> Save</button>
                      <button onClick={()=>setEditMode(false)} className="is-btn is-btn-ghost" style={{ width:36, height:36, padding:0, borderRadius:'50%' }}><X size={13} strokeWidth={1.75} /></button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {[{I:Hash,l:'Niche',v:profile.niche,c:'#C084FC'},{I:Users,l:'Reach',v:profile.reach?Number(profile.reach).toLocaleString():'—',c:'#22D3EE'}].map(({I,l,v,c})=>(
                      <div key={l} className="d-flex align-items-center gap-2 mb-3">
                        <I size={13} color={c} strokeWidth={1.75} />
                        <div>
                          <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.09em' }}>{l}</p>
                          <p className="mb-0 fw-700" style={{ color:'var(--text-primary)', fontSize:'0.84rem' }}>{v||'—'}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setEditMode(true)} className="is-btn is-btn-ghost w-100 mt-1" style={{ padding:'8px', fontSize:'0.80rem' }}>
                      <Pencil size={12} strokeWidth={1.75} /> Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Mini stats */}
              <div className="is-stat-card mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.18)', border:'1px solid rgba(99,102,241,0.28)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Megaphone size={15} color="#6366F1" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="is-stat-value" style={{ fontSize:'1.45rem' }}>{campaigns.filter(c=>c.isAcceptedByUser).length}</div>
                    <div className="is-stat-label">Campaigns Joined</div>
                  </div>
                </div>
              </div>
              <div className="is-stat-card">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width:34, height:34, borderRadius:10, background:'rgba(34,211,238,0.15)', border:'1px solid rgba(34,211,238,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Check size={15} color="#22D3EE" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="is-stat-value" style={{ fontSize:'1.45rem' }}>{adRequests.filter(a=>a.status==='accepted').length}</div>
                    <div className="is-stat-label">Accepted Deals</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="col-lg-9">
              <div className="is-tabs mb-4">
                {[
                  { key:'campaigns', l:'Open Campaigns', I:Megaphone, n:campaigns.length },
                  { key:'ads',       l:'Ad Requests',    I:FileText,  n:adRequests.length },
                ].map(({ key,l,I,n }) => (
                  <button key={key} onClick={()=>setActiveTab(key)} className={`is-tab${activeTab===key?' active':''}`}>
                    <I size={13} strokeWidth={1.75} /> {l}
                    <span style={{ marginLeft:5, padding:'1px 7px', borderRadius:999, fontSize:'0.64rem', background: activeTab===key?'rgba(255,255,255,0.18)':'rgba(99,102,241,0.12)', color: activeTab===key?'#fff':'var(--text-muted)' }}>{n}</span>
                  </button>
                ))}
              </div>

              {/* Campaigns */}
              {activeTab==='campaigns' && (
                <>
                  <div className="is-card p-3 mb-3 d-flex flex-wrap align-items-end gap-3">
                    <div style={{ flex:'1 1 140px' }}>
                      <label className="is-label">Category</label>
                      <input className="is-input" placeholder="e.g. Fashion" value={filters.category} onChange={e=>setFilters(p=>({...p,category:e.target.value}))} />
                    </div>
                    <div style={{ flex:'1 1 120px' }}>
                      <label className="is-label">Min Budget (₹)</label>
                      <input className="is-input" type="number" placeholder="10000" value={filters.minBudget} onChange={e=>setFilters(p=>({...p,minBudget:e.target.value}))} />
                    </div>
                    <button onClick={applyFilters} className="is-btn is-btn-brand" style={{ padding:'9px 16px', fontSize:'0.83rem' }}>
                      <Filter size={13} strokeWidth={1.75} /> Filter
                    </button>
                    <button onClick={clearFilters} className="is-btn is-btn-ghost" style={{ padding:'9px 13px', fontSize:'0.83rem' }}>
                      <RotateCcw size={12} strokeWidth={1.75} /> Clear
                    </button>
                  </div>

                  {campaigns.length===0
                    ? <div className="is-card p-5 is-empty">
                        <div style={{ width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 6px 20px rgba(99,102,241,0.40)' }}>
                          <Megaphone size={24} color="#fff" strokeWidth={1.75} />
                        </div>
                        <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No campaigns found. Try clearing filters.</p>
                      </div>
                    : <div className="is-camp-grid">
                        {campaigns.map(c => (
                          <div key={c.id} className="is-camp-card">
                            <div className="is-camp-card-header" style={{ background:'linear-gradient(145deg,#091e48,#1a2e80)' }}>
                              <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(99,102,241,0.25)', filter:'blur(30px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
                              <Megaphone size={30} color="rgba(34,211,238,0.90)" strokeWidth={1.5} style={{ position:'relative', zIndex:1 }} />
                            </div>
                            <div className="is-camp-card-body">
                              {c.category && <span className="is-pill mb-1 d-inline-flex" style={{ background:'rgba(192,132,252,0.14)', color:'#C084FC' }}>{c.category}</span>}
                              <h6 className="fw-800 mt-1 mb-1" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{c.title}</h6>
                              {c.description && <p className="mb-1" style={{ color:'var(--text-secondary)', fontSize:'0.77rem', lineHeight:1.5 }}>{c.description.length>65?c.description.slice(0,65)+'…':c.description}</p>}
                              {c.budget && <p className="mb-1 fw-800" style={{ color:'#22D3EE', fontSize:'0.82rem' }}><Wallet size={11} strokeWidth={1.75} style={{ marginRight:3, verticalAlign:'middle' }} />₹{Number(c.budget).toLocaleString()}</p>}
                              {c.Sponsor?.companyName && <p className="mb-2" style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>by {c.Sponsor.companyName}</p>}
                              {c.isAcceptedByUser
                                ? <div className="is-pill is-pill-accepted w-100 justify-content-center" style={{ padding:'7px', marginTop:'auto' }}><CheckCircle size={11} strokeWidth={1.75} /> Joined</div>
                                : <button onClick={()=>acceptCampaign(c.id)} className="is-btn is-btn-brand w-100" style={{ padding:'8px', fontSize:'0.79rem', marginTop:'auto' }}>Accept Campaign</button>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </>
              )}

              {/* Ad requests */}
              {activeTab==='ads' && (
                <div className="d-flex flex-column gap-3">
                  {adRequests.length===0
                    ? <div className="is-card p-5 is-empty">
                        <div style={{ width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#C084FC,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 6px 20px rgba(192,132,252,0.40)' }}>
                          <FileText size={24} color="#fff" strokeWidth={1.75} />
                        </div>
                        <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No ad requests yet.</p>
                      </div>
                    : adRequests.map(req => (
                        <div key={req.id} className="is-card p-4">
                          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span className="fw-800" style={{ color:'var(--text-primary)', fontSize:'0.91rem' }}>
                                  {req.Campaign?.Sponsor?.companyName||req.Campaign?.title||'Campaign'}
                                </span>
                                <StatusPill status={req.status} />
                              </div>
                              {req.message && <p className="mb-2" style={{ color:'var(--text-secondary)', lineHeight:1.55, fontSize:'0.85rem' }}>{req.message}</p>}
                              {req.proposedTerms && (
                                <div className="rounded-3 p-2 mb-2" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)', fontSize:'0.80rem', color:'var(--text-secondary)' }}>
                                  <span className="fw-700" style={{ color:'#22D3EE' }}>Terms: </span>{req.proposedTerms}
                                </div>
                              )}
                              {negotiatingId===req.id && (
                                <div className="mt-2 rounded-3 p-3" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)' }}>
                                  <label className="is-label mb-2">Your Counter-Offer</label>
                                  <textarea className="is-input mb-2" rows={2} placeholder="Describe your revised terms…"
                                    value={counterTerms} onChange={e=>setCounterTerms(e.target.value)} style={{ resize:'vertical' }} />
                                  <div className="d-flex gap-2">
                                    <button onClick={()=>handleNegotiate(req.id)} className="is-btn is-btn-brand" style={{ padding:'6px 14px', fontSize:'0.78rem' }}><Check size={12} strokeWidth={1.75} /> Send</button>
                                    <button onClick={()=>{setNegotiatingId(null);setCounterTerms('');}} className="is-btn is-btn-ghost" style={{ padding:'6px 11px', fontSize:'0.78rem' }}><X size={12} strokeWidth={1.75} /> Cancel</button>
                                  </div>
                                </div>
                              )}
                            </div>
                            {(req.status==='pending'||req.status==='negotiation')&&negotiatingId!==req.id && (
                              <div className="d-flex gap-2 flex-shrink-0 flex-wrap">
                                <button onClick={()=>handleAdAction(req.id,'accept')} className="is-btn is-btn-brand" style={{ padding:'7px 14px', fontSize:'0.80rem' }}>
                                  <CheckCircle size={12} strokeWidth={1.75} /> Accept
                                </button>
                                <button onClick={()=>{setNegotiatingId(req.id);setCounterTerms('');}} className="is-btn is-btn-ghost" style={{ padding:'7px 13px', fontSize:'0.80rem', color:'#C084FC' }}>
                                  <Pencil size={12} strokeWidth={1.75} /> Negotiate
                                </button>
                                <button onClick={()=>handleAdAction(req.id,'reject')} className="is-btn is-btn-ghost" style={{ padding:'7px 13px', fontSize:'0.80rem', color:'#f87171' }}>
                                  <XCircle size={12} strokeWidth={1.75} /> Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
