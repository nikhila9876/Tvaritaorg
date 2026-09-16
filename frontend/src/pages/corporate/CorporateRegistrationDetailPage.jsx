import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, ArrowRight,
  ShieldCheck, Download, Printer, ChevronLeft,
  CheckCircle2, Building2, Mail, Phone, FileText,
  AlertCircle, ExternalLink,
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { corporateApi } from '../../api/corporate';
import { useToast } from '../../context/ToastContext';

export default function CorporateRegistrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRegistration();
  }, [id]);

  async function loadRegistration() {
    setLoading(true);
    setError(null);
    try {
      const data = await corporateApi.getRegistrationById(id);
      setRegistration(data);
    } catch (err) {
      setError('Registration record not found.');
    } finally {
      setLoading(false);
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  if (loading) {
    return (
      <DashboardShell role="corporate">
        <div style={{ padding: '2rem 0' }}>
          <LoadingSkeleton type="page" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !registration) {
    return (
      <DashboardShell role="corporate">
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <ErrorState message={error || 'Registration record not found.'} onRetry={() => navigate('/corporate/registrations')} />
        </div>
      </DashboardShell>
    );
  }

  const {
    registrationId,
    eventName,
    artForm,
    artistName,
    dateDisplay,
    date,
    startTime,
    endTime,
    duration,
    venue,
    city,
    companyName,
    contactPerson,
    contactEmail,
    orgId,
    participants,
    totalAmount,
    currency = 'INR',
    paymentStatus,
    paymentReference,
    paidAt,
    createdAt,
    status,
    specialRequirements,
    notes,
    experienceId,
    coverImage,
  } = registration;

  const displayId = registrationId || id;
  const isPaid = paymentStatus === 'paid';

  return (
    <DashboardShell role="corporate">
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Back navigation & Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link
            to="/corporate/registrations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={16} /> Back to My Registrations
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrintReceipt}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <Printer size={15} />
              Print / Download Receipt
            </button>
            {experienceId && (
              <Link
                to={`/corporate/experiences/${experienceId}`}
                className="btn btn-ghost btn-sm"
                style={{ gap: '0.375rem' }}
              >
                <ExternalLink size={15} />
                View Event Page
              </Link>
            )}
          </div>
        </div>

        {/* Printable Official Receipt & Details Card */}
        <div
          id="printable-receipt"
          className="card"
          style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Header of Receipt */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--color-border)',
              paddingBottom: '1.75rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  T
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Tvarita Arts Collective</span>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-terracotta)', fontWeight: 600, textTransform: 'uppercase' }}>Corporate Engagement Voucher</div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                Registered Cultural Heritage NGO • GSTIN: 29AABCT1234F1Z8
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Registration Reference</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {displayId}
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <span className={`badge ${isPaid ? 'badge-green' : 'badge-ochre'}`}>
                  {isPaid ? '✓ Confirmed & Paid' : 'Payment Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Event Information */}
          <section style={{ marginBottom: '2.25rem' }}>
            <span className="section-label">Cultural Experience Details</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: '0.25rem 0 1rem' }}>
              {eventName}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                background: 'var(--color-surface-2)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Art Form</span>
                <strong>{artForm}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Master Practitioner</span>
                <strong>{artistName}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Scheduled Date & Time</span>
                <strong>{dateDisplay || date} ({startTime}{endTime ? ` – ${endTime}` : ''})</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Venue & City</span>
                <strong>{venue}, {city}</strong>
              </div>
            </div>
          </section>

          {/* Section: Organization / Registration Details */}
          <section style={{ marginBottom: '2.25rem' }}>
            <span className="section-label">Organization & Booking Details</span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginTop: '0.75rem',
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: '1.25rem',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Company / Client</span>
                <strong>{companyName}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>ORG_ID / Corporate ID</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{orgId}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Contact Coordinator</span>
                <strong>{contactPerson}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Official Email</span>
                <strong>{contactEmail}</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Registered Participants</span>
                <strong>{participants} Team Members</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Booking Timestamp</span>
                <span>{new Date(createdAt).toLocaleString()}</span>
              </div>
            </div>

            {(specialRequirements || notes) && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                {specialRequirements && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Special Requirements:</strong> {specialRequirements}
                  </div>
                )}
                {notes && (
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Notes for Master Artist:</strong> {notes}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section: Payment Breakdown */}
          <section style={{ borderTop: '2px dashed var(--color-border)', paddingTop: '1.75rem', marginBottom: '2rem' }}>
            <span className="section-label">Financial Transaction & Razorpay Settlement</span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginTop: '0.75rem',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Total Paid Amount</span>
                <strong style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--color-primary-dark)' }}>
                  ₹{Number(totalAmount || 0).toLocaleString('en-IN')} {currency}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Payment Gateway</span>
                <strong>Razorpay Business Standard Checkout</strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Payment Reference / Transaction ID</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  {paymentReference || 'pay_demo_verified'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block' }}>Settlement Date</span>
                <span>{paidAt ? new Date(paidAt).toLocaleDateString() : 'Pending'}</span>
              </div>
            </div>
          </section>

          {/* Footer of Receipt */}
          <div
            style={{
              borderTop: '1px solid var(--color-border-light)',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-muted)',
            }}
          >
            <div>
              Tvarita Arts Collective • <a href="mailto:corporate@tvaritacollective.com" style={{ color: 'var(--color-primary)' }}>corporate@tvaritacollective.com</a> • +91 98765 43210
            </div>
            <div>
              Cultural Heritage Impact Certificate included upon session completion
            </div>
          </div>
        </div>

        {/* Contact Tvarita Support Box */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
              Need to reschedule or update participant count?
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
              Our corporate experience coordinators are available 7 days a week to support your team.
            </p>
          </div>
          <a
            href={`mailto:corporate@tvaritacollective.com?subject=Inquiry for Registration ${displayId}`}
            className="btn btn-secondary btn-sm"
          >
            <Mail size={14} />
            Contact Tvarita Support
          </a>
        </div>
      </div>
    </DashboardShell>
  );
}
