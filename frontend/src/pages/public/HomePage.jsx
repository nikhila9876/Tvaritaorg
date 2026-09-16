import { Link } from 'react-router-dom';
import {
  ArrowRight, Music, Users, Calendar, ShoppingBag,
  BookOpen, Star, MapPin, Globe, Award, Heart, Mic2,
  Building2, GraduationCap, ChevronRight, Play,
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

/* ─── Data (to be replaced with real API data) ────────────────────── */
const OFFERINGS = [
  {
    icon: Mic2,
    color: 'var(--color-terracotta)',
    bg: '#FEE2D5',
    title: 'Curated Performances & Experiences',
    desc: 'Authentic folk and classical performances curated for schools, corporates, festivals and cultural events.',
  },
  {
    icon: ShoppingBag,
    color: 'var(--color-ochre)',
    bg: '#FEF3C7',
    title: 'Artist-Made Products',
    desc: 'Handcrafted products directly from master practitioners — pottery, textiles, paintings, instruments and more.',
  },
  {
    icon: GraduationCap,
    color: 'var(--color-blue)',
    bg: '#DBEAFE',
    title: 'Workshops & Masterclasses',
    desc: 'Immersive learning sessions led by master artists, tailored for all age groups and skill levels.',
  },
  {
    icon: Building2,
    color: 'var(--color-primary)',
    bg: '#D1FAE5',
    title: 'Corporate Engagements',
    desc: 'Employee engagement, cultural showcases, gifting programs and team experiences rooted in tradition.',
  },
  {
    icon: BookOpen,
    color: 'var(--color-purple)',
    bg: '#EDE9FE',
    title: 'Research & Storytelling',
    desc: 'Documenting living traditions through oral histories, artist journeys, and knowledge archives.',
  },
];

const IMPACT_STATS = [
  { value: '200+', label: 'Events Conducted', color: 'var(--color-primary)' },
  { value: '5,000+', label: 'Audience Reached', color: 'var(--color-terracotta)' },
  { value: '150+', label: 'Artists Supported', color: 'var(--color-ochre)' },
  { value: '40+', label: 'Art Forms Preserved', color: 'var(--color-blue)' },
  { value: '₹25L+', label: 'Artist Income Generated', color: 'var(--color-purple)' },
];

const FEATURED_ARTISTS = [
  { name: 'Ramesh Kumar', artForm: 'Madhubani Painting', region: 'Bihar', image: null },
  { name: 'Sunita Devi', artForm: 'Warli Art', region: 'Maharashtra', image: null },
  { name: 'Arjun Nath', artForm: 'Chhau Dance', region: 'Jharkhand', image: null },
  { name: 'Meera Bai', artForm: 'Phulkari Embroidery', region: 'Punjab', image: null },
];

const UPCOMING_EVENTS = [
  { title: 'Madhubani Art Workshop', date: 'Oct 5, 2026', location: 'Delhi', type: 'Workshop', spots: 20 },
  { title: 'Folk Music Evening', date: 'Oct 12, 2026', location: 'Mumbai', type: 'Performance', spots: 100 },
  { title: 'Corporate Cultural Day', date: 'Oct 18, 2026', location: 'Bangalore', type: 'Corporate', spots: 50 },
];

const STATES_DATA = [
  { name: 'Rajasthan', artForms: ['Ghoomar', 'Blue Pottery', 'Kalbelia'], color: 'var(--color-ochre)' },
  { name: 'Bihar', artForms: ['Madhubani Painting', 'Sujini Embroidery', 'Tikuli Art'], color: 'var(--color-terracotta)' },
  { name: 'Kerala', artForms: ['Kathakali', 'Mohiniyattam', 'Theyyam'], color: 'var(--color-primary)' },
  { name: 'Odisha', artForms: ['Odissi Dance', 'Pattachitra', 'Dhokra'], color: 'var(--color-blue)' },
  { name: 'Punjab', artForms: ['Phulkari', 'Bhangra', 'Giddha'], color: 'var(--color-purple)' },
  { name: 'Maharashtra', artForms: ['Warli', 'Lavani', 'Kolhapuri Crafts'], color: 'var(--color-ochre)' },
  { name: 'West Bengal', artForms: ['Baul Music', 'Kantha Stitch', 'Terracotta'], color: 'var(--color-terracotta)' },
  { name: 'Tamil Nadu', artForms: ['Bharatanatyam', 'Tanjore Painting', 'Kolam'], color: 'var(--color-primary)' },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <HeroSection />

      {/* Mission */}
      <MissionSection />

      {/* Offerings */}
      <OfferingsSection />

      {/* Know Your Folk */}
      <KnowYourFolkSection />

      {/* Featured Artists */}
      <FeaturedArtistsSection />

      {/* Upcoming Events */}
      <UpcomingEventsSection />

      {/* Impact */}
      <ImpactSection />

      {/* Join CTA */}
      <JoinSection />
    </PublicLayout>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 40%, #C45B39 100%)',
      }}
    >
      {/* Decorative pattern */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212,136,10,0.15) 0%, transparent 50%)`,
        }}
      />
      {/* Abstract folk art motif overlay */}
      <div
        style={{
          position: 'absolute', right: 0, top: 0,
          width: '50%', height: '100%',
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.03) 20px,
            rgba(255,255,255,0.03) 21px
          )`,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '0.375rem 1rem',
            marginBottom: '1.5rem',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#FDE68A',
            fontWeight: 600,
          }}>
            <Star size={12} fill="#FDE68A" />
            India's Living Heritage Platform
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            Preserving India's<br />
            <span style={{ color: '#FDE68A' }}>Living Heritage,</span><br />
            One Art Form at a Time
          </h1>

          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: 560,
          }}>
            Tvarita Arts Collective empowers master practitioners, connects indigenous traditions
            with modern audiences, and builds sustainable livelihoods for folk artists across India.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/art-forms" className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-primary)' }}>
              Explore Art Forms
              <ArrowRight size={18} />
            </Link>
            <Link to="/corporate/experiences" className="btn btn-lg" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}>
              <Play size={18} />
              Explore Experiences
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['150+', 'Artists'], ['40+', 'Art Forms'], ['200+', 'Events']].map(([val, lab]) => (
              <div key={lab}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: '#FDE68A' }}>{val}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Mission ────────────────────────────────────────────────────── */
function MissionSection() {
  const pillars = [
    { icon: Users, color: 'var(--color-primary)', title: 'Empower Artists', desc: 'Provide master practitioners with visibility, fair income and digital tools to reach wider audiences.' },
    { icon: Music, color: 'var(--color-terracotta)', title: 'Preserve Traditions', desc: 'Document oral histories, techniques and living knowledge before they are lost to time.' },
    { icon: Globe, color: 'var(--color-ochre)', title: 'Build Connections', desc: 'Bridge artists, communities, schools, corporates and art lovers through meaningful experiences.' },
  ];

  return (
    <section className="section" style={{ background: 'var(--color-surface-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label">Our Purpose</p>
          <h2 className="section-title" style={{ margin: '0 auto 1rem' }}>Mission & Vision</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            We believe folk and indigenous art forms are not relics of the past — they are
            vibrant, living expressions that deserve a thriving present and a sustainable future.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {pillars.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card" style={{ padding: '2rem', textAlign: 'center', border: 'none', boxShadow: 'var(--shadow-md)' }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <Icon size={28} style={{ color }} />
              </div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.625rem', fontFamily: 'var(--font-serif)' }}>{title}</h3>
              <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Offerings ──────────────────────────────────────────────────── */
function OfferingsSection() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="section-label">What We Do</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Our Offerings</h2>
          </div>
          <Link to="/experiences" className="btn btn-secondary btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {OFFERINGS.map(({ icon: Icon, color, bg, title, desc }) => (
            <Link
              key={title}
              to="/corporate/experiences"
              className="card"
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all var(--transition-base)', textDecoration: 'none', color: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Icon size={24} style={{ color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: '0.5rem', lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.6 }}>{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Know Your Folk ─────────────────────────────────────────────── */
function KnowYourFolkSection() {
  return (
    <section id="know-your-folk" className="section" style={{ background: 'var(--color-surface-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="section-label">Discover India</p>
          <h2 className="section-title" style={{ margin: '0 auto 1rem' }}>Know Your Folk</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Explore India's incredible diversity of folk and indigenous art forms, state by state.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATES_DATA.map(({ name, artForms, color }) => (
            <Link
              key={name}
              to={`/art-forms?state=${encodeURIComponent(name)}`}
              style={{
                display: 'block', padding: '1.25rem',
                background: 'var(--color-surface)',
                border: `1px solid var(--color-border)`,
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none', color: 'var(--color-text)',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <MapPin size={14} style={{ color }} />
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{name}</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {artForms.slice(0, 3).map((af) => (
                  <li key={af} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>• {af}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/art-forms" className="btn btn-primary">
            Explore All Art Forms <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Artists ───────────────────────────────────────────── */
function FeaturedArtistsSection() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="section-label">Our Community</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Meet the Artists</h2>
          </div>
          <Link to="/artists" className="btn btn-secondary btn-sm">View All Artists <ArrowRight size={14} /></Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {FEATURED_ARTISTS.map((artist) => (
            <Link
              key={artist.name}
              to={`/artists?name=${encodeURIComponent(artist.name)}`}
              className="card"
              style={{ textDecoration: 'none', color: 'var(--color-text)' }}
            >
              <div style={{
                height: 200, background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-border))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-2xl)', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-serif)',
                }}>
                  {artist.name[0]}
                </div>
              </div>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: '0.25rem' }}>{artist.name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-terracotta)', fontWeight: 600, marginBottom: '0.25rem' }}>{artist.artForm}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} /> {artist.region}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Events ─────────────────────────────────────────────────────── */
function UpcomingEventsSection() {
  const typeColors = {
    Workshop: { bg: '#DBEAFE', color: 'var(--color-blue)' },
    Performance: { bg: '#D1FAE5', color: 'var(--color-primary)' },
    Corporate: { bg: '#EDE9FE', color: 'var(--color-purple)' },
  };

  return (
    <section className="section" style={{ background: 'var(--color-surface-2)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="section-label">Upcoming</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Events & Experiences</h2>
          </div>
          <Link to="/events" className="btn btn-secondary btn-sm">View All Events <ArrowRight size={14} /></Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {UPCOMING_EVENTS.map((event) => {
            const colors = typeColors[event.type] || typeColors.Performance;
            return (
              <div key={event.title} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="badge" style={{ background: colors.bg, color: colors.color }}>{event.type}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{event.spots} spots</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: '0.625rem', fontFamily: 'var(--font-serif)' }}>{event.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {event.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} /> {event.location}
                  </span>
                </div>
                <Link to="/events" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Book Now
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Impact ─────────────────────────────────────────────────────── */
function ImpactSection() {
  return (
    <section id="impact" className="section" style={{ background: '#1C1C1C', color: '#fff' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ochre-light)', marginBottom: '0.75rem' }}>Verified Impact</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Our Impact in Numbers</h2>
        <p style={{ fontSize: 'var(--text-base)', color: '#9CA3AF', marginBottom: '3rem', maxWidth: 600, margin: '0 auto 3rem' }}>
          Every number here represents a real artist, a real event, a real cultural moment preserved.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          {IMPACT_STATS.map(({ value, label, color }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', fontWeight: 700, color, marginBottom: '0.375rem' }}>
                {value}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: '#9CA3AF' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Link to="/admin/impact" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            View Full Impact Report <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Join CTA ────────────────────────────────────────────────────── */
function JoinSection() {
  return (
    <section className="section">
      <div className="container">
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '4rem 3rem',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Heart size={20} fill="#FDE68A" style={{ color: '#FDE68A' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: '#FDE68A', fontWeight: 600, letterSpacing: '0.05em' }}>JOIN THE MOVEMENT</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Be Part of Preserving<br />India's Cultural Heritage
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-base)', marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Whether you're a school, a corporate, an art enthusiast, or an artist —
            there's a place for you in the Tvarita community.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-primary)' }}>
              Get Involved
            </Link>
            <Link to="/contact" className="btn btn-lg" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
