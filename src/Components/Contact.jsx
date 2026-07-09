import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, MapPin, ArrowLeft, Send,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Navbar from './Navbar';

const CONTACT_INFO = [
  { Icon: Mail,   label: 'Email',         value: 'support@insync.dev', href: 'mailto:support@insync.dev', color: '#22D3EE' },
  { Icon: MapPin, label: 'Location',      value: 'New Delhi, India',   href: null,                        color: '#6366F1' },
  { Icon: Clock,  label: 'Response Time', value: 'Within 24 hours',    href: null,                        color: '#C084FC' },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]   = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setStatus('error'); return; }
    setSending(true); setStatus('');
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-app)', position: 'relative',
    }}>
      <div className="is-page-orb-c" aria-hidden="true" />
      <Navbar />

      {/* ── Content — fills remaining height, no scroll ── */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: '0 var(--section-px)',
      }}>

        {/* Back link */}
        <div style={{ paddingTop: 14, paddingBottom: 12, flexShrink: 0 }}>
          <Link to="/" className="is-btn is-btn-ghost text-decoration-none d-inline-flex"
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <ArrowLeft size={13} strokeWidth={1.75} /> Home
          </Link>
        </div>

        {/* Two columns */}
        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '2.5rem',
          alignItems: 'center',
          paddingBottom: 24,
        }}>

          {/* ── Left ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Heading */}
            <div>
              <p style={{ fontSize: '0.60rem', fontWeight: 800, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Get in touch
              </p>
              <h1 className="display-brand" style={{
                fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', color: 'var(--text-primary)',
                lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 8,
              }}>
                We'd love to<br />
                <span className="is-gradient-text">hear from you.</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0, maxWidth: 360 }}>
                Have a question about the platform or a campaign?
                Drop us a message and we'll get back to you.
              </p>
            </div>

            {/* Info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CONTACT_INFO.map(({ Icon, label, value, href, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-surface)', backdropFilter: 'var(--glass-blur)',
                  border: `1px solid ${color}22`, borderRadius: 12, padding: '10px 14px',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} color={color} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.57rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.10em', color: 'var(--text-muted)', marginBottom: 1 }}>
                      {label}
                    </p>
                    {href
                      ? <a href={href} style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
                      : <p style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, margin: 0 }}>{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="is-card" style={{ padding: '28px 32px' }}>

            <div style={{ marginBottom: 18 }}>
              <h2 className="display-brand" style={{
                fontSize: '1.25rem', color: 'var(--text-primary)',
                fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 3,
              }}>
                Send a Message
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.79rem', margin: 0 }}>
                We'll respond within 24 hours.
              </p>
            </div>

            {status === 'success' && (
              <div className="d-flex align-items-center gap-2 rounded-3 p-2 mb-3 fw-700"
                style={{ fontSize: '0.80rem', background: 'var(--pill-accepted)', color: 'var(--pill-accepted-text)' }}>
                <CheckCircle2 size={14} strokeWidth={1.75} /> Message sent! We'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className="d-flex align-items-center gap-2 rounded-3 p-2 mb-3 fw-700"
                style={{ fontSize: '0.80rem', background: 'var(--pill-rejected)', color: 'var(--pill-rejected-text)' }}>
                <AlertCircle size={14} strokeWidth={1.75} /> Please fill in your name, email, and message.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="is-label">Full Name *</label>
                  <input name="name" className="is-input" placeholder="Jane Smith"
                    value={form.name} onChange={handleChange} required style={{ height: 40 }} />
                </div>
                <div>
                  <label className="is-label">Email *</label>
                  <input name="email" type="email" className="is-input" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} required style={{ height: 40 }} />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="is-label">Subject</label>
                <input name="subject" className="is-input" placeholder="e.g. Campaign enquiry, Bug report…"
                  value={form.subject} onChange={handleChange} style={{ height: 40 }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="is-label">Message *</label>
                <textarea name="message" className="is-input" rows={3}
                  placeholder="Describe your question or feedback…"
                  value={form.message} onChange={handleChange} required
                  style={{ resize: 'none', paddingTop: 10 }} />
              </div>

              <button type="submit" className="is-btn is-btn-brand w-100"
                style={{ padding: '11px', fontSize: '0.88rem' }} disabled={sending}>
                {sending ? 'Sending…' : <><Send size={14} strokeWidth={1.75} /> Send Message</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
