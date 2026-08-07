import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2, Flag, Search, Users, Building2, Megaphone, FileText, User,
         Trash2, ShieldOff, Shield, Download, Mail, Hash, TrendingUp, Wallet,
         ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Sidebar from './SponsorDashboard/Sidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

/* Deep Space chart defaults */
const CHART_COLORS = ['#6366F1','#C084FC','#22D3EE','#06b6d4','#818cf8'];

function StatCard({ Icon, label, value, color, sub }) {
  return (
    <div className="is-stat-card">
      <div className="d-flex align-items-center gap-3 mb-2">
        <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`, border:`1px solid ${color}28`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={18} color={color} strokeWidth={1.75} />
        </div>
        <span className="is-stat-label" style={{ marginTop:0 }}>{label}</span>
      </div>
      <div className="is-stat-value">{value ?? '—'}</div>
      {sub && <p className="mb-0 mt-1" style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{sub}</p>}
    </div>
  );
}

/* ── Confirmation Dialog ──────────────────────────────────────────────────── */
function ConfirmDialog({ title, message, danger = true, onConfirm, onCancel }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.60)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:400,
        background:'var(--bg-panel)',
        border:'1px solid var(--border-glass)',
        borderRadius:18,
        padding:'28px 28px 24px',
        boxShadow:'0 24px 64px rgba(0,0,0,0.70)',
        animation:'dialogIn 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Icon */}
        <div style={{
          width:48, height:48, borderRadius:14, margin:'0 auto 16px',
          background: danger ? 'rgba(248,113,113,0.15)' : 'rgba(99,102,241,0.15)',
          border:`1px solid ${danger ? 'rgba(248,113,113,0.30)' : 'rgba(99,102,241,0.30)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Trash2 size={22} color={danger ? '#f87171' : '#6366F1'} strokeWidth={1.75} />
        </div>
        {/* Text */}
        <h3 className="display-brand text-center" style={{ color:'var(--text-primary)', fontSize:'1.1rem', fontWeight:800, marginBottom:8 }}>
          {title}
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', lineHeight:1.6, marginBottom:22 }}>
          {message}
        </p>
        {/* Buttons */}
        <div className="d-flex gap-2">
          <button onClick={onCancel} className="is-btn is-btn-ghost" style={{ flex:1, padding:'10px' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="is-btn" style={{
              flex:1, padding:'10px', fontWeight:700, borderRadius:999,
              background: danger ? 'rgba(248,113,113,0.18)' : 'var(--brand-grad)',
              color: danger ? '#f87171' : '#fff',
              border:`1px solid ${danger ? 'rgba(248,113,113,0.40)' : 'transparent'}`,
            }}>
            {danger ? 'Yes, Delete' : 'Confirm'}
          </button>
        </div>
      </div>
      <style>{`@keyframes dialogIn { from { opacity:0; transform:scale(0.92) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [stats, setStats]           = useState(null);
  const [ongoing, setOngoing]       = useState([]);
  const [flagged, setFlagged]       = useState([]);
  const [pending, setPending]       = useState([]);
  const [allUsers, setAllUsers]     = useState([]);
  const [userRole,  setUserRole]    = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchQ, setSearchQ]   = useState('');
  const [results, setResults]   = useState({ users:[], campaigns:[] });
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [dialog, setDialog]     = useState(null); // { title, message, onConfirm }

  const confirm = (title, message, onConfirm) => setDialog({ title, message, onConfirm });

  const get  = url       => fetch(url, { headers:H() }).then(r => r.json());
  const post = (url,body)=> fetch(url, { method:'POST',   headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const del  = (url,body)=> fetch(url, { method:'DELETE', headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify(body) });

  useEffect(() => {
    if (tab === 'overview' || tab === 'campaigns') {
      get('/api/admin/stats').then(setStats).catch(()=>{});
      get('/api/admin/ongoing-campaigns').then(r => setOngoing(Array.isArray(r) ? r : [])).catch(()=>{});
    }
    if (tab === 'overview') {
      get('/api/admin/stats').then(setStats).catch(()=>{});
    }
    if (tab === 'pending')  get('/api/admin/pending').then(r => setPending(Array.isArray(r) ? r : [])).catch(()=>{});
    if (tab === 'flagged')  get('/api/admin/flagged').then(r => setFlagged(Array.isArray(r) ? r : [])).catch(()=>{});
    if (tab === 'users')    get('/api/admin/users').then(r => setAllUsers(Array.isArray(r) ? r : [])).catch(()=>{});
  }, [tab]);

  const handleApprove = async (id) => {
    setError(''); setSuccess('');
    const r = await post(`/api/admin/approve/${id}`, {});
    if (r.ok) {
      const d = await r.json();
      setSuccess(d.message || 'User approved.');
      get('/api/admin/pending').then(r => setPending(Array.isArray(r) ? r : []));
      get('/api/admin/stats').then(setStats).catch(()=>{});
    } else setError('Approval failed.');
  };

  const handleReject = (id, name) => {
    confirm(
      'Reject Registration',
      `This will permanently delete ${name}'s registration request. This cannot be undone.`,
      async () => {
        setDialog(null); setError(''); setSuccess('');
        const r = await del(`/api/admin/reject/${id}`, {});
        if (r.ok) {
          setSuccess('Registration rejected.');
          get('/api/admin/pending').then(r => setPending(Array.isArray(r) ? r : []));
          get('/api/admin/stats').then(setStats).catch(()=>{});
        } else setError('Rejection failed.');
      }
    );
  };

  const handleSearch = async () => {    if (!searchQ.trim()) return;
    const data = await get(`/api/admin/search?query=${encodeURIComponent(searchQ)}`);
    setResults(data); setSearched(true);
  };

  const handleExport = async (type) => {
    try {
      const res = await fetch(`/api/admin/export/${type}`, { headers: H() });
      if (!res.ok) { setError('Export failed.'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch { setError('Export failed.'); }
  };

  const handleFlag = async (type, id) => {
    setError(''); setSuccess('');
    const r = await post('/api/admin/flag', { type, id });
    if (r.ok) {
      setSuccess(`${type} flagged.`);
      if (tab==='flagged') get('/api/admin/flagged').then(r => setFlagged(Array.isArray(r)?r:[]));
      if (tab==='users')   get('/api/admin/users').then(r => setAllUsers(Array.isArray(r)?r:[]));
    } else setError('Flag failed.');
  };

  const handleRemove = (type, id) => {
    confirm(
      `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      `This will permanently delete this ${type} and all associated data. This cannot be undone.`,
      async () => {
        setDialog(null); setError(''); setSuccess('');
        const r = await del('/api/admin/remove', { type, id });
        if (r.ok) {
          setSuccess(`${type} removed.`);
          setResults(p => ({
            users:     type==='user'     ? p.users.filter(u=>u.id!==id)     : p.users,
            campaigns: type==='campaign' ? p.campaigns.filter(c=>c.id!==id) : p.campaigns,
          }));
          if (tab==='flagged') get('/api/admin/flagged').then(r => setFlagged(Array.isArray(r)?r:[]));
          if (tab==='users')   get('/api/admin/users').then(r => setAllUsers(Array.isArray(r)?r:[]));
        } else setError('Remove failed.');
      }
    );
  };

  const barData = stats ? {
    labels: ['Users','Sponsors','Influencers','Campaigns','Ad Req'],
    datasets: [{
      label:'Count',
      data:[stats.users,stats.sponsors,stats.influencers,stats.campaigns,stats.adRequests],
      backgroundColor: CHART_COLORS,
      borderRadius:8, borderSkipped:false,
    }],
  } : null;

  const donutData = stats ? {
    labels:['Sponsors','Influencers'],
    datasets:[{
      data:[stats.sponsors, stats.influencers],
      backgroundColor:['#6366F1','#C084FC'],
      borderWidth:0, hoverOffset:8,
    }],
  } : null;

  const chartOpts = variant => ({
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ labels:{ color:'#9CA3AF', font:{ size:11 } } },
      tooltip:{ backgroundColor:'#0E1929', titleColor:'#E8EFFF', bodyColor:'#9CA3AF', borderColor:'rgba(99,102,241,0.30)', borderWidth:1 },
    },
    scales: variant==='bar' ? {
      x:{ ticks:{ color:'#6B7280' }, grid:{ color:'rgba(99,102,241,0.08)' } },
      y:{ ticks:{ color:'#6B7280' }, grid:{ color:'rgba(99,102,241,0.08)' } },
    } : undefined,
  });

  return (
    <div style={{ minHeight:'100vh' }}>
      <Sidebar />
      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
      <main className="is-dash-main">
        <div style={{ padding:'1.75rem var(--section-px)' }}>

          {error   && <div className="is-pill-rejected rounded-3 p-3 mb-3 small fw-600">{error}</div>}
          {success && <div className="is-pill-accepted rounded-3 p-3 mb-3 small fw-600">{success}</div>}

          {/* ── Overview ── */}
          {tab==='overview' && (
            <>
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Admin Console</p>
                  <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.7rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
                    Platform <span className="is-gradient-text">Overview</span>
                  </h1>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {[['campaigns','Campaigns'],['users','Users']].map(([f,l]) => (
                    <button key={f} onClick={() => handleExport(f)}
                      className="is-btn is-btn-ghost" style={{ padding:'7px 14px', fontSize:'0.79rem' }}>
                      <Download size={13} strokeWidth={1.75} /> Export {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row g-3 mb-4">
                {[
                  { Icon:Clock,     label:'Pending Approval', value:stats?.pendingApprovals, color:'#C084FC', sub:'awaiting review' },
                  { Icon:Users,     label:'Total Users',      value:stats?.users,            color:'#6366F1', sub:`${stats?.flaggedUsers||0} flagged` },
                  { Icon:Building2, label:'Sponsors',         value:stats?.sponsors,         color:'#22D3EE' },
                  { Icon:Megaphone, label:'Campaigns',        value:stats?.campaigns,        color:'#6366F1', sub:`${stats?.flaggedCampaigns||0} flagged` },
                  { Icon:User,      label:'Influencers',      value:stats?.influencers,      color:'#C084FC' },
                ].map(p => <div key={p.label} className="col-6 col-md-4 col-xl"><StatCard {...p} /></div>)}
              </div>

              {barData && donutData && (
                <div className="row g-3">
                  <div className="col-lg-7">
                    <div className="is-card p-4">
                      <h6 className="fw-700 mb-3" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>Platform Activity</h6>
                      <div style={{ height:230 }}><Bar data={barData} options={chartOpts('bar')} /></div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="is-card p-4">
                      <h6 className="fw-700 mb-3" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>User Breakdown</h6>
                      <div style={{ height:230 }}><Doughnut data={donutData} options={chartOpts('donut')} /></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Campaigns ── */}
          {tab==='campaigns' && (
            <>
              <h2 className="is-section-title">Ongoing Campaigns</h2>
              {ongoing.length===0
                ? <div className="is-card p-5 is-empty"><p style={{ color:'var(--text-muted)' }}>No active campaigns.</p></div>
                : <div className="d-flex flex-column gap-3">
                    {ongoing.map((c,i) => (
                      <div key={i} className="is-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="flex-grow-1">
                          <p className="fw-700 mb-2" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{c.name}</p>
                          <div className="is-progress-track" style={{ maxWidth:200 }}>
                            <div className="is-progress-fill" style={{ width:c.progress }} />
                          </div>
                          <p className="mb-0 mt-1" style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{c.progress} completed</p>
                        </div>
                        <button onClick={() => handleFlag('campaign',c.id)} className="is-btn is-btn-ghost" style={{ padding:'6px 12px', fontSize:'0.79rem' }}>
                          <ShieldOff size={12} strokeWidth={1.75} /> Flag
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </>
          )}

          {/* ── Pending Approvals ── */}
          {tab==='pending' && (
            <>
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Admin Console</p>
                  <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.7rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
                    Pending <span className="is-gradient-text">Approvals</span>
                  </h1>
                </div>
                {pending.length > 0 && (
                  <div style={{ padding:'6px 14px', borderRadius:999, background:'rgba(192,132,252,0.14)', border:'1px solid rgba(192,132,252,0.30)', color:'#C084FC', fontSize:'0.80rem', fontWeight:700 }}>
                    {pending.length} awaiting review
                  </div>
                )}
              </div>

              {pending.length === 0 ? (
                <div className="is-card p-5 is-empty">
                  <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(99,102,241,0.35)' }}>
                    <CheckCircle2 size={26} color="#fff" strokeWidth={1.75} />
                  </div>
                  <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No pending registrations. All clear.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pending.map(u => (
                    <div key={u.id} className="is-card p-4">
                      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">

                        {/* Left — user info */}
                        <div className="d-flex align-items-start gap-3 flex-grow-1">
                          <div style={{ width:42, height:42, borderRadius:'50%', flexShrink:0,
                            background: u.role==='influencer' ? 'rgba(192,132,252,0.15)' : 'rgba(99,102,241,0.15)',
                            border:`1px solid ${u.role==='influencer' ? 'rgba(192,132,252,0.30)' : 'rgba(99,102,241,0.30)'}`,
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <User size={18} color={u.role==='influencer' ? '#C084FC' : '#6366F1'} strokeWidth={1.75} />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span className="fw-800" style={{ color:'var(--text-primary)', fontSize:'0.93rem' }}>{u.name}</span>
                              <span className="is-pill" style={{ background: u.role==='influencer' ? 'rgba(192,132,252,0.12)' : 'rgba(99,102,241,0.12)', color: u.role==='influencer' ? '#C084FC' : '#6366F1' }}>{u.role}</span>
                              <span className="is-pill" style={{ background:'rgba(251,191,36,0.14)', color:'#fcd34d' }}>Pending</span>
                            </div>
                            <p className="mb-2" style={{ color:'var(--text-muted)', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:5 }}>
                              <Mail size={11} strokeWidth={1.75} /> {u.email}
                            </p>

                            {/* Profile details */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 24px' }}>
                              {u.role === 'influencer' && <>
                                {u.category && <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}><strong style={{ color:'var(--text-muted)', fontWeight:700 }}>Category:</strong> {u.category}</span>}
                                {u.niche    && <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}><strong style={{ color:'var(--text-muted)', fontWeight:700 }}>Niche:</strong> {u.niche}</span>}
                                {u.reach    && <span style={{ fontSize:'0.78rem', color:'#22D3EE', fontWeight:700 }}><TrendingUp size={11} strokeWidth={1.75} style={{ marginRight:3 }} />{Number(u.reach).toLocaleString()} followers</span>}
                              </>}
                              {u.role === 'sponsor' && <>
                                {u.company  && <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}><strong style={{ color:'var(--text-muted)', fontWeight:700 }}>Company:</strong> {u.company}</span>}
                                {u.industry && <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}><strong style={{ color:'var(--text-muted)', fontWeight:700 }}>Industry:</strong> {u.industry}</span>}
                                {u.budget   && <span style={{ fontSize:'0.78rem', color:'#22D3EE', fontWeight:700 }}><Wallet size={11} strokeWidth={1.75} style={{ marginRight:3 }} />₹{Number(u.budget).toLocaleString()}</span>}
                              </>}
                              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Applied: {u.created_at}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right — action buttons */}
                        <div className="d-flex gap-2 flex-shrink-0">
                          <button onClick={() => handleApprove(u.id)}
                            className="is-btn is-btn-brand" style={{ padding:'7px 16px', fontSize:'0.82rem' }}>
                            <CheckCircle2 size={13} strokeWidth={1.75} /> Approve
                          </button>
                          <button onClick={() => handleReject(u.id, u.name)}
                            className="is-btn is-btn-ghost" style={{ padding:'7px 14px', fontSize:'0.82rem', color:'#f87171' }}>
                            <XCircle size={13} strokeWidth={1.75} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Users ── */}
          {tab==='users' && (
            <>
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Admin Console</p>
                  <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.7rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
                    Manage <span className="is-gradient-text">Users</span>
                  </h1>
                </div>
                <button onClick={() => handleExport('users')} className="is-btn is-btn-ghost" style={{ padding:'7px 14px', fontSize:'0.79rem' }}>
                  <Download size={13} strokeWidth={1.75} /> Export Users
                </button>
              </div>

              {/* Filters */}
              <div className="is-card p-3 mb-4 d-flex gap-3 flex-wrap align-items-end">
                <div style={{ flex:'1 1 200px' }}>
                  <label className="is-label">Search</label>
                  <input className="is-input" placeholder="Name or email…"
                    value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
                <div style={{ flex:'1 1 140px' }}>
                  <label className="is-label">Role</label>
                  <select className="is-input" value={userRole} onChange={e => {
                    setUserRole(e.target.value);
                    const url = `/api/admin/users${e.target.value ? `?role=${e.target.value}` : ''}`;
                    get(url).then(r => setAllUsers(Array.isArray(r)?r:[])).catch(()=>{});
                  }}>
                    <option value="">All</option>
                    <option value="influencer">Influencers</option>
                    <option value="sponsor">Sponsors</option>
                  </select>
                </div>
              </div>

              {/* User list */}
              {(() => {
                const q = userSearch.toLowerCase();
                const filtered = q
                  ? allUsers.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
                  : allUsers;

                if (filtered.length === 0) return (
                  <div className="is-card p-5 is-empty">
                    <div style={{ width:52, height:52, borderRadius:15, background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 6px 20px rgba(99,102,241,0.40)' }}>
                      <Users size={24} color="#fff" strokeWidth={1.75} />
                    </div>
                    <p style={{ color:'var(--text-muted)', fontWeight:600 }}>No users found.</p>
                  </div>
                );

                return (
                  <div className="d-flex flex-column gap-3">
                    {filtered.map(u => (
                      <div key={u.id} className="is-card">
                        {/* Header row */}
                        <div className="d-flex align-items-center justify-content-between p-4 flex-wrap gap-3"
                          style={{ cursor:'pointer' }}
                          onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0,
                              background: u.role==='influencer' ? 'rgba(192,132,252,0.15)' : 'rgba(99,102,241,0.15)',
                              border: `1px solid ${u.role==='influencer' ? 'rgba(192,132,252,0.28)' : 'rgba(99,102,241,0.28)'}`,
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <User size={16} color={u.role==='influencer' ? '#C084FC' : '#6366F1'} strokeWidth={1.75} />
                            </div>
                            <div>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <p className="fw-700 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{u.name}</p>
                                <span className="is-pill" style={{ background: u.role==='influencer' ? 'rgba(192,132,252,0.12)' : 'rgba(99,102,241,0.12)', color: u.role==='influencer' ? '#C084FC' : '#6366F1' }}>{u.role}</span>
                                {u.is_flagged && <span className="is-pill is-pill-rejected">Flagged</span>}
                              </div>
                              <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.76rem' }}>{u.email}</p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            {!u.is_flagged && (
                              <button onClick={e => { e.stopPropagation(); handleFlag('user', u.id); }}
                                className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem' }}>
                                <ShieldOff size={12} strokeWidth={1.75} /> Flag
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); handleRemove('user', u.id); }}
                              className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem', color:'#f87171' }}>
                              <Trash2 size={12} strokeWidth={1.75} /> Delete
                            </button>
                            {expandedUser === u.id
                              ? <ChevronUp size={16} color="var(--text-muted)" strokeWidth={1.75} />
                              : <ChevronDown size={16} color="var(--text-muted)" strokeWidth={1.75} />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedUser === u.id && (
                          <div style={{ borderTop:'1px solid var(--border-glass)', padding:'16px 24px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16 }}>
                            <div>
                              <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Email</p>
                              <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                                <Mail size={12} strokeWidth={1.75} color="#22D3EE" />{u.email}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Joined</p>
                              <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem' }}>{u.created_at || '—'}</p>
                            </div>
                            {u.role === 'influencer' && <>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Category</p>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                                  <Hash size={12} strokeWidth={1.75} color="#C084FC" />{u.category || '—'}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Niche</p>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem' }}>{u.niche || '—'}</p>
                              </div>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Reach</p>
                                <p className="fw-600 mb-0" style={{ color:'#22D3EE', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                                  <TrendingUp size={12} strokeWidth={1.75} />{u.reach ? Number(u.reach).toLocaleString() : '—'}
                                </p>
                              </div>
                            </>}
                            {u.role === 'sponsor' && <>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Company</p>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                                  <Building2 size={12} strokeWidth={1.75} color="#6366F1" />{u.company || '—'}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Industry</p>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.85rem' }}>{u.industry || '—'}</p>
                              </div>
                              <div>
                                <p style={{ fontSize:'0.60rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.10em', color:'var(--text-muted)', marginBottom:3 }}>Budget</p>
                                <p className="fw-600 mb-0" style={{ color:'#22D3EE', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                                  <Wallet size={12} strokeWidth={1.75} />{u.budget ? `₹${Number(u.budget).toLocaleString()}` : '—'}
                                </p>
                              </div>
                            </>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}

          {/* ── Flagged ── */}
          {tab==='flagged' && (
            <>
              <h2 className="is-section-title">Flagged Content</h2>
              {flagged.length===0
                ? <div className="is-card p-5 is-empty">
                    <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#22D3EE,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(34,211,238,0.30)' }}>
                      <Shield size={26} color="#fff" strokeWidth={1.75} />
                    </div>
                    <p style={{ color:'var(--text-muted)' }}>Nothing flagged. All clear.</p>
                  </div>
                : <div className="d-flex flex-column gap-3">
                    {flagged.map((f,i) => (
                      <div key={i} className="is-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                          <span className="is-pill is-pill-rejected me-2">Flagged</span>
                          <span className="fw-600" style={{ color:'var(--text-primary)', fontSize:'0.88rem' }}>{f.name}</span>
                          {f.company && <span className="ms-2" style={{ color:'var(--text-muted)', fontSize:'0.80rem' }}>by {f.company}</span>}
                        </div>
                        <button onClick={() => handleRemove('campaign',f.id)} className="is-btn is-btn-ghost" style={{ padding:'6px 12px', fontSize:'0.79rem', color:'#f87171' }}>
                          <Trash2 size={12} strokeWidth={1.75} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </>
          )}

          {/* ── Search ── */}
          {tab==='search' && (
            <>
              <h2 className="is-section-title">Search Users & Campaigns</h2>
              <div className="is-card p-4 mb-4">
                <div className="d-flex gap-3 flex-wrap">
                  <input className="is-input flex-grow-1" placeholder="Search by name or title…" value={searchQ}
                    onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSearch()}
                    style={{ maxWidth:400 }} />
                  <button onClick={handleSearch} className="is-btn is-btn-brand" style={{ padding:'10px 20px' }}>
                    <Search size={13} strokeWidth={1.75} /> Search
                  </button>
                </div>
              </div>

              {searched && (
                <>
                  {results.users.length>0 && (
                    <div className="mb-4">
                      <h6 className="is-label mb-3">Users ({results.users.length})</h6>
                      <div className="d-flex flex-column gap-2">
                        {results.users.map(u => (
                          <div key={u.id} className="is-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                              <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Users size={14} color="#6366F1" strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.87rem' }}>{u.name}</p>
                                <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.76rem' }}>{u.email}</p>
                              </div>
                              <span className="is-pill" style={{ background:'rgba(99,102,241,0.12)', color:'#C084FC' }}>{u.role}</span>
                            </div>
                            <div className="d-flex gap-2">
                              <button onClick={() => handleFlag('user',u.id)} className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem' }}><ShieldOff size={11} strokeWidth={1.75} /> Flag</button>
                              <button onClick={() => handleRemove('user',u.id)} className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem', color:'#f87171' }}><Trash2 size={11} strokeWidth={1.75} /> Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.campaigns.length>0 && (
                    <div>
                      <h6 className="is-label mb-3">Campaigns ({results.campaigns.length})</h6>
                      <div className="d-flex flex-column gap-2">
                        {results.campaigns.map(c => (
                          <div key={c.id} className="is-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                              <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Megaphone size={14} color="#22D3EE" strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className="fw-600 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.87rem' }}>{c.title}</p>
                                {c.category && <span className="is-pill" style={{ background:'rgba(192,132,252,0.12)', color:'#C084FC', fontSize:'0.62rem' }}>{c.category}</span>}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button onClick={() => handleFlag('campaign',c.id)} className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem' }}><ShieldOff size={11} strokeWidth={1.75} /> Flag</button>
                              <button onClick={() => handleRemove('campaign',c.id)} className="is-btn is-btn-ghost" style={{ padding:'5px 11px', fontSize:'0.77rem', color:'#f87171' }}><Trash2 size={11} strokeWidth={1.75} /> Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.users.length===0 && results.campaigns.length===0 && (
                    <div className="is-card p-5 is-empty"><p style={{ color:'var(--text-muted)' }}>No results for "{searchQ}"</p></div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
