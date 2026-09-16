import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, Flag, ArrowLeft, Loader2,
  AlertCircle, MapPin, Palette, Trash2, Send, CheckCircle2,
  RefreshCw, ChevronRight
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { community } from '../../api';
import { useAuth } from '../../context/AuthContext';

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

const ROLE_COLORS = {
  artist: { bg: '#FFF3E0', text: '#E65100', label: 'Artist' },
  corporate: { bg: '#E3F2FD', text: '#1565C0', label: 'Corporate' },
  admin: { bg: '#F3E5F5', text: '#6A1B9A', label: 'NGO Team' },
  participant: { bg: '#E8F5E9', text: '#2E7D32', label: 'Participant' },
};

function RoleBadge({ role }) {
  const r = ROLE_COLORS[role] || ROLE_COLORS.participant;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
      fontWeight: 600, background: r.bg, color: r.text,
    }}>{r.label}</span>
  );
}

function Avatar({ src, name, size = 40 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TC';
  const [imgErr, setImgErr] = useState(false);

  if (src && !imgErr) {
    return (
      <img
        src={src} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={() => setImgErr(true)}
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

/* ─── Image Carousel ─────────────────────────────────────────────── */
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  return (
    <div style={{ position: 'relative', background: '#000', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
      <img
        src={images[current]}
        alt=""
        style={{ width: '100%', maxHeight: 500, objectFit: 'contain', display: 'block' }}
        onError={e => e.target.style.display = 'none'}
      />
      {images.length > 1 && (
        <>
          <div style={{
            position: 'absolute', bottom: 12, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 6,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 24 : 8, height: 8,
                  borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'width 0.2s',
                }}
              />
            ))}
          </div>
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Comment Item ───────────────────────────────────────────────── */
function CommentItem({ comment, currentUserId, isAdmin, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const canDelete = isAdmin || currentUserId === comment.authorId;

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(true);
    try { await onDelete(comment.id); } finally { setDeleting(false); }
  };

  return (
    <div style={{
      display: 'flex', gap: 'var(--space-3)',
      paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <Avatar src={comment.authorAvatar} name={comment.authorName} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{comment.authorName}</span>
          <RoleBadge role={comment.authorRole} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{timeAgo(comment.createdAt)}</span>
        </div>
        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
          lineHeight: 1.6, margin: 0, wordBreak: 'break-word',
        }}>{comment.content}</p>
      </div>
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', padding: 4, flexShrink: 0,
            opacity: deleting ? 0.5 : 1,
          }}
        ><Trash2 size={14} /></button>
      )}
    </div>
  );
}

/* ─── Post Detail Page ───────────────────────────────────────────── */
export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const commentsRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState(user?.name || '');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAuthor = user && (user.id === post?.authorId || user.sub === post?.authorId);
  const canDelete = isAdmin || isAuthor;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#comments' && commentsRef.current) {
      setTimeout(() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [post]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await community.getPost(id);
      const data = res?.data;
      const p = data?.post || data;
      setPost(p);
      setLiked(p?.isLikedByMe || false);
      setLikeCount(p?.likeCount || 0);
    } catch (err) {
      if (err?.response?.status === 404) setError('This post could not be found. It may have been removed.');
      else setError(err?.response?.data?.message || 'Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await community.toggleLike(id);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) { setCommentError('Please write a comment.'); return; }
    const name = user?.name || commenterName.trim() || 'Cultural Contributor';
    setSubmittingComment(true);
    setCommentError(null);
    try {
      const res = await community.addComment(id, {
        content: commentText.trim(),
        authorName: name,
        authorRole: user?.role || 'participant',
        authorAvatar: user?.avatar || null,
      });
      const newComment = res?.data?.comment || res?.data;
      setPost(p => ({
        ...p,
        comments: [...(p.comments || []), newComment],
        commentCount: (p.commentCount || 0) + 1,
      }));
      setCommentText('');
    } catch (err) {
      setCommentError(err?.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await community.deleteComment(commentId);
      setPost(p => ({
        ...p,
        comments: (p.comments || []).filter(c => c.id !== commentId),
        commentCount: Math.max(0, (p.commentCount || 0) - 1),
      }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Permanently delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await community.deletePost(id);
      navigate('/community', { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      await community.reportPost(id, { reason: reportReason });
      setReported(true);
      setShowReport(false);
    } catch { /* silent */ } finally {
      setReporting(false);
    }
  };

  /* ─── States ─────────────────────────────────── */
  if (loading) return (
    <PublicLayout>
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 var(--space-4)', textAlign: 'center' }}>
        <Loader2 size={40} className="spin" color="var(--color-primary)" />
        <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>Loading post…</p>
      </div>
    </PublicLayout>
  );

  if (error) return (
    <PublicLayout>
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 var(--space-4)', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--color-error)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 12 }}>Post Unavailable</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={fetchPost} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-full)', background: 'var(--color-primary)',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
          }}><RefreshCw size={14} /> Retry</button>
          <Link to="/community" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
            color: 'var(--color-text)', textDecoration: 'none', fontWeight: 600,
          }}><ArrowLeft size={14} /> Back to Community</Link>
        </div>
      </div>
    </PublicLayout>
  );

  if (!post) return null;

  const comments = post.comments || [];

  return (
    <PublicLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Back navigation */}
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

        {/* Post body */}
        <article>
          {/* Media */}
          <ImageCarousel images={post.mediaUrls || []} />

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <Avatar src={post.authorAvatar} name={post.authorName} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{post.authorName}</span>
                <RoleBadge role={post.authorRole} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 3 }}>
                {timeAgo(post.createdAt)}
                {post.location && (
                  <span> · <MapPin size={10} style={{ verticalAlign: 'middle' }} /> {post.location}</span>
                )}
              </div>
            </div>
            {canDelete && (
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-error)',
                  background: 'none', color: 'var(--color-error)',
                  cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600,
                }}
              ><Trash2 size={12} /> {deleting ? 'Deleting…' : 'Delete'}</button>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            {post.category && (
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface-2)',
                fontSize: 'var(--text-xs)', color: 'var(--color-text)',
                fontWeight: 500, textTransform: 'capitalize',
              }}>{post.category}</span>
            )}
            {post.artForm && (
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: '#E8F5E9', color: 'var(--color-primary)',
                fontSize: 'var(--text-xs)', fontWeight: 500,
              }}>
                <Palette size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {post.artForm}
              </span>
            )}
          </div>

          {/* Title */}
          {post.title && (
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))',
              fontWeight: 700, lineHeight: 1.3,
              marginBottom: 'var(--space-4)', color: 'var(--color-text)',
            }}>{post.title}</h1>
          )}

          {/* Content */}
          <div style={{
            fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)',
            lineHeight: 1.85, whiteSpace: 'pre-wrap',
            marginBottom: 'var(--space-6)',
          }}>{post.content}</div>

          {/* Action Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
            padding: 'var(--space-4) 0',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)',
          }}>
            <button
              onClick={handleLike}
              disabled={liking}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: liking ? 'default' : 'pointer',
                color: liked ? 'var(--color-terracotta)' : 'var(--color-muted)',
                fontSize: 'var(--text-base)', fontWeight: 600, padding: 0,
              }}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'Like' : 'Likes'}` : 'Like'}
            </button>

            <button
              onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)', fontSize: 'var(--text-base)', fontWeight: 500,
              }}
            >
              <MessageCircle size={20} />
              {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Comment'}
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title || 'Tvarita Community', url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)', fontSize: 'var(--text-base)', fontWeight: 500,
              }}
            >
              <Share2 size={20} /> Share
            </button>

            <div style={{ marginLeft: 'auto' }}>
              {reported ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-sm)', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={14} /> Reported
                </span>
              ) : (
                <button
                  onClick={() => setShowReport(r => !r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
                  }}
                >
                  <Flag size={14} /> {showReport ? 'Cancel' : 'Report'}
                </button>
              )}
            </div>
          </div>

          {/* Report Form */}
          {showReport && (
            <div style={{
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              marginBottom: 'var(--space-6)',
            }}>
              <h4 style={{ fontWeight: 600, marginBottom: 10, fontSize: 'var(--text-sm)' }}>Report this post</h4>
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface)', marginBottom: 10,
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
                  padding: '8px 20px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-terracotta)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                  fontSize: 'var(--text-sm)', opacity: !reportReason || reporting ? 0.6 : 1,
                }}
              >{reporting ? 'Submitting…' : 'Submit Report'}</button>
            </div>
          )}

          {/* Comments Section */}
          <div ref={commentsRef} id="comments">
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-2xl)', fontWeight: 700,
              marginBottom: 'var(--space-6)',
            }}>
              {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Comments'}
            </h2>

            {/* Comment Input */}
            <form onSubmit={handleComment} style={{ marginBottom: 'var(--space-8)' }}>
              {!user && (
                <input
                  type="text"
                  value={commenterName}
                  onChange={e => setCommenterName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', padding: '10px 14px', marginBottom: 10,
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-sm)', background: 'var(--color-bg)',
                    boxSizing: 'border-box',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <Avatar src={user?.avatar} name={user?.name || commenterName || 'You'} size={40} />
                <div style={{ flex: 1 }}>
                  <textarea
                    value={commentText}
                    onChange={e => { setCommentText(e.target.value); setCommentError(null); }}
                    placeholder="Share your thoughts on this cultural post…"
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${commentError ? 'var(--color-error)' : 'var(--color-border)'}`,
                      fontSize: 'var(--text-sm)', background: 'var(--color-bg)',
                      resize: 'vertical', minHeight: 80, boxSizing: 'border-box',
                    }}
                  />
                  {commentError && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{commentError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: !commentText.trim() || submittingComment ? 0.6 : 1,
                    flexShrink: 0,
                  }}
                >
                  {submittingComment ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                  Post
                </button>
              </div>
            </form>

            {/* Comment List */}
            {comments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: 'var(--space-10)',
                color: 'var(--color-muted)',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Be the first to add a comment.</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id || user?.sub}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
        </article>

        {/* Back Navigation Footer */}
        <div style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
          <Link
            to="/community"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--color-primary)', textDecoration: 'none',
              fontSize: 'var(--text-sm)', fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} /> Explore more community stories
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </PublicLayout>
  );
}
