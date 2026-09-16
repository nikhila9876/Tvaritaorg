import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, CheckCircle2, ArrowRight,
  ShieldCheck, Award, Share2, Heart, ChevronLeft, Building2,
  FileText, Mail, Phone, Sparkles, AlertCircle,
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import Modal from '../../components/shared/Modal';
import { corporateApi } from '../../api/corporate';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CorporateExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(10);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [orgId, setOrgId] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [regError, setRegError] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  useEffect(() => {
    loadExperience();
  }, [id]);

  useEffect(() => {
    // If authenticated, prefill company info from user
    if (user) {
      setCompanyName(user.companyName || '');
      setContactPerson(user.name || '');
      setEmail(user.email || '');
      setOrgId(user.orgId || '');
    }
  }, [user]);

  useEffect(() => {
    // If query string has ?register=true, open registration if authenticated or redirect to signup
    if (searchParams.get('register') === 'true' && experience) {
      handleInitiateRegister();
    }
  }, [searchParams, experience, isAuthenticated]);

  async function loadExperience() {
    setLoading(true);
    setError(null);
    try {
      const data = await corporateApi.getExperienceDetails(id);
      setExperience(data);
    } catch (err) {
      setError('Experience not found or unavailable. Please return to the experiences catalog.');
    } finally {
      setLoading(false);
    }
  }

  function handleInitiateRegister() {
    if (!isAuthenticated) {
      // Redirect to corporate signup with returnUrl
      sessionStorage.setItem('tvarita_corporate_return_to', `/corporate/experiences/${id}?register=true`);
      navigate(`/corporate/signup?returnTo=${encodeURIComponent(`/corporate/experiences/${id}?register=true`)}`);
      return;
    }
    setShowRegModal(true);
  }

  async function handleProceedToPayment(e) {
    e.preventDefault();
    setRegError('');

    if (!companyName.trim()) {
      setRegError('Company name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setRegError('Contact person name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegError('A valid corporate email is required.');
      return;
    }
    if (!orgId.trim()) {
      setRegError('Organization / Employee ID is required.');
      return;
    }
    if (participantsCount < 1) {
      setRegError('Number of participants must be at least 1.');
      return;
    }
    if (participantsCount > (experience.availableSeats || 50)) {
      setRegError(`Only ${experience.availableSeats} seats are currently available.`);
      return;
    }

    setSubmittingReg(true);

    try {
      const totalAmount = experience.price * participantsCount;
      // Create initial registration record
      const regRecord = await corporateApi.createRegistration({
        experienceId: experience.id,
        eventName: experience.name,
        artForm: experience.artForm,
        artistName: experience.artist.name,
        date: experience.date,
        dateDisplay: experience.dateDisplay,
        startTime: experience.startTime,
        endTime: experience.endTime,
        duration: experience.duration,
        venue: experience.venue,
        city: experience.city,
        companyName,
        contactPerson,
        contactEmail: email,
        userEmail: user?.email || email,
        orgId,
        participants: participantsCount,
        specialRequirements,
        notes,
        totalAmount,
        currency: 'INR',
        coverImage: experience.coverImage,
      });

      setShowRegModal(false);

      // Navigate to Payment Processing with the registration details
      navigate('/corporate/payment', {
        state: {
          registration: regRecord,
          experience,
        },
      });
    } catch (err) {
      setRegError(err.message || 'Failed to initialize registration.');
    } finally {
      setSubmittingReg(false);
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <LoadingSkeleton type="page" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !experience) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <ErrorState
            message={error || 'Experience not found.'}
            onRetry={() => navigate('/corporate/experiences')}
          />
        </div>
      </PublicLayout>
    );
  }

  const {
    name,
    description,
    artForm,
    artist,
    dateDisplay,
    startTime,
    endTime,
    duration,
    venue,
    city,
    location,
    capacity,
    availableSeats,
    price,
    coverImage,
    images = [],
    whatsIncluded = [],
    requirements = [],
    organizerDetails = {},
    culturalStory = {},
    category,
  } = experience;

  const totalCalculated = price * participantsCount;

  return (
    <PublicLayout>
      <div className="page-enter" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ─── Breadcrumb & Back Nav ───────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="container" style={{ padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              to="/corporate/experiences"
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
              <ChevronLeft size={16} /> Back to Corporate Experiences
            </Link>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success('Experience link copied to clipboard.');
                }}
                aria-label="Share experience"
              >
                <Share2 size={15} />
                <span className="hide-mobile">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Hero Cover Section ─────────────────────────────────────────── */}
        <section style={{ position: 'relative', height: 'clamp(320px, 45vh, 480px)', overflow: 'hidden' }}>
          <img
            src={coverImage}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(28,28,28,0.85) 0%, rgba(28,28,28,0.3) 50%, rgba(0,0,0,0.1) 100%)',
            }}
          />
          <div className="container" style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0 }}>
            <div style={{ maxWidth: 850 }}>
              <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-ochre">{category}</span>
                <span className="badge badge-terracotta">{artForm}</span>
                <span className="badge badge-green">{availableSeats} Seats Available</span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.18,
                  marginBottom: '0.5rem',
                }}
              >
                {name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-sm)' }}>
                <span>Led by <strong>{artist.name}</strong> ({artist.region})</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Main Content Layout ────────────────────────────────────────── */}
        <div className="container" style={{ marginTop: '2.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2.5rem',
            }}
            className="experience-detail-grid"
          >
            {/* Left Main Column: Story & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {/* Overview & Description */}
              <section className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '1rem' }}>
                  Experience Overview
                </h2>
                <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--color-text-secondary)', marginBottom: '1.75rem' }}>
                  {description}
                </p>

                {/* Metadata Highlights Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1.25rem',
                    padding: '1.25rem',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date & Schedule</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{dateDisplay}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{startTime} – {endTime}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{duration}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Structured masterclass</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Location & City</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{city}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{venue}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cohort Size</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Up to {capacity} participants</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>{availableSeats} seats remaining</div>
                  </div>
                </div>
              </section>

              {/* ─── Cultural Story Section (Visual & Editorial) ─────────── */}
              <section
                style={{
                  background: 'linear-gradient(180deg, #FBF8F3 0%, var(--color-surface) 100%)',
                  padding: '2.5rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span className="section-label">Living Tradition & Cultural Lineage</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '1.5rem' }}>
                  The Cultural Story Behind {artForm}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>
                      About the Art Form
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.8, color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                      {culturalStory.aboutArtForm}
                    </p>

                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-terracotta)' }}>
                      Cultural Significance & Heritage Impact
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
                      {culturalStory.culturalSignificance}
                    </p>
                  </div>

                  {/* Master Artist Profile Box */}
                  <div
                    style={{
                      background: 'var(--color-surface)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-light)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <img
                        src={artist.image}
                        alt={artist.name}
                        style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                      />
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-terracotta)' }}>
                          Master Practitioner
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                          {artist.name}
                        </h4>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                          {artist.title}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', lineHeight: 1.7, color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                      {artist.bio}
                    </p>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> Rooted in {artist.region}
                    </div>
                  </div>
                </div>

                {/* Cultural Image Showcase Gallery */}
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: '1rem' }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ height: 180, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <img
                          src={img}
                          alt={`${artForm} photo ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Inclusions & Requirements */}
              <section className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1.25rem' }}>
                  What's Included in This Corporate Session
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
                  {whatsIncluded.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>
                  Suitability & Team Requirements
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {requirements.map((req, i) => (
                    <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', listStyleType: 'disc', marginLeft: '1.25rem' }}>
                      {req}
                    </li>
                  ))}
                </ul>

                {/* Organizer Contact Info */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Curated By:</strong> {organizerDetails.name}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Email:</strong> {organizerDetails.email}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text)' }}>Direct Phone:</strong> {organizerDetails.phone}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sticky Sidebar: Registration Box */}
            <div>
              <div
                className="card"
                style={{
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  position: 'sticky',
                  top: 'calc(var(--header-height) + 1.5rem)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1.5px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                      Investment per participant
                    </span>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                      ₹{price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="badge badge-green">{availableSeats} Seats Left</span>
                </div>

                <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Scheduled Date:</span>
                    <strong>{dateDisplay.split(',')[0]}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Timing:</span>
                    <strong>{startTime} – {endTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery:</span>
                    <strong>{city}</strong>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleInitiateRegister}
                  style={{ width: '100%', marginBottom: '1rem', fontWeight: 700 }}
                >
                  Register for this Experience
                  <ArrowRight size={18} />
                </button>

                {!isAuthenticated && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textAlign: 'center', marginBottom: '1.25rem' }}>
                    You will be prompted to sign up or verify with corporate email before confirming.
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
                    Secure Razorpay Business Checkout
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                    GST Compliant Invoices & Impact Certificates
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
                    Directly channeled to traditional artist communities
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Corporate Event Registration Modal ──────────────────────────── */}
        <Modal
          isOpen={showRegModal}
          onClose={() => setShowRegModal(false)}
          title={`Register: ${name}`}
          size="lg"
        >
          <form onSubmit={handleProceedToPayment}>
            {regError && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} />
                <span>{regError}</span>
              </div>
            )}

            {/* Event Summary Strip */}
            <div
              style={{
                background: 'var(--color-surface-2)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: 'var(--text-xs)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block' }}>Event</span>
                <strong>{name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block' }}>Date & Time</span>
                <strong>{dateDisplay.split(',')[1] || dateDisplay} ({startTime})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block' }}>Venue</span>
                <strong>{venue}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block' }}>Fee per Seat</span>
                <strong>₹{price.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Registration Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Company / Organization Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Infosys, TCS, Google"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ORG_ID / Corporate ID *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="e.g. ORG-INFY-2026"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Coordinator Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coordinator@company.com"
                />
              </div>
            </div>

            {/* Participants Selector & Price Calculation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-group">
                <label className="form-label">Number of Participants *</label>
                <input
                  type="number"
                  min="1"
                  max={availableSeats || 50}
                  className="form-input"
                  required
                  value={participantsCount}
                  onChange={(e) => setParticipantsCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  Max available for this date: {availableSeats} seats
                </span>
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Total Registration Amount
                </span>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  ₹{totalCalculated.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  (₹{price.toLocaleString('en-IN')} × {participantsCount} participants)
                </span>
              </div>
            </div>

            {/* Special Requirements / Notes */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Special Requirements / Dietary / Accessibility (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Vegetarian only, wheelchair access, hybrid live-stream"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Notes for Master Artist / Tvarita Team (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special focus or team context..."
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowRegModal(false)}
                disabled={submittingReg}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingReg}
                style={{ fontWeight: 600 }}
              >
                {submittingReg ? 'Initializing Order...' : `Proceed to Payment (₹${totalCalculated.toLocaleString('en-IN')})`}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>

        <style>{`
          @media (min-width: 1024px) {
            .experience-detail-grid {
              grid-template-columns: 1fr 380px !important;
            }
          }
        `}</style>
      </div>
    </PublicLayout>
  );
}
