import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, ArrowRight,
  ShieldCheck, Download, Search, CheckCircle2,
  AlertCircle, ChevronRight, FileText,
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import { corporateApi } from '../../api/corporate';
import { useAuth } from '../../context/AuthContext';

export default function CorporateRegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, [user]);

  async function loadRegistrations() {
    setLoading(true);
    try {
      const data = await corporateApi.getRegistrations(user?.email);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Filter registrations by tab & search query
  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      (reg.eventName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.registrationId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isCancelled = reg.status === 'cancelled';
    const isCompleted = reg.status === 'completed' || new Date(reg.date) < new Date(Date.now() - 24 * 3600 * 1000);

    if (activeTab === 'cancelled') return isCancelled && matchesSearch;
    if (activeTab === 'completed') return isCompleted && !isCancelled && matchesSearch;
    // 'upcoming' is default
    return !isCompleted && !isCancelled && matchesSearch;
  });

  return (
    <DashboardShell role="corporate">
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-label">Bookings & History</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, margin: 0 }}>
              My Corporate Registrations
            </h1>
          </div>

          <Link to="/corporate/experiences" className="btn btn-primary btn-sm">
            Book New Experience
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search & Tabs */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="search"
                className="form-input"
                placeholder="Search by event or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', height: '38px', fontSize: 'var(--text-xs)' }}
              />
            </div>
          </div>
        </div>

        {/* Registrations List */}
        {loading ? (
          <LoadingSkeleton type="card" count={2} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} registrations found`}
            description={
              searchQuery
                ? 'Try adjusting your search terms.'
                : 'You have no registrations in this category yet. Browse our curated cultural experiences catalog.'
            }
            action={
              <Link to="/corporate/experiences" className="btn btn-primary">
                Browse Experiences
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map((reg) => (
              <RegistrationCard key={reg.id || reg.registrationId} registration={reg} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function RegistrationCard({ registration }) {
  const {
    id,
    registrationId,
    eventName,
    artForm,
    artistName,
    dateDisplay,
    date,
    startTime,
    venue,
    city,
    participants,
    totalAmount,
    paymentStatus,
    status,
    coverImage,
    paymentReference,
  } = registration;

  const displayId = registrationId || id;

  return (
    <article
      className="card"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        transition: 'box-shadow var(--transition-fast)',
      }}
    >
      <div style={{ minHeight: '180px', position: 'relative' }}>
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80'}
          alt={eventName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-ochre">{artForm}</span>
        </div>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {displayId}
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0.25rem 0' }}>
                {eventName}
              </h3>
            </div>
            <span className={`badge ${status === 'cancelled' ? 'badge-terracotta' : paymentStatus === 'paid' ? 'badge-green' : 'badge-blue'}`}>
              {status === 'cancelled' ? 'Cancelled' : paymentStatus === 'paid' ? 'Confirmed & Paid' : 'Payment Pending'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
              <span>{dateDisplay || date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={13} style={{ color: 'var(--color-primary)' }} />
              <span>{startTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', gridColumn: 'span 2' }}>
              <MapPin size={13} style={{ color: 'var(--color-terracotta)' }} />
              <span>{venue}, {city}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Users size={13} style={{ color: 'var(--color-primary)' }} />
              <span>{participants} Team Members</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontWeight: 600 }}>Amount: ₹{Number(totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.875rem' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            Led by {artistName}
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/corporate/registrations/${displayId}`}
              className="btn btn-secondary btn-sm"
            >
              View Details
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
