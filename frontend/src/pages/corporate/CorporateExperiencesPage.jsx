import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, ArrowRight,
  Filter, Search, Sparkles, Building2, CheckCircle2,
  ChevronRight, Award, ShieldCheck,
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { corporateApi } from '../../api/corporate';

export default function CorporateExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtForm, setSelectedArtForm] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    loadExperiences();
  }, []);

  async function loadExperiences() {
    setLoading(true);
    setError(null);
    try {
      const data = await corporateApi.getCorporateExperiences();
      setExperiences(data);
    } catch (err) {
      setError('Failed to load corporate experiences. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Art forms and cities for filter dropdowns
  const artForms = ['all', ...new Set(experiences.map(e => e.artForm))];
  const cities = ['all', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Kolkata'];

  const filtered = experiences.filter(exp => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.artForm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArt = selectedArtForm === 'all' || exp.artForm === selectedArtForm;
    const matchesCity = selectedCity === 'all' || exp.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesArt && matchesCity;
  });

  return (
    <PublicLayout>
      <div className="page-enter" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        {/* ─── Hero Header (Editorial, Cultural Tvarita Style) ─────────────── */}
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #C45B39 100%)',
            color: '#fff',
            padding: '5rem 0 4rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(253,230,138,0.12) 0%, transparent 40%)',
              pointerEvents: 'none',
            }}
          />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 780 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FDE68A',
                  marginBottom: '1.25rem',
                }}
              >
                <Building2 size={13} />
                Corporate Cultural Engagements & CSR
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                }}
              >
                Living Traditions Curated for Modern Organizations
              </h1>

              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                }}
              >
                Engage your teams with master practitioners of India’s living arts. From hands-on
                traditional craft masterclasses to transformative acoustic folk performances, each
                experience delivers tangible cultural impact and directly sustains village artist guilds.
              </p>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  fontSize: 'var(--text-sm)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#FDE68A' }} />
                  Direct Fair Income to Master Artists
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#FDE68A' }} />
                  CSR & ESG Cultural Impact Receipts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#FDE68A' }} />
                  Seamless On-Campus or Studio Delivery
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Search & Filter Bar ─────────────────────────────────────────── */}
        <section style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'sticky', top: 'var(--header-height)', zIndex: 30, boxShadow: 'var(--shadow-sm)' }}>
          <div className="container" style={{ padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search input */}
              <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 260 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  type="search"
                  className="form-input"
                  placeholder="Search experiences, art forms, or master artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: 'var(--text-sm)' }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                  <Filter size={15} />
                  <span>Filters:</span>
                </div>

                {/* Art Form Filter */}
                <select
                  className="form-select"
                  value={selectedArtForm}
                  onChange={(e) => setSelectedArtForm(e.target.value)}
                  style={{ height: '42px', fontSize: 'var(--text-sm)', minWidth: 160 }}
                >
                  <option value="all">All Art Forms</option>
                  {artForms.filter(a => a !== 'all').map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>

                {/* City Filter */}
                <select
                  className="form-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{ height: '42px', fontSize: 'var(--text-sm)', minWidth: 140 }}
                >
                  <option value="all">All Cities</option>
                  {cities.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {(searchQuery || selectedArtForm !== 'all' || selectedCity !== 'all') && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedArtForm('all');
                      setSelectedCity('all');
                    }}
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--color-terracotta)' }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Experience Grid ────────────────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <span className="section-label">Available Programs</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>
                  Curated Experiences ({filtered.length})
                </h2>
              </div>

              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                Showing verified Tvarita master practitioner sessions
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : error ? (
              <ErrorState message={error} onRetry={loadExperiences} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No matching experiences found"
                description="Try adjusting your search terms or clearing the selected filters."
                action={
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedArtForm('all');
                      setSelectedCity('all');
                    }}
                  >
                    Clear All Filters
                  </button>
                }
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '2rem',
                }}
              >
                {filtered.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Corporate Partnership & Customization Callout ─────────────── */}
        <section style={{ background: 'var(--color-surface-2)', padding: '4.5rem 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div style={{ maxWidth: 680 }}>
                <span className="section-label">Custom Corporate Programs</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '1rem' }}>
                  Need a Bespoke Engagement for 100+ Employees?
                </h2>
                <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  We design multi-city employee cultural programs, custom artisan gifting suites, and
                  annual CSR cultural heritage revival initiatives tailored precisely to your brand values.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/contact?type=corporate" className="btn btn-primary">
                    Request Custom Proposal
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/corporate/signup" className="btn btn-secondary">
                    Create Corporate Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

/* ─── Individual Experience Card Component ───────────────────────────────── */
function ExperienceCard({ experience }) {
  const {
    id,
    name,
    shortDescription,
    artForm,
    artist,
    dateDisplay,
    startTime,
    duration,
    city,
    venue,
    price,
    availableSeats,
    coverImage,
    category,
  } = experience;

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-xl)',
        transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: 230, overflow: 'hidden' }}>
        <img
          src={coverImage}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
          }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
          }}
        />

        {/* Category Tag */}
        <div style={{ position: 'absolute', top: 14, left: 14 }}>
          <span
            className="badge"
            style={{
              background: 'rgba(255,255,255,0.92)',
              color: 'var(--color-primary-dark)',
              fontWeight: 700,
              fontSize: '0.7rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            {category}
          </span>
        </div>

        {/* Availability Pill */}
        <div style={{ position: 'absolute', bottom: 12, right: 14 }}>
          <span
            className="badge"
            style={{
              background: availableSeats <= 10 ? 'rgba(220,38,38,0.9)' : 'rgba(45,106,79,0.9)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            {availableSeats} seats remaining
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Art Form & Artist */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-terracotta)' }}>
            {artForm}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            By {artist.name}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'var(--color-text)',
            marginBottom: '0.75rem',
          }}
        >
          <Link
            to={`/corporate/experiences/${id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {name}
          </Link>
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)',
            lineHeight: 1.6,
            marginBottom: '1.25rem',
            flex: 1,
          }}
        >
          {shortDescription}
        </p>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            padding: '0.875rem 0',
            borderTop: '1px solid var(--color-border-light)',
            borderBottom: '1px solid var(--color-border-light)',
            marginBottom: '1.25rem',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {dateDisplay.split(',')[1] || dateDisplay}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span>{startTime} ({duration})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', gridColumn: 'span 2' }}>
            <MapPin size={14} style={{ color: 'var(--color-terracotta)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {venue}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Per Participant
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              ₹{price.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/corporate/experiences/${id}`}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Details
            </Link>
            <Link
              to={`/corporate/experiences/${id}?register=true`}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Register
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
