import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { ChevronRight, ChevronLeft, Upload, Zap } from 'lucide-react';

export default function SignUpStep2() {
  const { formData, updateFormData, profileImageFile, updateProfileImageFile } = useSignup();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (profileImageFile instanceof File) {
      const url = URL.createObjectURL(profileImageFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [profileImageFile]);

  const validate = () => {
    const e = {};
    if (formData.role === 'influencer') {
      if (!formData.category?.trim()) e.category = 'Category required';
      if (!formData.niche?.trim())    e.niche    = 'Niche required';
      if (!formData.reach || +formData.reach <= 0) e.reach = 'Valid reach required';
    } else {
      if (!formData.company?.trim())  e.company  = 'Company name required';
      if (!formData.industry?.trim()) e.industry = 'Industry required';
      if (!formData.budget || +formData.budget <= 0) e.budget = 'Valid budget required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) updateProfileImageFile(file);
    e.target.value = null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) navigate('/signup/step3');
  };

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div className="mb-4">
      <label className="is-label">{label}</label>
      <input
        name={name} type={type}
        className={`is-input${errors[name] ? ' is-input-error' : ''}`}
        placeholder={placeholder} value={formData[name] || ''}
        onChange={handleChange}
        min={type === 'number' ? 1 : undefined}
      />
      {errors[name] && <p className="is-error-msg">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="is-card p-4 p-md-5">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow-btn)' }}>
          <Zap size={13} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Step 2 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand mb-1" style={{ fontSize: '1.9rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {formData.role === 'influencer' ? 'Creator Details' : 'Brand Details'}
      </h2>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {formData.role === 'influencer'
          ? 'Tell brands about your content and reach'
          : 'Tell influencers about your company'}
      </p>

      <form onSubmit={handleNext}>
        {formData.role === 'influencer' ? (
          <>
            <Field name="category" label="Content Category" placeholder="e.g. Fashion, Tech, Food" />
            <Field name="niche"    label="Your Niche"       placeholder="e.g. Streetwear, AI Tools" />
            <Field name="reach"    label="Total Reach (followers)" type="number" placeholder="50000" />

            <div className="mb-4">
              <label className="is-label">Profile Photo (optional)</label>
              <label
                htmlFor="profileImage"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                  borderRadius: 14,
                  border: `2px dashed ${preview ? 'var(--brand-1)' : 'var(--border-glass)'}`,
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: preview ? 'var(--brand-glow-btn)' : 'none',
                }}
              >
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={20} color="#fff" />
                  </div>
                )}
                <div>
                  <p className="mb-0 fw-700" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {preview ? 'Change photo' : 'Upload a photo'}
                  </p>
                  <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>PNG, JPG up to 10 MB</p>
                </div>
              </label>
              <input id="profileImage" type="file" accept="image/*" className="d-none" onChange={handleFile} />
            </div>
          </>
        ) : (
          <>
            <Field name="company"  label="Company Name"         placeholder="Acme Corp." />
            <Field name="industry" label="Industry"             placeholder="e.g. Retail, Software" />
            <Field name="budget"   label="Campaign Budget (₹)" type="number" placeholder="50000" />
          </>
        )}

        <div className="d-flex gap-3 mt-2">
          <button type="button" onClick={() => navigate('/signup/step1')} className="is-btn is-btn-ghost" style={{ padding: '12px 24px' }}>
            <ChevronLeft size={16} /> Back
          </button>
          <button type="submit" className="is-btn is-btn-brand" style={{ flex: 1, padding: '12px' }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
