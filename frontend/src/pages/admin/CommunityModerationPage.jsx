import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flag, CheckCircle2, XCircle, Eye, Loader2, AlertCircle,
  ArrowLeft, RefreshCw, Shield, ExternalLink, ChevronDown
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { community } from '../../api';
import { useAuth } from '../../context/AuthContext';

function timeAgo(date) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const STATUS_STYLES = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  reviewed: { bg: '#DBEAFE', text: '#1E40AF', label: 'Reviewed' },
  actioned: { bg: '#DCFCE7', text: '#14532D', label: 'Actioned' },
  dismissed: { bg: '#F3F4F6', text: '#6B7280', label: 'Dismissed' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
      fontWeight: 600, background: s.bg, color: s.text,
    }}>{s.label}</span>
  );
}

function ReportRow({ report, onAction }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAction = async (action, status) => {
    setLoading(true);
    try {
      await onAction(report.id, { status, action, adminNotes: notes });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      marginBottom: 'var(--space-4)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4) var(--space-5)', cursor: 'pointer',
          flexWrap: 'wrap',
        }}
      >
        <Flag size={16} color="var(--color-terracotta)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={report.status} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{report.reason}</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 3 }}>
            Reported {timeAgo(report.createdAt)}
            {report.reporterEmail && ` · by ${report.reporterEmail}`}
          </div>
        </div>

        <Link
          to={`/community/posts/${report.postId}`}
          onClick={e => e.stopPropagation()}
          target="_blank"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--color-primary)', textDecoration: 'none',
            fontSize: 'var(--text-xs)', fontWeight: 500,
          }}
        >
          <ExternalLink size={12} /> View Post
        </Link>

        <ChevronDown
          size={16}
          color="var(--color-muted)"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
        />
      </div>

      {/* Expanded Actions */}
      {expanded && (
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--color-border-light)',
          background: 'var(--color-surface-2)',
        }}>
          {report.details && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              <strong>Details:</strong> {report.details}
            </p>
          )}
          {report.adminNotes && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 12 }}>
              <strong>Admin notes:</strong> {report.adminNotes}
            </p>
          )}

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Admin notes (optional)…"
            rows={2}
            style={{
              width: '100%', padding: '8px 12px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)', background: 'var(--color-surface)',
              resize: 'vertical', marginBottom: 12, boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAction('hide_post', 'actioned')}
              disabled={loading || report.status === 'actioned'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-error)', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)',
                opacity: report.status === 'actioned' || loading ? 0.5 : 1,
              }}
            >
              <XCircle size={13} /> Hide Post
            </button>
            <button
              onClick={() => handleAction('restore_post', 'reviewed')}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-success)', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Eye size={13} /> Restore & Review
            </button>
            <button
              onClick={() => handleAction('dismiss', 'dismissed')}
              disabled={loading || report.status === 'dismissed'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text)',
                cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)',
                opacity: report.status === 'dismissed' || loading ? 0.5 : 1,
              }}
            >
              <CheckCircle2 size={13} /> Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Admin Moderation Page ──────────────────────────────────────── */
export default function AdminModerationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/community');
  }, [user, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await community.listReports({ status: filterStatus || undefined });
      const data = res?.data;
      setReports(Array.isArray(data?.reports) ? data.reports : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filterStatus]);

  const handleAction = async (reportId, data) => {
    await community.updateReport(reportId, data);
    // Update local state optimistically
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, ...data } : r));
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <Link
            to="/community"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'var(--color-muted)', textDecoration: 'none', fontSize: 'var(--text-sm)',
            }}
          >
            <ArrowLeft size={14} /> Community
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Shield size={22} color="var(--color-primary)" />
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>
                Community Moderation
              </h1>
              {pendingCount > 0 && (
                <span style={{
                  background: 'var(--color-error)', color: '#fff',
                  borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                  fontWeight: 700, padding: '2px 8px',
                }}>{pendingCount} pending</span>
              )}
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Review reported posts and maintain a respectful cultural community.
            </p>
          </div>
          <button
            onClick={fetchReports}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'var(--color-surface)',
              cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text)',
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['pending', 'reviewed', 'actioned', 'dismissed', ''].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '7px 16px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: filterStatus === s ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filterStatus === s ? '#fff' : 'var(--color-text)',
                cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)',
                textTransform: 'capitalize',
              }}
            >{s || 'All'}</button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Loader2 size={32} className="spin" color="var(--color-primary)" />
            <p style={{ color: 'var(--color-muted)', marginTop: 12 }}>Loading reports…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
            textAlign: 'center',
          }}>
            <AlertCircle size={32} color="var(--color-error)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--color-error)', marginBottom: 16 }}>{error}</p>
            <button onClick={fetchReports} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}><RefreshCw size={14} /> Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reports.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 'var(--space-16)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 8 }}>
              All Clear
            </h3>
            <p style={{ color: 'var(--color-muted)' }}>
              {filterStatus ? `No ${filterStatus} reports found.` : 'No reports found.'}
            </p>
          </div>
        )}

        {/* Report List */}
        {!loading && !error && reports.map(report => (
          <ReportRow key={report.id} report={report} onAction={handleAction} />
        ))}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </PublicLayout>
  );
}
