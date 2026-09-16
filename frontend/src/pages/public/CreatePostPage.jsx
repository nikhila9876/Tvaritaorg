import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Image, X, Loader2, AlertCircle, CheckCircle2, MapPin, Palette, ArrowLeft } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { community } from '../../api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { value: 'artwork', label: '🎨 Artwork' },
  { value: 'experience', label: '✨ Experience' },
  { value: 'workshop', label: '🏺 Workshop' },
  { value: 'story', label: '📖 Artist Story' },
  { value: 'tradition', label: '🪔 Tradition' },
];

const ART_FORMS = [
  'Madhubani Painting',
  'Warli Art',
  'Kalamkari',
  'Kuchipudi',
  'Gond Painting',
  'Pattachitra',
  'Baul Music & Philosophy',
  'Kathakali',
  'Tholu Bommalata',
  'Kondapalli Toys',
  'Mithila Painting',
  'Folk Art',
  'Traditional Craft',
  'Other',
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    artForm: '',
    category: 'experience',
    location: '',
    authorName: user?.name || '',
    authorRole: user?.role || 'participant',
  });
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaInputs, setMediaInputs] = useState(['']); // URL input fields
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.content.trim()) errs.content = 'Please share your experience or story.';
    if (form.content.trim().length < 20) errs.content = 'Please write at least 20 characters.';
    if (!form.authorName.trim()) errs.authorName = 'Please enter your name.';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(e => ({ ...e, [field]: null }));
  };

  const handleMediaUrlAdd = () => {
    setMediaInputs(inputs => [...inputs, '']);
  };

  const handleMediaUrlChange = (idx, value) => {
    setMediaInputs(inputs => inputs.map((v, i) => i === idx ? value : v));
  };

  const handleMediaUrlRemove = (idx) => {
    setMediaInputs(inputs => inputs.filter((_, i) => i !== idx));
  };

  const handleMediaUrlCommit = (idx) => {
    const url = mediaInputs[idx]?.trim();
    if (url && !mediaUrls.includes(url)) {
      setMediaUrls(urls => [...urls, url]);
    }
    setMediaInputs(inputs => inputs.map((v, i) => i === idx ? '' : v));
  };

  const removeMedia = (url) => {
    setMediaUrls(urls => urls.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    // Collect any uncommitted URL inputs
    const pendingUrls = mediaInputs.filter(u => u.trim()).map(u => u.trim());
    const allMedia = [...new Set([...mediaUrls, ...pendingUrls])];

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim() || undefined,
        content: form.content.trim(),
        mediaUrls: allMedia,
        artForm: form.artForm || undefined,
        category: form.category,
        location: form.location.trim() || undefined,
        authorName: form.authorName.trim() || (user?.name || 'Cultural Contributor'),
        authorRole: form.authorRole,
        authorAvatar: user?.avatar || undefined,
      };
      const res = await community.createPost(payload);
      setSuccess(true);
      const postId = res?.data?.id || res?.data?.post?.id;
      setTimeout(() => {
        if (postId) navigate(`/community/posts/${postId}`);
        else navigate('/community');
      }, 1800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <div style={{
          minHeight: '70vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: 'var(--space-8)',
        }}>
          <CheckCircle2 size={64} color="var(--color-success)" style={{ marginBottom: 24 }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', marginBottom: 12 }}>
            Shared with the Community!
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-lg)' }}>
            Your cultural story is now part of the Tvarita living archive.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Back link */}
        <Link
          to="/community"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--color-muted)', textDecoration: 'none',
            fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)',
          }}
        >
          <ArrowLeft size={14} /> Back to Community
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))',
            fontWeight: 700, color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>Share Your Cultural Story</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)' }}>
            Document your artwork, workshop experience, or cultural discovery with the Tvarita community.
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Author name (only shown if not authenticated) */}
            {!user && (
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <label style={labelStyle}>Your Name *</label>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={e => handleChange('authorName', e.target.value)}
                  placeholder="Your name"
                  style={{ ...inputStyle, borderColor: fieldErrors.authorName ? 'var(--color-error)' : 'var(--color-border)' }}
                />
                {fieldErrors.authorName && <p style={errStyle}>{fieldErrors.authorName}</p>}
              </div>
            )}

            {/* Category */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleChange('category', c.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '2px solid',
                      borderColor: form.category === c.value ? 'var(--color-primary)' : 'var(--color-border)',
                      background: form.category === c.value ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: form.category === c.value ? '#fff' : 'var(--color-text)',
                      cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)',
                    }}
                  >{c.label}</button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={labelStyle}>Title <span style={{ color: 'var(--color-muted)' }}>(optional)</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="A descriptive title for your post…"
                maxLength={120}
                style={inputStyle}
              />
              <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 4 }}>
                {form.title.length}/120
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={labelStyle}>Your Story *</label>
              <textarea
                value={form.content}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="Share your cultural experience, the story behind your artwork, what you learned at the workshop, or any tradition you'd like to document…"
                rows={6}
                maxLength={2000}
                style={{
                  ...inputStyle,
                  resize: 'vertical', minHeight: 140,
                  borderColor: fieldErrors.content ? 'var(--color-error)' : 'var(--color-border)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {fieldErrors.content ? <p style={errStyle}>{fieldErrors.content}</p> : <span />}
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{form.content.length}/2000</span>
              </div>
            </div>

            {/* Art Form */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={labelStyle}>
                <Palette size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Art Form <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
              </label>
              <select
                value={form.artForm}
                onChange={e => handleChange('artForm', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select art form…</option>
                {ART_FORMS.map(af => <option key={af} value={af}>{af}</option>)}
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={labelStyle}>
                <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Location <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                placeholder="e.g. Jitwarpur, Bihar or Mumbai, Maharashtra"
                style={inputStyle}
              />
            </div>

            {/* Media URLs */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={labelStyle}>
                <Image size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Image URLs <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
              </label>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 8 }}>
                Paste image URLs from your portfolio, Google Drive, or image hosting service.
              </p>

              {/* Committed media previews */}
              {mediaUrls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {mediaUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                      <img
                        src={url}
                        alt=""
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(url)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--color-error)', color: '#fff',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      ><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* URL input fields */}
              {mediaInputs.map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="url"
                    value={url}
                    onChange={e => handleMediaUrlChange(idx, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleMediaUrlCommit(idx)}
                    disabled={!url.trim()}
                    style={{
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary)',
                      color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      opacity: url.trim() ? 1 : 0.5,
                    }}
                  >Add</button>
                  {mediaInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleMediaUrlRemove(idx)}
                      style={{
                        padding: '0 10px', borderRadius: 'var(--radius-md)',
                        background: 'none', border: '1px solid var(--color-border)',
                        cursor: 'pointer', color: 'var(--color-muted)',
                      }}
                    ><X size={12} /></button>
                  )}
                </div>
              ))}

              {mediaInputs.length < 4 && (
                <button
                  type="button"
                  onClick={handleMediaUrlAdd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 14px',
                    cursor: 'pointer', color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
                  }}
                >
                  <Image size={13} /> Add another image URL
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}>
                <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: loading ? 'var(--color-muted)' : 'var(--color-primary)',
                color: '#fff', border: 'none', cursor: loading ? 'default' : 'pointer',
                fontWeight: 700, fontSize: 'var(--text-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background 0.2s',
              }}
            >
              {loading ? <><Loader2 size={18} className="spin" /> Publishing…</> : 'Publish to Community'}
            </button>
          </form>
        </div>

        {/* Contribution note */}
        <p style={{
          textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-muted)',
          marginTop: 'var(--space-4)', lineHeight: 1.7,
        }}>
          Your post becomes part of the Tvarita living cultural archive.
          Please share only authentic cultural experiences and original content.
          Posts are visible to all community members.
        </p>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </PublicLayout>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: 6,
};
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: 'var(--text-sm)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
  boxSizing: 'border-box',
};
const errStyle = {
  color: 'var(--color-error)',
  fontSize: 'var(--text-xs)',
  marginTop: 4,
  marginBottom: 0,
};
