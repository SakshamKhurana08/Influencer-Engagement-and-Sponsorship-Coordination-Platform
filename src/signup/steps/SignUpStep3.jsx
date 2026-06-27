import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import axios from 'axios';
import { ChevronLeft, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const Row = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div
      className="d-flex justify-content-between align-items-center py-2"
      style={{ borderBottom: '1px solid var(--border-glass)' }}
    >
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
      <span className="fw-700" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{value}</span>
    </div>
  );
};

const SectionBox = ({ title, children }) => (
  <div
    className="rounded-3 p-3 mb-3"
    style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}
  >
    <p className="fw-800 mb-3" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setStatus(''); setIsError(false);

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
    if (formData.role === 'influencer' && profileImageFile instanceof File) {
      fd.append('profileImage', profileImageFile);
    }

    try {
      await axios.post('/api/auth/register', fd);
      navigate('/signup-success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsError(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="is-card p-4 p-md-5">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow-btn)' }}>
          <Zap size={13} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Step 3 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand mb-1" style={{ fontSize: '1.9rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        Review &amp; Confirm
      </h2>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Check your details before completing registration.
      </p>

      {status && (
        <div
          className="d-flex align-items-center gap-2 rounded-3 p-3 mb-4 fw-700"
          style={{
            fontSize: '0.84rem',
            background: isError ? 'var(--pill-rejected)' : 'var(--pill-accepted)',
            color: isError ? 'var(--pill-rejected-text)' : 'var(--pill-accepted-text)',
          }}
        >
          {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {status}
        </div>
      )}

      <SectionBox title="Account Info">
        {imgPreview && (
          <div className="d-flex align-items-center gap-3 mb-3">
            <img src={imgPreview} alt="profile" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-1)' }} />
            <span className="fw-700" style={{ color: 'var(--text-primary)' }}>{formData.name}</span>
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

      <div className="d-flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => navigate('/signup/step2')}
          disabled={submitting}
          className="is-btn is-btn-ghost"
          style={{ padding: '12px 24px' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="is-btn is-btn-brand"
          style={{ flex: 1, padding: '12px', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Creating account…' : 'Confirm & Register'}
        </button>
      </div>
    </div>
  );
}
