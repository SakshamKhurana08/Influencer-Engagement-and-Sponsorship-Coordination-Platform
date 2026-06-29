import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Tag, Wallet, Pencil, Check, X, Lock, Upload } from 'lucide-react';

const Field = ({ label, name, value, editing, onChange, type = 'text', Icon, color }) => (
  <div className="mb-3">
    <label className="is-label">{label}</label>
    {editing ? (
      <div className="position-relative">
        {Icon && <Icon size={14} strokeWidth={1.75} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />}
        <input name={name} type={type} className="is-input" value={value} onChange={onChange}
          style={Icon ? { paddingLeft:36 } : {}} />
      </div>
    ) : (
      <div className="d-flex align-items-center gap-2 py-2 px-3"
        style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)', borderRadius:11 }}>
        {Icon && <Icon size={14} color={color || 'var(--text-muted)'} strokeWidth={1.75} />}
        <span style={{ color:'var(--text-primary)', fontSize:'0.87rem' }}>{value || '—'}</span>
      </div>
    )}
  </div>
);

export default function Settings() {
  const [user, setUser]             = useState(null);
  const [profile, setProfile]       = useState(null);
  const [editing, setEditing]       = useState(false);
  const [formData, setFormData]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState('');
  const [isError, setIsError]       = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.get('/api/sponsors/profile').then(r => {
      setUser(r.data.user); setProfile(r.data.sponsor);
      setFormData({ name: r.data.user.name, companyName: r.data.sponsor.companyName, industry: r.data.sponsor.industry, budget: r.data.sponsor.budget });
      if (r.data.sponsor.profileImageUrl) setImgPreview(`/uploads/influencer_photos/${r.data.sponsor.profileImageUrl}`);
      setLoading(false);
    }).catch(err => { if (err.response?.status === 401) navigate('/login'); setLoading(false); });
  }, [navigate]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    try {
      const r = await api.put('/api/sponsors/profile', formData);
      setUser(r.data.user); setProfile(r.data.sponsor);
      setMessage('Profile updated.'); setIsError(false); setEditing(false);
    } catch { setMessage('Update failed.'); setIsError(true); }
  };

  const handleImage = async e => {
    const file = e.target.files[0]; if (!file) return;
    setImgPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append('profileImage', file);
    setUploading(true);
    try {
      const r = await api.post('/api/sponsors/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(r.data.sponsor); setMessage('Image updated.'); setIsError(false);
    } catch { setMessage('Image upload failed.'); setIsError(true); }
    finally { setUploading(false); e.target.value = null; }
  };

  if (loading) return <div className="is-spinner-wrap"><div className="is-spinner" role="status" /></div>;

  return (
    <div style={{ padding:'1.75rem var(--section-px)' }}>
      <div className="mb-4">
        <p style={{ fontSize:'0.64rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>Account</p>
        <h1 className="display-brand mb-0" style={{ fontSize:'clamp(1.7rem,3.5vw,2.4rem)', color:'var(--text-primary)', fontWeight:900, letterSpacing:'-0.03em' }}>
          Settings
        </h1>
      </div>

      <div className="row g-4">
        {/* Avatar */}
        <div className="col-lg-3">
          <div className="is-card p-4 text-center">
            <div className="position-relative d-inline-block mb-3">
              {imgPreview
                ? <img src={imgPreview} alt="avatar" className="rounded-circle" style={{ width:88, height:88, objectFit:'cover', border:'2px solid #6366F1', boxShadow:'0 0 20px rgba(99,102,241,0.40)' }} />
                : <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width:88, height:88, background:'linear-gradient(135deg,#6366F1,#C084FC)', boxShadow:'0 0 20px rgba(99,102,241,0.40)' }}>
                    <Building2 size={34} color="#fff" strokeWidth={1.75} />
                  </div>
              }
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'#6366F1', border:'2px solid var(--bg-app)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 10px rgba(99,102,241,0.55)' }}>
                <Upload size={11} color="#fff" strokeWidth={1.75} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleImage} />
            <h6 className="fw-800 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.90rem' }}>{profile?.companyName}</h6>
            <p className="small mb-0" style={{ color:'var(--text-muted)' }}>{profile?.industry}</p>
            {uploading && <p className="small mt-1" style={{ color:'#22D3EE' }}>Uploading…</p>}
          </div>
        </div>

        {/* Form */}
        <div className="col-lg-6">
          <div className="is-card p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-800 mb-0" style={{ color:'var(--text-primary)', fontSize:'0.97rem' }}>Profile Details</h5>
              {!editing
                ? <button onClick={() => setEditing(true)} className="is-btn is-btn-ghost" style={{ padding:'6px 14px', fontSize:'0.79rem' }}><Pencil size={13} strokeWidth={1.75} /> Edit</button>
                : <button onClick={() => setEditing(false)} className="is-btn is-btn-ghost" style={{ width:32, height:32, padding:0, borderRadius:'50%' }}><X size={13} strokeWidth={1.75} /></button>
              }
            </div>

            {message && (
              <div className="rounded-3 p-3 mb-3 fw-700" style={{ fontSize:'0.82rem', background: isError ? 'var(--pill-rejected)' : 'var(--pill-accepted)', color: isError ? 'var(--pill-rejected-text)' : 'var(--pill-accepted-text)' }}>
                {message}
              </div>
            )}

            {/* Read-only email */}
            <div className="mb-3">
              <label className="is-label">Email Address</label>
              <div className="d-flex align-items-center gap-2 py-2 px-3" style={{ background:'var(--bg-surface-2)', border:'1px solid var(--border-glass)', borderRadius:11 }}>
                <Lock size={13} color="var(--text-muted)" strokeWidth={1.75} />
                <span style={{ color:'var(--text-muted)', fontSize:'0.85rem', flexGrow:1 }}>{user?.email}</span>
                <span style={{ padding:'1px 8px', borderRadius:999, background:'rgba(99,102,241,0.10)', color:'var(--text-muted)', fontSize:'0.58rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>Read-only</span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <Field label="Full Name"    name="name"        value={formData.name        ?? ''} editing={editing} onChange={handleChange} Icon={User}      color="#6366F1" />
              <Field label="Company Name" name="companyName" value={formData.companyName ?? ''} editing={editing} onChange={handleChange} Icon={Building2} color="#C084FC" />
              <Field label="Industry"     name="industry"    value={formData.industry    ?? ''} editing={editing} onChange={handleChange} Icon={Tag}       color="#22D3EE" />
              <Field label="Budget (₹)"  name="budget"      value={formData.budget      ?? ''} editing={editing} onChange={handleChange} Icon={Wallet}    color="#22D3EE" type="number" />
              {editing && (
                <button type="submit" className="is-btn is-btn-brand w-100 mt-2" style={{ padding:'12px' }}>
                  <Check size={14} strokeWidth={1.75} /> Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
