import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Calendar, Clock, MapPin, Building2,
  Users, Download, ArrowRight, Printer, Mail,
  ShieldCheck, FileText, LayoutDashboard,
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

export default function CorporateConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const registration = stateData.registration || null;
  const paymentReference = stateData.paymentReference || registration?.paymentReference || 'pay_verified_sample';

  if (!registration) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: '1rem' }}>
            No Active Confirmation Session
          </h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
            Please return to your dashboard or explore available experiences.
          </p>
          <Link to="/corporate/dashboard" className="btn btn-primary">
            Go to Corporate Dashboard
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const {
    registrationId,
    id,
    eventName,
    artForm,
    artistName,
    dateDisplay,
    date,
    startTime,
    endTime,
    venue,
    city,
    companyName,
    contactPerson,
    contactEmail,
    orgId,
    participants,
    totalAmount,
    currency = 'INR',
  } = registration;

  const displayId = registrationId || id;

  function handlePrint() {
    window.print();
  }

  return (
    <PublicLayout>
      <div className="page-enter" style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
        <div className="container" style={{ maxWidth: 740 }}>
          {/* Main Confirmation Box */}
          <div
            className="card"
            style={{
              padding: '3rem 2.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Success Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#D1FAE5',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 0 0 8px rgba(45,106,79,0.08)',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#D1FAE5',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem',
                }}
              >
                Payment Verified & Recorded
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}
              >
                ✓ Registration Confirmed
              </h1>

              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', maxWidth: 520, margin: '0 auto' }}>
                Your corporate cultural session has been successfully booked with Tvarita Arts Collective.
              </p>
            </div>

            {/* Email Dispatch Notice (Requirement 13) */}
            <div
              className="alert alert-success"
              style={{
                marginBottom: '2rem',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                background: '#E8F5E9',
                borderLeft: '4px solid var(--color-primary)',
              }}
            >
              <Mail size={22} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
              <div style={{ fontSize: 'var(--text-sm)' }}>
                <strong>Confirmation email sent to: </strong>
                <span style={{ textDecoration: 'underline' }}>{contactEmail}</span>
                <p style={{ margin: '0.375rem 0 0', fontSize: 'var(--text-xs)', color: '#2E7D32', lineHeight: 1.5 }}>
                  The email contains your official invoice, preparation guidelines for team participants, and contact details for master artist <strong>{artistName}</strong>.
                </p>
              </div>
            </div>

            {/* Structured Verified Details Summary */}
            <div
              style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                marginBottom: '2.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {artForm}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0.25rem 0 0' }}>
                    {eventName}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Registration ID</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)' }}>
                    {displayId}
                  </strong>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Date</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                    <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>{dateDisplay || date}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Time & Duration</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                    <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>{startTime}{endTime ? ` – ${endTime}` : ''}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Location / Venue</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                    <MapPin size={14} style={{ color: 'var(--color-terracotta)' }} />
                    <span>{venue}, {city}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Company Name</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                    <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>{companyName} ({orgId})</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Participants</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                    <Users size={14} style={{ color: 'var(--color-primary)' }} />
                    <span>{participants} Team Members</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Amount Paid</span>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    ₹{Number(totalAmount || 0).toLocaleString('en-IN')} {currency}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Payment Reference</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '2px' }}>
                    {paymentReference}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons as specified in Section 12 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <Link
                to={`/corporate/registrations/${displayId}`}
                className="btn btn-primary"
                style={{ fontWeight: 600 }}
              >
                View Registration
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={handlePrint}
                className="btn btn-secondary"
                style={{ fontWeight: 600 }}
              >
                <Printer size={16} />
                Download Receipt
              </button>

              <Link
                to="/corporate/dashboard"
                className="btn btn-ghost"
                style={{ fontWeight: 600 }}
              >
                <LayoutDashboard size={16} />
                Back to Dashboard
              </Link>
            </div>

            {/* Living Heritage Preservation Impact Note */}
            <div
              style={{
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-light)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-muted)',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                <ShieldCheck size={14} />
                Preserving India's Living Traditions
              </div>
              <p style={{ margin: 0 }}>
                100% of the artisan honorarium from this corporate session is directly deposited into master practitioner {artistName}'s community artisan account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
