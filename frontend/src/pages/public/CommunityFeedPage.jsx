import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, Flag, Plus, Filter,
  AlertCircle, Loader2, Users, RefreshCw, MapPin, Palette,
  ChevronDown, X, BookOpen
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { community } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* ─── Constants ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: '', label: 'All Posts' },
  { value: 'artwork', label: 'Artwork' },
  { value: 'experience', label: 'Experiences' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'story', label: 'Artist Stories' },
  { value: 'tradition', label: 'Traditions' },
];

const ART_FORMS = [
  'All Art Forms',
  'Madhubani Painting',
  'Warli Art',
  'Kalamkari',
  'Kuchipudi',
  'Gond Painting',
  'Pattachitra',
  'Baul Music & Philosophy',
  'Kathakali',
];

const ROLE_COLORS = {
  artist: { bg: '#FFF3E0', text: '#E65100', label: 'Artist' },
  corporate: { bg: '#E3F2FD', text: '#1565C0', label: 'Corporate' },
  admin: { bg: '#F3E5F5', text: '#6A1B9A', label: 'NGO Team' },
  participant: { bg: '#E8F5E9', text: '#2E7D32', label: 'Participant' },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function timeAgo(date) {
  const d = date instanceof Date ? date : new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RoleBadge({ role }) {
  const r = ROLE_COLORS[role] || ROLE_COLORS.participant;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      background: r.bg,
      color: r.text,
    }}>{r.label}</span>
  );
}

function Avatar({ src, name, size = 40 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TC';
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--color-primary)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 36 ? 'var(--text-sm)' : 'var(--text-xs)', fontWeight: 700,
    }}>{initials}</div>
  );
}

/* ─── Post Card ──────────────────────────────────────────────────── */
function PostCard({ post, onLike, onReport }) {
  const [liked, setLiked] = useState(post.isLikedByMe || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [liking, setLiking] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await onLike(post.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    } finally {
      setLiking(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      await onReport(post.id, { reason: reportReason, details: '' });
      setReported(true);
      setShowReport(false);
    } catch {
      // silently fail
    } finally {
      setReporting(false);
    }
  };

  const media = post.mediaUrls || [];

  return (
    <article style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      marginBottom: 'var(--space-6)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      {/* Media */}
      {media.length > 0 && (
        <Link to={`/community/posts/${post.id}`} style={{ display: 'block' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: media.length >= 2 ? '1fr 1fr' : '1fr',
            gap: 2,
            maxHeight: 360,
            overflow: 'hidden',
          }}>
            {media.slice(0, 2).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: media.length >= 2 ? 240 : 320,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ))}
          </div>
          {media.length > 2 && (
            <div style={{
              background: 'var(--color-surface-2)',
              textAlign: 'center',
              padding: '4px',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-muted)',
            }}>+{media.length - 2} more images</div>
          )}
        </Link>
      )}

      {/* Content */}
      <div style={{ padding: 'var(--space-5)' }}>
        {/* Author Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Avatar src={post.authorAvatar} name={post.authorName} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                {post.authorName}
              </span>
              <RoleBadge role={post.authorRole} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 2 }}>
              {timeAgo(post.createdAt)}
              {post.location && (
                <span> · <MapPin size={10} style={{ verticalAlign: 'middle', display: 'inline' }} /> {post.location}</span>
              )}
            </div>
          </div>
          {post.artForm && (
            <span style={{
              display: 'none',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              background: 'var(--color-surface-2)',
              color: 'var(--color-primary)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              '@media (min-width: 600px)': { display: 'inline-block' }
            }}>
              <Palette size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {post.artForm}
            </span>
          )}
        </div>

        {/* Art form tag for mobile visibility */}
        {post.artForm && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              background: 'var(--color-surface-2)',
              color: 'var(--color-primary)',
              fontWeight: 500,
            }}>
              <Palette size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {post.artForm}
            </span>
          </div>
        )}

        {/* Post title & content */}
        <Link to={`/community/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {post.title && (
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-2)',
              lineHeight: 1.4,
            }}>{post.title}</h3>
          )}
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{post.content}</p>
        </Link>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border-light)',
        }}>
          <button
            onClick={handleLike}
            disabled={liking}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: liking ? 'default' : 'pointer',
              color: liked ? 'var(--color-terracotta)' : 'var(--color-muted)',
              fontSize: 'var(--text-sm)', fontWeight: 500,
              padding: '4px 0', transition: 'color 0.15s',
            }}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {likeCount > 0 && likeCount}
          </button>

          <Link to={`/community/posts/${post.id}#comments`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
            fontWeight: 500, textDecoration: 'none',
          }}>
            <MessageCircle size={16} />
            {post.commentCount > 0 && post.commentCount}
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title || 'Tvarita Community', url: `${window.location.origin}/community/posts/${post.id}` });
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/community/posts/${post.id}`);
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', fontSize: 'var(--text-sm)', fontWeight: 500,
            }}
          >
            <Share2 size={16} />
          </button>

          <div style={{ marginLeft: 'auto' }}>
            {reported ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>Reported</span>
            ) : (
              <button
                onClick={() => setShowReport(r => !r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-muted)', fontSize: 'var(--text-xs)',
                }}
              >
                <Flag size={12} />
                {showReport ? 'Cancel' : 'Report'}
              </button>
            )}
          </div>
        </div>

        {/* Report Form */}
        {showReport && (
          <div style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3)',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
          }}>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', marginBottom: 8,
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)', background: 'var(--color-surface)',
              }}
            >
              <option value="">Select reason…</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="misinformation">Cultural misinformation</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={handleReport}
              disabled={!reportReason || reporting}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-terracotta)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                opacity: !reportReason || reporting ? 0.6 : 1,
              }}
            >
              {reporting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function CommunityFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const category = searchParams.get('category') || '';
  const artForm = searchParams.get('artForm') || '';
  const q = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(q);

  const fetchPosts = useCallback(async (reset = false) => {
    const nextPage = reset ? 1 : page;
    setLoading(true);
    setError(null);
    try {
      const params = { page: nextPage, limit: 10 };
      if (category) params.category = category;
      if (artForm) params.artForm = artForm;
      if (q) params.q = q;
      const res = await community.listPosts(params);
      const data = res.data;
      const fetched = Array.isArray(data?.posts) ? data.posts :
        Array.isArray(data) ? data : [];
      if (reset) {
        setPosts(fetched);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...fetched]);
      }
      setHasMore(fetched.length >= 10);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load community posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, artForm, q, page]);

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, artForm, q]);

  const handleLike = async (postId) => {
    await community.toggleLike(postId);
  };

  const handleReport = async (postId, data) => {
    await community.reportPost(postId, data);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchInput.trim()) p.set('q', searchInput.trim());
    else p.delete('q');
    setSearchParams(p);
  };

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasFilters = category || artForm || q;

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, #52B78850 100%)',
        color: '#fff',
        padding: 'var(--space-16) var(--space-6)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px', fontSize: 'var(--text-xs)',
            letterSpacing: '0.08em', fontWeight: 600,
            marginBottom: 'var(--space-4)',
          }}>
            <Users size={14} /> TVARITA COMMUNITY
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(var(--text-3xl), 5vw, var(--text-5xl))',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 'var(--space-4)',
          }}>Living Art, Shared Stories</h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            opacity: 0.88,
            lineHeight: 1.6,
            marginBottom: 'var(--space-8)',
          }}>
            A gathering place for artists, workshop participants, and cultural explorers to share their experiences with India's living heritage.
          </p>
          <button
            onClick={() => navigate('/community/create')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: 'var(--space-3) var(--space-6)',
              background: '#fff', color: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)', border: 'none',
              fontWeight: 700, fontSize: 'var(--text-base)',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={18} /> Share Your Experience
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Search & Filters */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)', alignItems: 'center',
        }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: '1 1 260px', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search posts, art forms, locations…"
              style={{
                flex: 1, padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-sm)',
                background: 'var(--color-surface)',
                outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-primary)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 'var(--text-sm)',
            }}>Search</button>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setFilterOpen(f => !f)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: filterOpen ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filterOpen ? '#fff' : 'var(--color-text)',
              cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)',
            }}
          >
            <Filter size={14} />
            Filters
            <ChevronDown size={14} style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {/* Create Post shortcut */}
          <Link
            to="/community/create"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-terracotta)',
              color: '#fff', textDecoration: 'none',
              fontWeight: 600, fontSize: 'var(--text-sm)',
            }}
          >
            <Plus size={14} /> Post
          </Link>
        </div>

        {/* Filter Drawer */}
        {filterOpen && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)' }}>
              {/* Category filter */}
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>
                  CATEGORY
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setFilter('category', c.value)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        background: category === c.value ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: category === c.value ? '#fff' : 'var(--color-text)',
                        cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 500,
                      }}
                    >{c.label}</button>
                  ))}
                </div>
              </div>

              {/* Art form filter */}
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>
                  ART FORM
                </label>
                <select
                  value={artForm}
                  onChange={e => setFilter('artForm', e.target.value === 'All Art Forms' ? '' : e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)', fontSize: 'var(--text-sm)',
                  }}
                >
                  {ART_FORMS.map(af => (
                    <option key={af} value={af === 'All Art Forms' ? '' : af}>{af}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  marginTop: 'var(--space-3)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-terracotta)', fontSize: 'var(--text-sm)', fontWeight: 500,
                }}
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-5)' }}>
            {q && <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>"{q}"</span>}
            {category && <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{category}</span>}
            {artForm && <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{artForm}</span>}
          </div>
        )}

        {/* Main Feed Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr min(320px, 30%)', gap: 'var(--space-8)', alignItems: 'start' }}>
          {/* Posts Column */}
          <div>
            {/* Loading Skeleton */}
            {loading && posts.length === 0 && (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5)',
                    marginBottom: 'var(--space-6)',
                  }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-surface-2)', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 14, background: 'var(--color-surface-2)', borderRadius: 4, marginBottom: 8, width: '60%', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ height: 10, background: 'var(--color-surface-2)', borderRadius: 4, width: '40%', animation: 'pulse 1.5s infinite' }} />
                      </div>
                    </div>
                    <div style={{ height: 200, background: 'var(--color-surface-2)', borderRadius: 8, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 12, background: 'var(--color-surface-2)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 12, background: 'var(--color-surface-2)', borderRadius: 4, width: '80%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
                textAlign: 'center', marginBottom: 'var(--space-6)',
              }}>
                <AlertCircle size={32} color="var(--color-error)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--color-error)', marginBottom: 16, fontWeight: 500 }}>{error}</p>
                <button
                  onClick={() => fetchPosts(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: 'var(--space-2) var(--space-5)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div style={{
                textAlign: 'center', padding: 'var(--space-16) var(--space-8)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <Users size={48} color="var(--color-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 8 }}>
                  {hasFilters ? 'No posts match your filters' : 'Be the first to share'}
                </h3>
                <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>
                  {hasFilters
                    ? 'Try different filters or clear your search.'
                    : 'Share your cultural experience, artwork, or workshop memory with the Tvarita community.'}
                </p>
                {hasFilters ? (
                  <button onClick={clearFilters} style={{
                    padding: 'var(--space-2) var(--space-5)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                  }}>Clear Filters</button>
                ) : (
                  <Link to="/community/create" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: 'var(--space-3) var(--space-6)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-terracotta)', color: '#fff',
                    textDecoration: 'none', fontWeight: 600,
                  }}>
                    <Plus size={16} /> Create First Post
                  </Link>
                )}
              </div>
            )}

            {/* Post List */}
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onReport={handleReport}
              />
            ))}

            {/* Load More */}
            {!loading && !error && hasMore && posts.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={() => { setPage(p => p + 1); fetchPosts(false); }}
                  style={{
                    padding: 'var(--space-3) var(--space-8)',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--color-primary)',
                    background: 'none', color: 'var(--color-primary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)',
                  }}
                >Load More Stories</button>
              </div>
            )}

            {/* Loading more */}
            {loading && posts.length > 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <Loader2 size={24} className="spin" color="var(--color-primary)" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'none' }}>
            {/* Community Info Card */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              marginBottom: 'var(--space-4)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-lg)', fontWeight: 600,
                marginBottom: 'var(--space-3)',
              }}>About the Community</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
                A living archive of shared cultural experiences — artists, participants, and heritage explorers sharing the beauty of India's traditional art forms.
              </p>
              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 6 }}>
                  <span>Art forms documented</span><strong style={{ color: 'var(--color-text)' }}>24+</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  <span>States represented</span><strong style={{ color: 'var(--color-text)' }}>14+</strong>
                </div>
              </div>
            </div>

            {/* Quick category nav */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              marginBottom: 'var(--space-4)',
            }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-muted)' }}>
                BROWSE BY CATEGORY
              </h3>
              {CATEGORIES.filter(c => c.value).map(c => (
                <button
                  key={c.value}
                  onClick={() => setFilter('category', c.value === category ? '' : c.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 4px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: category === c.value ? 'var(--color-primary)' : 'var(--color-text)',
                    fontSize: 'var(--text-sm)', fontWeight: category === c.value ? 600 : 400,
                    borderBottom: '1px solid var(--color-border-light)',
                    textAlign: 'left',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Ask Tvarita CTA */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              color: '#fff',
              textAlign: 'center',
            }}>
              <BookOpen size={28} style={{ marginBottom: 8 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', marginBottom: 8 }}>
                Curious about an art form?
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', opacity: 0.85, marginBottom: 12 }}>
                Ask Tvarita's cultural knowledge assistant about any traditional art or practice.
              </p>
              <Link to="/ask-tvarita" style={{
                display: 'block', padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: 'var(--text-sm)',
              }}>Ask Tvarita →</Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @media (min-width: 900px) {
          aside { display: block !important; }
        }
      `}</style>
    </PublicLayout>
  );
}
