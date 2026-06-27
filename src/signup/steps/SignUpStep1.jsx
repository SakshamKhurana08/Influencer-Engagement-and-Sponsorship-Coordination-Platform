import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { User, Mail, Lock, ChevronRight } from 'lucide-react';

export default function SignUpStep1() {
  const { formData, updateFormData } = useSignup();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.name?.trim())   e.name  = 'Name is required';
    if (!formData.email?.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Valid email required';
    if (!formData.password)       e.password = 'Password is required';
    if (!formData.role)           e.role = 'Please select a role';
    if (!agreed)                  e.terms = 'You must agree to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) navigate('/signup/step2');
  };

  return (
    <div className="is-card p-4 p-md-5">
      <h2 className="fw-800 mb-1" style={{ color: 'var(--text-primary)', fontSize: '1.7rem' }}>Create your account</h2>
      <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Step 1 of 3 — Basic information</p>

      <form onSubmit={handleNext}>
        {/* Name */}
        <div className="mb-3">
          <label className="is-label">Full Name</label>
          <div className="position-relative">
            <User size={15} className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input name="name" type="text" className={`is-input ${errors.name ? 'is-input-error' : ''}`}
              placeholder="Jane Smith" value={formData.name || ''} onChange={handleChange}
              style={{ paddingLeft: 38 }} />
          </div>
          {errors.name && <p className="is-error-msg">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="is-label">Email Address</label>
          <div className="position-relative">
            <Mail size={15} className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input name="email" type="email" className={`is-input ${errors.email ? 'is-input-error' : ''}`}
              placeholder="you@example.com" value={formData.email || ''} onChange={handleChange}
              style={{ paddingLeft: 38 }} />
          </div>
          {errors.email && <p className="is-error-msg">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="is-label">Password</label>
          <div className="position-relative">
            <Lock size={15} className="position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input name="password" type="password" className={`is-input ${errors.password ? 'is-input-error' : ''}`}
              placeholder="Choose a secure password" value={formData.password || ''} onChange={handleChange}
              style={{ paddingLeft: 38 }} />
          </div>
          {errors.password && <p className="is-error-msg">{errors.password}</p>}
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="is-label">I am a…</label>
          <div className="d-flex gap-3">
            {['influencer', 'sponsor'].map(role => (
              <button
                key={role} type="button"
                onClick={() => { updateFormData({ role }); if (errors.role) setErrors(p => ({ ...p, role: undefined })); }}
                className="flex-fill py-3 rounded-3 fw-600 text-capitalize"
                style={{
                  border: `2px solid ${formData.role === role ? 'var(--brand-1)' : 'var(--border-glass)'}`,
                  background: formData.role === role ? 'rgba(230,0,35,0.06)' : 'var(--input-bg)',
                  color: formData.role === role ? 'var(--brand-1)' : 'var(--text-secondary)',
                  transition: 'var(--transition)', cursor: 'pointer',
                }}
              >
                {role}
              </button>
            ))}
          </div>
          {errors.role && <p className="is-error-msg">{errors.role}</p>}
        </div>

        {/* Terms */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <input type="checkbox" id="terms" checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: undefined })); }}
            style={{ accentColor: 'var(--brand-1)', width: 16, height: 16 }} />
          <label htmlFor="terms" className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
            I agree to the <a href="/terms" style={{ color: 'var(--brand-1)' }}>Terms</a> and <a href="/privacy" style={{ color: 'var(--brand-1)' }}>Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <p className="is-error-msg mt-n3 mb-3">{errors.terms}</p>}

        <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding: '12px' }}>
          Continue <ChevronRight size={16} />
        </button>
      </form>
    </div>
  );
}
