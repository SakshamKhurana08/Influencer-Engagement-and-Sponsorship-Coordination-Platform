import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import axios from 'axios';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const Row = ({ label, value }) => value == null || value === '' ? null : (
  <div className="d-flex justify-content-between align-items-center py-2"
    style={{ borderBottom: '1px solid var(--border-glass)' }}>
    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
    <span className="fw-600" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{value}</span>
  </div>
);

export default function SignUpStep3() {
  const { formData, profileImageFile } = useSignup();
  const navigate = useNavigate();
  const [status, setStatus]       = useState('');
  const [isError, setIsError]     = useState(false);
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
    if (formData.role === 'influencer' && profileImageFile instanceof File)
      fd.append('profileImage', profileImageFile);

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
      <h2 className="fw-800 mb-1" style={{ color: 'var(--text-primary)', fontSize: '1.7rem' }}>Review & Confirm</h2>
      <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Step 3 of 3 — Check your details before registering</p>

      {status && (
        <div className={`d-flex align-items-center gap-2 rounded-3 p-3 mb-4 small fw-600 ${isError ? 'is-pill-rejected' : 'is-pill-accepted'}`}>
          {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {status}
        </div>
      )}

      {/* Account summary */}
      <div className="rounded-3 p-3 mb-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}>
        <p className="fw-700 mb-3 small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Account Info</p>
        {imgPreview && (
          <div className="d-flex align-items-center gap-3 mb-3">
            <img src={imgPreview} alt="profile" className="rounded-circle" style={{ width: 52, height: 52, objectFit: 'cover' }} />
            <span className="fw-600" style={{ color: 'var(--text-primary)' }}>{formData.name}</span>
          </div>
        )}
        <Row label="Name"  value={formData.name} />
        <Row label="Email" value={formData.email} />
        <Row label="Role"  value={formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ''} />
      </div>

      {/* Role-specific summary */}
      <div className="rounded-3 p-3 mb-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-glass)' }}>
        <p className="fw-700 mb-3 small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {formData.role === 'influencer' ? 'Creator Details' : 'Brand Details'}
        </p>
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
      </div>

      <div className="d-flex gap-3">
        <button type="button" onClick={() => navigate('/signup/step2')} disabled={submitting}
          className="is-btn is-btn-ghost" style={{ padding: '12px 24px' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="is-btn is-btn-brand flex-grow-1" style={{ padding: '12px', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Creating account…' : 'Confirm & Register'}
        </button>
      </div>
    </div>
  );
}
