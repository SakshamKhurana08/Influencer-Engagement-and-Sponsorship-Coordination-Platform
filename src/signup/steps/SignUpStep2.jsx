import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { ChevronRight, ChevronLeft, Upload, Zap } from 'lucide-react';

/* Defined OUTSIDE the component so React doesn't remount on every keystroke */
const Field = ({ name, label, type = 'text', placeholder, value, onChange, error }) => (
  <div style={{ marginBottom:12 }}>
    <label className="is-label" style={{ marginBottom:5 }}>{label}</label>
    <input name={name} type={type}
      className={`is-input${error ? ' is-input-error' : ''}`}
      placeholder={placeholder} value={value}
      onChange={onChange}
      min={type === 'number' ? 1 : undefined}
      style={{ height:44, fontSize:'0.875rem' }} />
    {error && <p className="is-error-msg">{error}</p>}
  </div>
);

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

  /* Inline Field definition removed — now defined at module level above */

  return (
    <div>
      {/* Step badge */}
      <div className="d-flex align-items-center gap-2" style={{ marginBottom:14 }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#5B58EB,#BB63FF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(91,88,235,0.55)', flexShrink:0 }}>
          <Zap size={11} color="#fff" fill="#fff" strokeWidth={1.75} />
        </div>
        <span style={{ fontSize:'0.60rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Step 2 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand" style={{ fontSize:'1.55rem', color:'var(--text-primary)', letterSpacing:'-0.02em', marginBottom:2 }}>
        {formData.role === 'influencer' ? 'Creator Details' : 'Brand Details'}
      </h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:16 }}>
        {formData.role === 'influencer'
          ? 'Tell brands about your content and reach'
          : 'Tell influencers about your company'}
      </p>

      <form onSubmit={handleNext}>
        {formData.role === 'influencer' ? (
          <>
            <Field name="category" label="Content Category" placeholder="e.g. Fashion, Tech, Food" value={formData.category || ''} onChange={handleChange} error={errors.category} />
            <Field name="niche"    label="Your Niche"       placeholder="e.g. Streetwear, AI Tools"   value={formData.niche    || ''} onChange={handleChange} error={errors.niche} />
            <Field name="reach"    label="Total Reach (followers)" type="number" placeholder="50000"  value={formData.reach    || ''} onChange={handleChange} error={errors.reach} />

            {/* Photo upload — compact */}
            <div style={{ marginBottom:14 }}>
              <label className="is-label" style={{ marginBottom:5 }}>Profile Photo <span style={{ fontWeight:500, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
              <label htmlFor="profileImage" style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderRadius:12,
                border:`1.5px dashed ${preview ? '#5B58EB' : 'var(--border-glass)'}`,
                background:'var(--bg-input)', cursor:'pointer',
                transition:'var(--transition)',
                boxShadow: preview ? '0 0 12px rgba(91,88,235,0.28)' : 'none',
              }}>
                {preview
                  ? <img src={preview} alt="preview" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                  : <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Upload size={17} color="#fff" strokeWidth={1.75} />
                    </div>
                }
                <div>
                  <p className="mb-0 fw-700" style={{ color:'var(--text-primary)', fontSize:'0.84rem' }}>
                    {preview ? 'Change photo' : 'Upload a photo'}
                  </p>
                  <p className="mb-0" style={{ color:'var(--text-muted)', fontSize:'0.74rem' }}>PNG, JPG up to 10 MB</p>
                </div>
              </label>
              <input id="profileImage" type="file" accept="image/*" className="d-none" onChange={handleFile} />
            </div>
          </>
        ) : (
          <>
            <Field name="company"  label="Company Name"         placeholder="Acme Corp."          value={formData.company  || ''} onChange={handleChange} error={errors.company} />
            <Field name="industry" label="Industry"             placeholder="e.g. Retail, Software" value={formData.industry || ''} onChange={handleChange} error={errors.industry} />
            <Field name="budget"   label="Campaign Budget (₹)"  type="number" placeholder="50000"  value={formData.budget   || ''} onChange={handleChange} error={errors.budget} />
          </>
        )}

        <div className="d-flex gap-2" style={{ marginTop:16 }}>
          <button type="button" onClick={() => navigate('/signup/step1')}
            className="is-btn is-btn-ghost" style={{ padding:'11px 20px', fontSize:'0.875rem' }}>
            <ChevronLeft size={15} strokeWidth={1.75} /> Back
          </button>
          <button type="submit" className="is-btn is-btn-brand" style={{ flex:1, padding:'11px', fontSize:'0.875rem' }}>
            Continue <ChevronRight size={15} strokeWidth={1.75} />
          </button>
        </div>
      </form>
    </div>
  );
}
