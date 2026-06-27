import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { User, Mail, Lock, ChevronRight, Zap, Video, Briefcase } from 'lucide-react';

export default function SignUpStep1() {
  const { formData, updateFormData } = useSignup();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.name?.trim())  e.name     = 'Name is required';
    if (!formData.email?.trim() || !/\S+@\S+\.\S+/.test(formData.email))
                                  e.email    = 'Valid email required';
    if (!formData.password)       e.password = 'Password is required';
    if (!formData.role)           e.role     = 'Select a role to continue';
    if (!agreed)                  e.terms    = 'You must agree to continue';
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

  const InputRow = ({ id, name, type, placeholder, Icon, value, error }) => (
    <div className="mb-4">
      <div className="position-relative">
        <Icon
          size={15}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 2 }}
        />
        <input
          id={id} name={name} type={type}
          className={`is-input${error ? ' is-input-error' : ''}`}
          placeholder={placeholder} value={value} onChange={handleChange}
          style={{ paddingLeft: 40 }}
        />
      </div>
      {error && <p className="is-error-msg">{error}</p>}
    </div>
  );

  return (
    <div className="is-card p-4 p-md-5">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--brand-glow-btn)' }}>
          <Zap size={13} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Step 1 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand mb-1" style={{ fontSize: '1.9rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        Create your account
      </h2>
      <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Already have one?{' '}
        <Link to="/login" style={{ color: 'var(--brand-1)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>

      <form onSubmit={handleNext}>
        <label className="is-label">Full Name</label>
        <InputRow id="name" name="name" type="text" placeholder="Jane Smith" Icon={User} value={formData.name || ''} error={errors.name} />

        <label className="is-label">Email Address</label>
        <InputRow id="email" name="email" type="email" placeholder="you@example.com" Icon={Mail} value={formData.email || ''} error={errors.email} />

        <label className="is-label">Password</label>
        <InputRow id="password" name="password" type="password" placeholder="Choose a secure password" Icon={Lock} value={formData.password || ''} error={errors.password} />

        <div className="mb-4">
          <label className="is-label">I am a</label>
          <div className="d-flex gap-3">
            {[
              { role: 'influencer', Icon: Video,     label: 'Creator' },
              { role: 'sponsor',    Icon: Briefcase, label: 'Sponsor' },
            ].map(({ role, Icon, label }) => (
              <button
                key={role} type="button"
                onClick={() => { updateFormData({ role }); if (errors.role) setErrors(p => ({ ...p, role: undefined })); }}
                style={{
                  flex: 1, padding: '14px 12px',
                  borderRadius: 14,
                  border: `1.5px solid ${formData.role === role ? 'var(--brand-1)' : 'var(--border-glass)'}`,
                  background: formData.role === role ? 'rgba(230,0,35,0.07)' : 'var(--bg-input)',
                  color: formData.role === role ? 'var(--brand-1)' : 'var(--text-secondary)',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  fontWeight: 700, fontSize: '0.875rem',
                  boxShadow: formData.role === role ? 'var(--brand-glow-btn)' : 'none',
                }}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
          {errors.role && <p className="is-error-msg mt-2">{errors.role}</p>}
        </div>

        <div className="d-flex align-items-start gap-2 mb-4">
          <input
            type="checkbox" id="terms" checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: undefined })); }}
            style={{ accentColor: 'var(--brand-1)', width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
          />
          <label htmlFor="terms" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="/terms" style={{ color: 'var(--brand-1)', fontWeight: 600, textDecoration: 'none' }}>Terms</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: 'var(--brand-1)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <p className="is-error-msg mb-3">{errors.terms}</p>}

        <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding: '14px', fontSize: '0.95rem' }}>
          Continue <ChevronRight size={16} />
        </button>
      </form>
    </div>
  );
}
