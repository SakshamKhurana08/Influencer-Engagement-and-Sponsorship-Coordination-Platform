import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2, Flag, Search, Users, Building2, Megaphone, FileText, User, Trash2, ShieldOff, Shield } from 'lucide-react';
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

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [stats, setStats]       = useState(null);
  const [ongoing, setOngoing]   = useState([]);
  const [flagged, setFlagged]   = useState([]);
  const [searchQ, setSearchQ]   = useState('');
  const [results, setResults]   = useState({ users:[], campaigns:[] });
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const get  = url       => fetch(url, { headers:H() }).then(r => r.json());
  const post = (url,body)=> fetch(url, { method:'POST',   headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify(body) });
  const del  = (url,body)=> fetch(url, { method:'DELETE', headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify(body) });

  useEffect(() => {
    if (tab === 'overview' || tab === 'campaigns') {
      get('/api/admin/stats').then(setStats).catch(()=>{});
      get('/api/admin/ongoing-campaigns').then(setOngoing).catch(()=>{});
    }
    if (tab === 'flagged') get('/api/admin/flagged').then(setFlagged).catch(()=>{});
  }, [tab]);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    const data = await get(`/api/admin/search?query=${encodeURIComponent(searchQ)}`);
    setResults(data); setSearched(true);
  };

  const handleFlag = async (type, id) => {
    setError(''); setSuccess('');
    const r = await post('/api/admin/flag', { type, id });
    if (r.ok) { setSuccess(`${type} flagged.`); if (tab==='flagged') get('/api/admin/flagged').then(setFlagged); }
    else setError('Flag failed.');
  };

  const handleRemove = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type}?`)) return;
    setError(''); setSuccess('');
    const r = await del('/api/admin/remove', { type, id });
    if (r.ok) {
      setSuccess(`${type} removed.`);
      setResults(p => ({
        users:     type==='user'     ? p.users.filter(u=>u.id!==id)     : p.users,
        campaigns: type==='campaign' ? p.campaigns.filter(c=>c.id!==id) : p.campaigns,
      }));
      if (tab==='flagged') get('/api/admin/flagged').then(setFlagged);
    } else setError('Remove failed.');
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
    labels:['Sponsors','Influencers','Admins'],
    datasets:[{
      data:[stats.sponsors,stats.influencers,Math.max(0,stats.users-stats.sponsors-stats.influencers)],
      backgroundColor:['#6366F1','#C084FC','#22D3EE'],
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
                    <a key={f} href={`/api/admin/export/${f}`} download={`${f}.csv`}
                      className="is-btn is-btn-ghost text-decoration-none" style={{ padding:'7px 14px', fontSize:'0.79rem' }}>
                      Export {l}
                    </a>
                  ))}
                </div>
              </div>

              <div className="row g-3 mb-4">
                {[
                  { Icon:Users,     label:'Total Users',   value:stats?.users,       color:'#6366F1', sub:`${stats?.flaggedUsers||0} flagged` },
                  { Icon:Building2, label:'Sponsors',      value:stats?.sponsors,    color:'#C084FC' },
                  { Icon:Megaphone, label:'Campaigns',     value:stats?.campaigns,   color:'#22D3EE', sub:`${stats?.flaggedCampaigns||0} flagged` },
                  { Icon:FileText,  label:'Ad Requests',   value:stats?.adRequests,  color:'#6366F1' },
                  { Icon:User,      label:'Influencers',   value:stats?.influencers, color:'#C084FC' },
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
