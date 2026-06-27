import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Tag, Wallet, Pencil, Check, X, Lock } from 'lucide-react';

/* ── Single field row — view vs edit mode ── */
const Field = ({ label, name, value, editing, onChange, type = 'text', Icon }) => (
  <div className="mb-4">
    <label className="is-label">{label}</label>
    {editing ? (
      <div className="position-relative">
        {Icon && (
          <Icon
            size={15}
            className="position-absolute"
            style={{ left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
        )}
        <input
          name={name}
          type={type}
          className="is-input"
          value={value}
          onChange={onChange}
          style={Icon ? { paddingLeft: 38 } : {}}
        />
      </div>
    ) : (
      <div
        className="d-flex align-items-center gap-2 py-2 px-3"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-glass)',
          borderRadius: 12,
        }}
      >
        {Icon && <Icon size={15} color="var(--text-muted)" />}
        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value || '—'}</span>
      </div>
    )}
  </div>
);

export default function Settings() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [isError, setIsError]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios
      .get('/api/sponsors/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setUser(r.data.user);
        setProfile(r.data.sponsor);
        setFormData({
          name: r.data.user.name,
          companyName: r.data.sponsor.companyName,
          industry: r.data.sponsor.industry,
          budget: r.data.sponsor.budget,
        });
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const r = await axios.put('/api/sponsors/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(r.data.user);
      setProfile(r.data.sponsor);
      setMessage('Profile updated successfully.');
      setIsError(false);
      setEditing(false);
    } catch {
      setMessage('Update failed. Please try again.');
      setIsError(true);
    }
  };

  if (loading) return <div className="is-spinner" />;

  return (
    <div style={{ padding: 'var(--section-py) var(--section-px)', minHeight: '100vh' }}>

      {/* Page header */}
      <div className="mb-5">
        <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
          Account
        </p>
        <h1
          className="display-brand"
          style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', color: 'var(--text-primary)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 0 }}
        >
          Settings
        </h1>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="is-card p-4 p-md-5">

            {/* Card header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-800 mb-0" style={{ color: 'var(--text-primary)' }}>Profile Details</h5>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="is-btn is-btn-ghost" style={{ padding: '8px 18px', fontSize: '0.8rem' }}>
                  <Pencil size={14} /> Edit
                </button>
              ) : (
                <button onClick={() => setEditing(false)} className="is-btn is-btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Feedback */}
            {message && (
              <div className={`rounded-3 p-3 mb-4 fw-700`} style={{
                fontSize: '0.84rem',
                background: isError ? 'var(--pill-rejected)' : 'var(--pill-accepted)',
                color: isError ? 'var(--pill-rejected-text)' : 'var(--pill-accepted-text)',
              }}>
                {message}
              </div>
            )}

            {/* Read-only email */}
            <div className="mb-4">
              <label className="is-label">Email Address</label>
              <div
                className="d-flex align-items-center gap-2 py-2 px-3"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)', borderRadius: 12 }}
              >
                <Lock size={14} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flexGrow: 1 }}>{user?.email}</span>
                <span className="is-pill" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                  Read-only
                </span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <Field label="Full Name"    name="name"        value={formData.name        ?? ''} editing={editing} onChange={handleChange} Icon={User} />
              <Field label="Company Name" name="companyName" value={formData.companyName ?? ''} editing={editing} onChange={handleChange} Icon={Building2} />
              <Field label="Industry"     name="industry"    value={formData.industry    ?? ''} editing={editing} onChange={handleChange} Icon={Tag} />
              <Field label="Budget (₹)"  name="budget"      value={formData.budget      ?? ''} editing={editing} onChange={handleChange} Icon={Wallet} type="number" />

              {editing && (
                <button type="submit" className="is-btn is-btn-brand w-100 mt-2" style={{ padding: '13px' }}>
                  <Check size={16} /> Save Changes
                </button>
              )}
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
