import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import api from '../../api/axiosInstance';
import { ChevronLeft, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const Row = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="d-flex justify-content-between align-items-center"
      style={{ padding:'7px 0', borderBottom:'1px solid var(--border-glass)' }}>
      <span style={{ color:'var(--text-muted)', fontSize:'0.81rem' }}>{label}</span>
      <span className="fw-700" style={{ color:'var(--text-primary)', fontSize:'0.81rem' }}>{value}</span>
    </div>
  );
};

const SectionBox = ({ title, children }) => (
  <div style={{
    /* Dark mode: semi-transparent dark navy. Light mode: solid white with border */
    background:'var(--bg-panel)',
    border:'1px solid var(--border-glass)',
    borderRadius:12, padding:'12px 14px', marginBottom:10,
  }}>
    <p className="fw-800" style={{
      fontSize:'0.60rem', textTransform:'uppercase', letterSpacing:'0.10em',
      color:'var(--text-muted)', marginBottom:8,
    }}>
      {title}
    </p>
    {children}
  </div>
);

export default function SignUpStep3() {
  const { formData, profileImageFile } = useSignup();
  const navigate = useNavigate();
  const [status, setStatus]         = useState('');
  const [isError, setIsError]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => {
    if (profileImageFile instanceof File) {
      const url = URL.createObjectURL(profileImageFile);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [profileImageFile]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true); setStatus(''); setIsError(false);
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
    if (formData.role === 'influencer' && profileImageFile instanceof File)
      fd.append('profileImage', profileImageFile);
    try {
      await api.post('/api/auth/register', fd);
      navigate('/signup-success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsError(true); setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Step badge */}
      <div className="d-flex align-items-center gap-2" style={{ marginBottom:14 }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(99,102,241,0.55)', flexShrink:0 }}>
          <Zap size={11} color="#fff" fill="#fff" strokeWidth={1.75} />
        </div>
        <span style={{ fontSize:'0.60rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Step 3 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand" style={{ fontSize:'1.55rem', color:'var(--text-primary)', letterSpacing:'-0.02em', marginBottom:2 }}>
        Review &amp; Confirm
      </h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:16 }}>
        Check your details before completing registration.
      </p>

      {status && (
        <div className="d-flex align-items-center gap-2 rounded-3 p-3 fw-700"
          style={{ fontSize:'0.82rem', marginBottom:12, borderRadius:10,
            background: isError ? 'var(--pill-rejected)' : 'var(--pill-accepted)',
            color: isError ? 'var(--pill-rejected-text)' : 'var(--pill-accepted-text)' }}>
          {isError ? <AlertCircle size={15} strokeWidth={1.75} /> : <CheckCircle2 size={15} strokeWidth={1.75} />}
          {status}
        </div>
      )}

      <SectionBox title="Account Info">
        {imgPreview && (
          <div className="d-flex align-items-center gap-2" style={{ marginBottom:8 }}>
            <img src={imgPreview} alt="profile"
              style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', border:'2px solid #6366F1', flexShrink:0 }} />
            <span className="fw-700" style={{ color:'var(--text-primary)', fontSize:'0.84rem' }}>{formData.name}</span>
          </div>
        )}
        <Row label="Name"  value={formData.name} />
        <Row label="Email" value={formData.email} />
        <Row label="Role"  value={formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ''} />
      </SectionBox>

      <SectionBox title={formData.role === 'influencer' ? 'Creator Details' : 'Brand Details'}>
        {formData.role === 'influencer' ? (
          <>
            <Row label="Category" value={formData.category} />
            <Row label="Niche"    value={formData.niche} />
            <Row label="Reach"    value={formData.reach ? `${Number(formData.reach).toLocaleString()} followers` : ''} />
            {!imgPreview && <Row label="Profile Photo" value="Not uploaded" />}
          </>
        ) : (
          <>
            <Row label="Company"  value={formData.company} />
            <Row label="Industry" value={formData.industry} />
            <Row label="Budget"   value={formData.budget ? `₹${Number(formData.budget).toLocaleString()}` : ''} />
          </>
        )}
      </SectionBox>

      <div className="d-flex gap-2" style={{ marginTop:16 }}>
        <button type="button" onClick={() => navigate('/signup/step2')} disabled={submitting}
          className="is-btn is-btn-ghost" style={{ padding:'11px 20px', fontSize:'0.875rem' }}>
          <ChevronLeft size={15} strokeWidth={1.75} /> Back
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="is-btn is-btn-brand" style={{ flex:1, padding:'11px', fontSize:'0.875rem', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Creating account…' : 'Confirm & Register'}
        </button>
      </div>
    </div>
  );
}
