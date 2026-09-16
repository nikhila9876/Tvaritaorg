import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, Clock, Calendar, AlertCircle,
  Sparkles, ShieldCheck, CheckCheck, Trash2, ArrowRight,
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import { corporateApi } from '../../api/corporate';
import { useToast } from '../../context/ToastContext';

export default function CorporateNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await corporateApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await corporateApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await corporateApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <DashboardShell role="corporate">
      <div className="page-enter" style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-label">Communications & Alerts</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, margin: '0.25rem 0 0.25rem' }}>
              Corporate Notifications
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
              Booking confirmations, session reminders, schedule updates, and new program releases.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <CheckCheck size={15} />
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filters Strip */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No notifications to show"
            description={filter === 'unread' ? 'You have caught up with all your unread messages.' : 'No notification history yet.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={() => handleMarkRead(notif.id)}
              />
            ))}
          </div>
        )}

        {/* Event Reminder Showcase Box */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #FDFAF6 0%, #F5EFEB 100%)',
            border: '1.5px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Calendar size={22} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 0.25rem' }}>
                Automated Session Reminders
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
                Your registered team members and coordinators will automatically receive reminder notifications 24 hours and 2 hours prior to scheduled sessions, including venue orientation and material guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function NotificationItem({ notification, onMarkRead }) {
  const { id, type, title, message, timestamp, read, registrationId } = notification;

  const iconMap = {
    registration_confirmed: <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />,
    payment_success: <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />,
    reminder: <Calendar size={20} style={{ color: 'var(--color-ochre)' }} />,
    new_experience: <Sparkles size={20} style={{ color: 'var(--color-terracotta)' }} />,
    welcome: <Sparkles size={20} style={{ color: 'var(--color-blue)' }} />,
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        borderLeft: read ? '1px solid var(--color-border)' : '4px solid var(--color-primary)',
        background: read ? 'var(--color-surface)' : 'rgba(45,106,79,0.03)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {iconMap[type] || <Bell size={20} style={{ color: 'var(--color-muted)' }} />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: read ? 600 : 700, color: 'var(--color-text)', margin: 0 }}>
              {title}
            </h4>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              {new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
            {message}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {registrationId ? (
              <Link
                to={`/corporate/registrations/${registrationId}`}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View Registration <ArrowRight size={12} />
              </Link>
            ) : (
              <span />
            )}

            {!read && (
              <button
                onClick={onMarkRead}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.5rem' }}
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
