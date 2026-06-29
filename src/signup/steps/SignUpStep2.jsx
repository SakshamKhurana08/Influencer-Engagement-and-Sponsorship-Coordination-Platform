import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../SignUpContext';
import { ChevronRight, ChevronLeft, Upload, Zap, ChevronDown, X as XIcon } from 'lucide-react';

/* ── Preset options ── */
const CATEGORIES = ['Beauty','Tech','Fitness','Food','Travel','Fashion','Lifestyle','Photography','Gaming','Finance','Education','Health','Music','Sports','Automotive'];
const NICHES = ['Streetwear','AI Tools','Skincare','Vegan Food','Budget Travel','Sneakers','Home Decor','Portrait Photography','Mobile Gaming','Personal Finance','Online Courses','Mental Health','Lo-fi Music','Football','Electric Vehicles'];
const INDUSTRIES = ['Retail','Software','Healthcare','Finance','Education','Media','Real Estate','Travel','Food & Beverage','Fashion','Technology','Automotive','Entertainment','Consulting','Non-profit'];

/* Reusable combobox: shows dropdown + lets user type a custom value */
function ComboBox({ name, label, options, value, onSelect, error, placeholder }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleInput = (e) => {
    setQuery(e.target.value);
    onSelect(name, e.target.value); // live update formData as user types
    setOpen(true);
  };

  const pick = (opt) => {
    onSelect(name, opt);
    setQuery('');
    setOpen(false);
  };

  const clear = () => { onSelect(name, ''); setQuery(''); };

  return (
    <div style={{ marginBottom:12, position:'relative' }} ref={ref}>
      <label className="is-label" style={{ marginBottom:5 }}>{label}</label>
      <div className="position-relative">
        <input
          className={`is-input${error ? ' is-input-error' : ''}`}
          placeholder={placeholder}
          value={value || query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          style={{ height:44, fontSize:'0.875rem', paddingRight:64 }}
          autoComplete="off"
        />
        <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:4 }}>
          {value && (
            <button type="button" onClick={clear} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:2, display:'flex' }}>
              <XIcon size={13} strokeWidth={2} />
            </button>
          )}
          <button type="button" onClick={() => setOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:2, display:'flex' }}>
            <ChevronDown size={15} strokeWidth={1.75} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
          </button>
        </div>
      </div>
      {error && <p className="is-error-msg">{error}</p>}

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:1000,
          background:'var(--bg-panel)', border:'1px solid var(--border-glass)',
          borderRadius:12, overflow:'hidden',
          boxShadow:'0 12px 40px rgba(0,0,0,0.55)',
          maxHeight:200, overflowY:'auto',
        }}>
          {filtered.length === 0 ? (
            <div
              style={{ padding:'10px 14px', fontSize:'0.83rem', color:'var(--text-muted)', cursor:'pointer' }}
              onMouseDown={() => { pick(query); }}>
              Use "<strong style={{ color:'var(--text-primary)' }}>{query}</strong>" as custom value
            </div>
          ) : (
            <>
              {filtered.map(opt => (
                <div key={opt} onMouseDown={() => pick(opt)}
                  style={{
                    padding:'9px 14px', fontSize:'0.84rem', cursor:'pointer',
                    color: opt === value ? '#22D3EE' : 'var(--text-primary)',
                    background: opt === value ? 'rgba(99,102,241,0.12)' : 'transparent',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background=opt === value ? 'rgba(99,102,241,0.12)' : 'transparent'}>
                  {opt}
                </div>
              ))}
              {query && !options.includes(query) && (
                <div onMouseDown={() => pick(query)}
                  style={{ padding:'9px 14px', fontSize:'0.83rem', cursor:'pointer', color:'#22D3EE', borderTop:'1px solid var(--border-glass)' }}>
                  + Add "<strong>{query}</strong>"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* Plain number/text field */
const Field = ({ name, label, type='text', placeholder, value, onChange, error }) => (
  <div style={{ marginBottom:12 }}>
    <label className="is-label" style={{ marginBottom:5 }}>{label}</label>
    <input name={name} type={type}
      className={`is-input${error ? ' is-input-error' : ''}`}
      placeholder={placeholder} value={value} onChange={onChange}
      min={type==='number' ? 1 : undefined}
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

  const handleCombo = (name, value) => {
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

  return (
    <div>
      {/* Step badge */}
      <div className="d-flex align-items-center gap-2" style={{ marginBottom:14 }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(99,102,241,0.55)', flexShrink:0 }}>
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
            <ComboBox
              name="category" label="Content Category"
              options={CATEGORIES} value={formData.category || ''}
              onSelect={handleCombo} error={errors.category}
              placeholder="Select or type a category…" />

            <ComboBox
              name="niche" label="Your Niche"
              options={NICHES} value={formData.niche || ''}
              onSelect={handleCombo} error={errors.niche}
              placeholder="Select or type a niche…" />

            <Field name="reach" label="Total Reach (followers)" type="number" placeholder="50000"
              value={formData.reach || ''} onChange={handleChange} error={errors.reach} />

            {/* Photo upload */}
            <div style={{ marginBottom:14 }}>
              <label className="is-label" style={{ marginBottom:5 }}>
                Profile Photo{' '}
                <span style={{ fontWeight:500, textTransform:'none', letterSpacing:0 }}>(optional)</span>
              </label>
              <label htmlFor="profileImage" style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderRadius:12, border:`1.5px dashed ${preview ? '#6366F1' : 'var(--border-glass)'}`,
                background:'var(--bg-input)', cursor:'pointer', transition:'var(--transition)',
                boxShadow: preview ? '0 0 12px rgba(99,102,241,0.28)' : 'none',
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
            <Field name="company" label="Company Name" placeholder="Acme Corp."
              value={formData.company || ''} onChange={handleChange} error={errors.company} />

            <ComboBox
              name="industry" label="Industry"
              options={INDUSTRIES} value={formData.industry || ''}
              onSelect={handleCombo} error={errors.industry}
              placeholder="Select or type an industry…" />

            <Field name="budget" label="Campaign Budget (₹)" type="number" placeholder="50000"
              value={formData.budget || ''} onChange={handleChange} error={errors.budget} />
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
