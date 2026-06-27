import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { Zap } from 'lucide-react';
import {
  BarChart2, Flag, Search, LogOut, Sun, Moon,
  Users, Building2, Megaphone, FileText, AlertTriangle,
  Trash2, ShieldOff, Shield,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_TOKEN = () => localStorage.getItem('token');
const HEADERS   = () => ({ Authorization: `Bearer ${API_TOKEN()}` });

const TABS = [
  { key: 'overview',   Icon: BarChart2,    label: 'Overview' },
  { key: 'campaigns',  Icon: Megaphone,    label: 'Campaigns' },
  { key: 'flagged',    Icon: Flag,         label: 'Flagged' },
  { key: 'search',     Icon: Search,       label: 'Search' },
];

const StatCard = ({ Icon, label, value, color, sub }) => (
  <div className="is-stat-card">
    <div className="d-flex align-items-center gap-3 mb-3">
      <div className="rounded-3 d-flex align-items-center justify-content-center"
        style={{ width: 44, height: 44, background: `${color}18`, flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <span className="is-stat-label" style={{ marginTop: 0 }}>{label}</span>
    </div>
    <div className="is-stat-value">{value ?? '—'}</div>
    {sub && <p className="mb-0 mt-1 small" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [tab, setTab]             = useState('overview');
  const [stats, setStats]         = useState(null);
  const [ongoing, setOngoing]     = useState([]);
  const [flagged, setFlagged]     = useState([]);
  const [searchQ, setSearchQ]     = useState('');
  const [results, setResults]     = useState({ users: [], campaigns: [] });
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const get = (url) => fetch(url, { headers: HEADERS() }).then(r => r.json());
  const post = (url, body) => fetch(url, { method: 'POST', headers: { ...HEADERS(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const del  = (url, body) => fetch(url, { method: 'DELETE', headers: { ...HEADERS(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  /* Load stats + ongoing on Overview tab */
  useEffect(() => {
    if (tab === 'overview' || tab === 'campaigns') {
      get('/api/admin/stats').then(setStats).catch(() => {});
      get('/api/admin/ongoing-campaigns').then(setOngoing).catch(() => {});
    }
    if (tab === 'flagged') {
      get('/api/admin/flagged').then(setFlagged).catch(() => {});
    }
  }, [tab]);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    const data = await get(`/api/admin/search?query=${encodeURIComponent(searchQ)}`);
    setResults(data); setSearched(true);
  };

  const handleFlag = async (type, id) => {
    setError(''); setSuccess('');
    const r = await post('/api/admin/flag', { type, id });
    if (r.ok) { setSuccess(`${type} flagged.`); if (tab === 'flagged') get('/api/admin/flagged').then(setFlagged); }
    else setError('Flag failed.');
  };

  const handleRemove = async (type, id) => {
    if (!window.confirm(`Permanently delete this ${type}?`)) return;
    setError(''); setSuccess('');
    const r = await del('/api/admin/remove', { type, id });
    if (r.ok) {
      setSuccess(`${type} removed.`);
      setResults(p => ({
        users:     type === 'user'     ? p.users.filter(u => u.id !== id) : p.users,
        campaigns: type === 'campaign' ? p.campaigns.filter(c => c.id !== id) : p.campaigns,
      }));
      if (tab === 'flagged') get('/api/admin/flagged').then(setFlagged);
    } else setError('Remove failed.');
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('userRole'); navigate('/login'); };

  /* ── Chart config ── */
  const barData = stats ? {
    labels: ['Users', 'Sponsors', 'Influencers', 'Campaigns', 'Ad Requests'],
    datasets: [{
      label: 'Count',
      data: [stats.users, stats.sponsors, stats.influencers, stats.campaigns, stats.adRequests],
      backgroundColor: ['#6366f1', '#0d9488', '#e11d48', '#f59e0b', '#8b5cf6'],
      borderRadius: 8, borderSkipped: false,
    }],
  } : null;

  const donutData = stats ? {
    labels: ['Sponsors', 'Influencers', 'Admins'],
    datasets: [{
      data: [stats.sponsors, stats.influencers, stats.users - stats.sponsors - stats.influencers],
      backgroundColor: ['#0d9488', '#e11d48', '#6366f1'],
      borderWidth: 0,
    }],
  } : null;

  const chartOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'var(--text-secondary)', font: { size: 12 } } },
      title: { display: false },
      tooltip: { backgroundColor: 'var(--bg-surface)', titleColor: 'var(--text-primary)', bodyColor: 'var(--text-secondary)', borderColor: 'var(--border-glass)', borderWidth: 1 },
    },
    scales: title === 'bar' ? {
      x: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--border-subtle)' } },
      y: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--border-subtle)' } },
    } : undefined,
  });

  return (
    <div className="is-page" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <div className="is-page-orb-c" />

      {/* ── Top Navbar ── */}
      <nav className="is-navbar px-4">
        <div style={{ height: 64 }} className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--brand-glow-btn)' }}>
              <Zap size={13} color="#fff" fill="#fff" />
            </div>
            <span className="display-brand" style={{ fontSize: '1.3rem', color: 'var(--brand-1)' }}>InSync <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:'0.9rem' }}>Admin</span></span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={toggleTheme} className="is-btn is-btn-ghost" style={{ width: 38, height: 38, padding: 0, borderRadius: '50%' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={logout} className="is-btn is-btn-ghost" style={{ padding: '8px 18px', color: '#ef4444', fontSize: '0.85rem' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '3rem var(--section-px)' }}>
        {/* Alerts */}
        {error   && <div className="is-pill-rejected  rounded-3 p-3 mb-3 small fw-600">{error}</div>}
        {success && <div className="is-pill-accepted  rounded-3 p-3 mb-3 small fw-600">{success}</div>}

        {/* Tab nav */}
        <div className="d-flex gap-2 mb-5 flex-wrap">
          {TABS.map(({ key, Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`is-btn ${tab === key ? 'is-btn-brand' : 'is-btn-ghost'}`}
              style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
              <Icon size={15} className="me-1" /> {label}
            </button>
          ))}
        </div>

        {/* ══ Overview ══ */}
        {tab === 'overview' && (
          <>
            <h2 className="is-section-title">Platform Overview</h2>
            <div className="row g-4 mb-5">
              {[
                { Icon: Users,      label: 'Total Users',      value: stats?.users,       color: '#6366f1', sub: `${stats?.flaggedUsers || 0} flagged` },
                { Icon: Building2,  label: 'Sponsors',         value: stats?.sponsors,    color: '#0d9488' },
                { Icon: Megaphone,  label: 'Campaigns',        value: stats?.campaigns,   color: '#e11d48', sub: `${stats?.flaggedCampaigns || 0} flagged` },
                { Icon: FileText,   label: 'Ad Requests',      value: stats?.adRequests,  color: '#f59e0b' },
                { Icon: AlertTriangle, label: 'Influencers',   value: stats?.influencers, color: '#8b5cf6' },
              ].map(p => <div key={p.label} className="col-6 col-md-4 col-xl"><StatCard {...p} /></div>)}
            </div>

            {/* Charts */}
            {barData && donutData && (
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="is-card p-4">
                    <h6 className="fw-700 mb-4" style={{ color: 'var(--text-primary)' }}>Platform Activity</h6>
                    <div style={{ height: 260 }}>
                      <Bar data={barData} options={chartOpts('bar')} />
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="is-card p-4">
                    <h6 className="fw-700 mb-4" style={{ color: 'var(--text-primary)' }}>User Breakdown</h6>
                    <div style={{ height: 260 }}>
                      <Doughnut data={donutData} options={chartOpts('donut')} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ Ongoing Campaigns ══ */}
        {tab === 'campaigns' && (
          <>
            <h2 className="is-section-title">Ongoing Campaigns</h2>
            {ongoing.length === 0 ? (
              <div className="is-card p-5 text-center">
                <p style={{ color: 'var(--text-muted)' }}>No active campaigns at the moment.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {ongoing.map((c, i) => (
                  <div key={i} className="is-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="flex-grow-1">
                      <p className="fw-700 mb-1" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      {/* Progress bar */}
                      <div style={{ height: 6, background: 'var(--bg-surface-2)', borderRadius: 3, overflow: 'hidden', maxWidth: 240 }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          width: c.progress, background: 'var(--brand-grad)',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <p className="mb-0 mt-1 small" style={{ color: 'var(--text-muted)' }}>{c.progress} completed</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={() => handleFlag('campaign', c.id)} className="is-btn is-btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                        <ShieldOff size={13} className="me-1" /> Flag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ Flagged ══ */}
        {tab === 'flagged' && (
          <>
            <h2 className="is-section-title">Flagged Content</h2>
            {flagged.length === 0 ? (
              <div className="is-card p-5 text-center">
                <div className="is-icon-box is-icon-box-lg mx-auto mb-4" style={{ background:'linear-gradient(135deg,#059669,#34d399)' }}>
                  <Shield size={28} color="#fff" />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Nothing flagged. All clear!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {flagged.map((f, i) => (
                  <div key={i} className="is-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <span className="is-pill is-pill-rejected me-2">Flagged</span>
                      <span className="fw-600" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                      {f.company && <span className="ms-2 small" style={{ color: 'var(--text-muted)' }}>by {f.company}</span>}
                    </div>
                    <button onClick={() => handleRemove('campaign', f.id)} className="is-btn is-btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem', color: '#ef4444' }}>
                      <Trash2 size={13} className="me-1" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ Search ══ */}
        {tab === 'search' && (
          <>
            <h2 className="is-section-title">Search Users & Campaigns</h2>
            <div className="is-card p-4 mb-4">
              <div className="d-flex gap-3 flex-wrap">
                <input
                  className="is-input flex-grow-1" placeholder="Search by name or title…"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ maxWidth: 420 }}
                />
                <button onClick={handleSearch} className="is-btn is-btn-brand" style={{ padding: '10px 24px' }}>
                  <Search size={15} className="me-1" /> Search
                </button>
              </div>
            </div>

            {searched && (
              <>
                {/* Users */}
                {results.users.length > 0 && (
                  <div className="mb-4">
                    <h6 className="is-label mb-3">Users ({results.users.length})</h6>
                    <div className="d-flex flex-column gap-2">
                      {results.users.map(u => (
                        <div key={u.id} className="is-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 38, height: 38, background: 'var(--accent-light)' }}>
                              <Users size={16} color="var(--accent)" />
                            </div>
                            <div>
                              <p className="fw-600 mb-0" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                              <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                            </div>
                            <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{u.role}</span>
                          </div>
                          <div className="d-flex gap-2">
                            <button onClick={() => handleFlag('user', u.id)} className="is-btn is-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                              <ShieldOff size={12} className="me-1" /> Flag
                            </button>
                            <button onClick={() => handleRemove('user', u.id)} className="is-btn is-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem', color: '#ef4444' }}>
                              <Trash2 size={12} className="me-1" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaigns */}
                {results.campaigns.length > 0 && (
                  <div>
                    <h6 className="is-label mb-3">Campaigns ({results.campaigns.length})</h6>
                    <div className="d-flex flex-column gap-2">
                      {results.campaigns.map(c => (
                        <div key={c.id} className="is-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 38, height: 38, background: 'rgba(230,0,35,0.1)' }}>
                              <Megaphone size={16} color="var(--brand-1)" />
                            </div>
                            <div>
                              <p className="fw-600 mb-0" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                              {c.category && <span className="is-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.7rem' }}>{c.category}</span>}
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button onClick={() => handleFlag('campaign', c.id)} className="is-btn is-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                              <ShieldOff size={12} className="me-1" /> Flag
                            </button>
                            <button onClick={() => handleRemove('campaign', c.id)} className="is-btn is-btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem', color: '#ef4444' }}>
                              <Trash2 size={12} className="me-1" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.users.length === 0 && results.campaigns.length === 0 && (
                  <div className="is-card p-5 text-center">
                    <p style={{ color: 'var(--text-muted)' }}>No results for "{searchQ}"</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>  {/* end padding div */}
    </div>   {/* end is-page */}
  );
}
