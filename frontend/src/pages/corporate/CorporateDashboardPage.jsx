import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, ArrowRight,
  ShieldCheck, FileText, Download, Bell, User,
  Building2, Sparkles, PlusCircle, CheckCircle2,
  AlertCircle, ChevronRight, CreditCard,
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import { corporateApi } from '../../api/corporate';
import { useAuth } from '../../context/AuthContext';

export default function CorporateDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [regs, notifs] = await Promise.all([
        corporateApi.getRegistrations(user?.email),
        corporateApi.getNotifications(),
      ]);
      setRegistrations(regs);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Next upcoming confirmed or paid experience
  const upcomingRegs = registrations.filter(r => r.status !== 'cancelled');
  const nextExperience = upcomingRegs[0];

  // Recent payments
  const paidRegistrations = registrations.filter(r => r.paymentStatus === 'paid');

  return (
    <DashboardShell role="corporate">
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* ─── Welcome Header ─────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 70%, #3D8B68 100%)',
            color: '#fff',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '-40px',
              bottom: '-40px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FDE68A',
                fontWeight: 700,
                marginBottom: '0.625rem',
              }}
            >
              <Building2 size={14} />
              Corporate Partner Portal
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '0.375rem',
              }}
            >
              Welcome, {user?.name || 'Corporate Partner'}
            </h1>

            <div style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.88)', marginBottom: '1.5rem', fontWeight: 500 }}>
              {user?.companyName || 'Corporate Enterprise'} • ORG ID: {user?.orgId || 'ORG-TVARITA'}
            </div>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <Link to="/corporate/experiences" className="btn btn-sm" style={{ background: '#fff', color: 'var(--color-primary)', fontWeight: 700 }}>
                Explore Experiences
                <ArrowRight size={14} />
              </Link>
              <Link to="/corporate/registrations" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                My Registrations ({registrations.length})
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Next Upcoming Experience Card ──────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
              Upcoming Experience
            </h2>
            {nextExperience && (
              <Link to={`/corporate/registrations/${nextExperience.registrationId || nextExperience.id}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                View Full Details →
              </Link>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : nextExperience ? (
            <div
              className="card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1.5px solid var(--color-border)',
              }}
            >
              <div style={{ height: '260px', position: 'relative' }}>
                <img
                  src={nextExperience.coverImage || 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80'}
                  alt={nextExperience.eventName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span className="badge badge-green">Confirmed Booking</span>
                </div>
              </div>

              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    {nextExperience.artForm || 'Traditional Heritage Art'}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.25 }}>
                    {nextExperience.eventName}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
                      <span>{nextExperience.dateDisplay || nextExperience.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={15} style={{ color: 'var(--color-primary)' }} />
                      <span>{nextExperience.startTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', gridColumn: 'span 2' }}>
                      <MapPin size={15} style={{ color: 'var(--color-terracotta)' }} />
                      <span>{nextExperience.venue}, {nextExperience.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Users size={15} style={{ color: 'var(--color-primary)' }} />
                      <span>{nextExperience.participants} Participants</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="badge badge-blue">
                        {nextExperience.paymentStatus === 'paid' ? 'Paid via Razorpay' : 'Payment Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to={`/corporate/registrations/${nextExperience.registrationId || nextExperience.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details & Receipt
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to={`/corporate/experiences/${nextExperience.experienceId}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View Experience Page
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <Sparkles size={36} style={{ color: 'var(--color-ochre)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Upcoming Experiences Booked
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', maxWidth: 460, margin: '0 auto 1.25rem' }}>
                Discover authentic folk art workshops, traditional music performances, and executive culture programs for your teams.
              </p>
              <Link to="/corporate/experiences" className="btn btn-primary">
                Browse Curated Experiences
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>

        {/* ─── My Registrations Preview ────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
              Recent Registrations
            </h2>
            <Link to="/corporate/registrations" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
              View All Registrations →
            </Link>
          </div>

          <div className="table-wrap card" style={{ borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Participants</th>
                  <th>Payment Status</th>
                  <th>Registration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
                      No registration records found. Explore experiences to book.
                    </td>
                  </tr>
                ) : (
                  registrations.slice(0, 5).map((reg) => (
                    <tr key={reg.id || reg.registrationId}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/corporate/registrations/${reg.registrationId || reg.id}`} style={{ color: 'var(--color-text)' }}>
                          {reg.eventName}
                        </Link>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                          ID: {reg.registrationId || reg.id}
                        </div>
                      </td>
                      <td>{reg.dateDisplay || reg.date}</td>
                      <td>{reg.city}</td>
                      <td>{reg.participants}</td>
                      <td>
                        <span className={`badge ${reg.paymentStatus === 'paid' ? 'badge-green' : 'badge-ochre'}`}>
                          {reg.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${reg.status === 'cancelled' ? 'badge-terracotta' : 'badge-blue'}`}>
                          {reg.status || 'Confirmed'}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/corporate/registrations/${reg.registrationId || reg.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Payments Section ────────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
              Payment Records & Receipts
            </h2>
          </div>

          <div className="table-wrap card" style={{ borderRadius: 'var(--radius-lg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Amount Paid</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Transaction Reference</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paidRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
                      No verified Razorpay payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  paidRegistrations.map((p) => (
                    <tr key={p.id || p.registrationId}>
                      <td style={{ fontWeight: 600 }}>{p.eventName}</td>
                      <td style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        ₹{Number(p.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-green">Verified</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                        {p.paymentReference || 'pay_demo_verified'}
                      </td>
                      <td>
                        <Link
                          to={`/corporate/registrations/${p.registrationId || p.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.25rem' }}
                        >
                          <Download size={13} />
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Quick Actions Grid ─────────────────────────────────────────── */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link
              to="/corporate/experiences"
              className="card"
              style={{ padding: '1.25rem', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Explore Experiences</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Discover folk sessions</div>
              </div>
            </Link>

            <Link
              to="/corporate/registrations"
              className="card"
              style={{ padding: '1.25rem', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>My Registrations</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Manage team bookings</div>
              </div>
            </Link>

            <Link
              to="/corporate/profile"
              className="card"
              style={{ padding: '1.25rem', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ochre)' }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Company Profile</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Coordinator & ORG ID</div>
              </div>
            </Link>

            <Link
              to="/corporate/notifications"
              className="card"
              style={{ padding: '1.25rem', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
                <Bell size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Notifications</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Reminders & updates</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
