import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { User, Mail, Lock, ChevronRight, Zap, Video, Briefcase } from 'lucide-react';

/* Defined OUTSIDE the component so React doesn't remount on every keystroke */
const InputRow = ({ id, name, type, placeholder, Icon, value, onChange, error }) => (
  <div style={{ marginBottom: 12 }}>
    <div className="position-relative">
      <Icon size={14} strokeWidth={1.75}
        style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', zIndex:2 }} />
      <input id={id} name={name} type={type}
        className={`is-input${error ? ' is-input-error' : ''}`}
        placeholder={placeholder} value={value} onChange={onChange}
        style={{ paddingLeft:38, height:44, fontSize:'0.875rem' }} />
    </div>
    {error && <p className="is-error-msg">{error}</p>}
  </div>
);

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
    if (!formData.password)                       e.password = 'Password is required';
    else if (formData.password.length < 6)        e.password = 'Password must be at least 6 characters';
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

  return (
    <div>
      {/* Step badge */}
      <div className="d-flex align-items-center gap-2" style={{ marginBottom:14 }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#5B58EB,#BB63FF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(91,88,235,0.55)', flexShrink:0 }}>
          <Zap size={11} color="#fff" fill="#fff" strokeWidth={1.75} />
        </div>
        <span style={{ fontSize:'0.60rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>
          Step 1 of 3
        </span>
      </div>

      <h2 className="fw-900 display-brand" style={{ fontSize:'1.55rem', color:'var(--text-primary)', letterSpacing:'-0.02em', marginBottom:2 }}>
        Create your account
      </h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:16 }}>
        Already have one?{' '}
        <Link to="/login" style={{ color:'#56E1E9', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
      </p>

      <form onSubmit={handleNext}>
        {/* Name */}
        <label className="is-label" style={{ marginBottom:5 }}>Full Name</label>
        <InputRow id="name" name="name" type="text" placeholder="Jane Smith" Icon={User} value={formData.name || ''} onChange={handleChange} error={errors.name} />

        {/* Email */}
        <label className="is-label" style={{ marginBottom:5, marginTop:4 }}>Email Address</label>
        <InputRow id="email" name="email" type="email" placeholder="you@example.com" Icon={Mail} value={formData.email || ''} onChange={handleChange} error={errors.email} />

        {/* Password */}
        <label className="is-label" style={{ marginBottom:5, marginTop:4 }}>Password</label>
        <InputRow id="password" name="password" type="password" placeholder="Min. 6 characters" Icon={Lock} value={formData.password || ''} onChange={handleChange} error={errors.password} />

        {/* Role selector */}
        <div style={{ marginTop:12, marginBottom:12 }}>
          <label className="is-label" style={{ marginBottom:6 }}>I am a</label>
          <div className="d-flex gap-2">
            {[
              { role:'influencer', Icon:Video,     label:'Creator' },
              { role:'sponsor',    Icon:Briefcase, label:'Sponsor' },
            ].map(({ role, Icon, label }) => (
              <button key={role} type="button"
                onClick={() => { updateFormData({ role }); if (errors.role) setErrors(p => ({ ...p, role:undefined })); }}
                style={{
                  flex:1, padding:'10px 8px', borderRadius:11,
                  border:`1.5px solid ${formData.role===role ? '#5B58EB' : 'var(--border-glass)'}`,
                  background: formData.role===role ? 'rgba(91,88,235,0.13)' : 'var(--bg-input)',
                  color: formData.role===role ? '#56E1E9' : 'var(--text-secondary)',
                  transition:'var(--transition)', cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  fontWeight:700, fontSize:'0.82rem',
                  boxShadow: formData.role===role ? '0 0 14px rgba(91,88,235,0.30)' : 'none',
                }}>
                <Icon size={18} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
          {errors.role && <p className="is-error-msg mt-1">{errors.role}</p>}
        </div>

        {/* Terms */}
        <div className="d-flex align-items-start gap-2" style={{ marginBottom:14 }}>
          <input type="checkbox" id="terms" checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms:undefined })); }}
            style={{ accentColor:'#5B58EB', width:15, height:15, marginTop:2, flexShrink:0 }} />
          <label htmlFor="terms" style={{ color:'var(--text-secondary)', fontSize:'0.80rem', lineHeight:1.5 }}>
            I agree to the{' '}
            <a href="/terms" style={{ color:'#5B58EB', fontWeight:600, textDecoration:'none' }}>Terms</a>{' '}and{' '}
            <a href="/privacy" style={{ color:'#5B58EB', fontWeight:600, textDecoration:'none' }}>Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <p className="is-error-msg" style={{ marginBottom:8 }}>{errors.terms}</p>}

        <button type="submit" className="is-btn is-btn-brand w-100" style={{ padding:'12px', fontSize:'0.9rem' }}>
          Continue <ChevronRight size={15} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
