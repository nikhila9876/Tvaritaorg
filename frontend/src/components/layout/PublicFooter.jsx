import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Share2, Heart, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  'Platform': [
    { label: 'Ask Tvarita (Cultural AI)', to: '/ask-tvarita' },
    { label: 'Corporate Experiences', to: '/corporate/experiences' },
    { label: 'Traditional Workshops', to: '/corporate/experiences' },
    { label: 'Folk Performances', to: '/corporate/experiences' },
    { label: 'Impact & Community', to: '/#impact' },
  ],
  'For Organizations': [
    { label: 'Corporate Dashboard', to: '/corporate/dashboard' },
    { label: 'Corporate Signup', to: '/corporate/signup' },
    { label: 'Verify OTP', to: '/corporate/verify-otp' },
    { label: 'Partner With Us', to: '/contact' },
  ],
  'Tvarita': [
    { label: 'Home', to: '/' },
    { label: 'Our Mission', to: '/#mission' },
    { label: 'Know Your Folk', to: '/#know-your-folk' },
    { label: 'Verified Impact', to: '/#impact' },
  ],
  'Legal & Governance': [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Engagement', to: '#' },
    { label: 'Artisan Charter', to: '#' },
  ],
};

export default function PublicFooter() {
  return (
    <footer style={{ background: '#1C1C1C', color: '#E5E0D8', marginTop: 'auto' }}>
      {/* Main footer */}
      <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-10)' }}>
          {/* Brand */}
          <div style={{ maxWidth: 360 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--font-serif)' }}>T</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-xl)', color: '#fff', lineHeight: 1 }}>Tvarita</div>
                <div style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-terracotta)', fontWeight: 600 }}>Arts Collective</div>
              </div>
            </Link>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: '#9CA3AF', marginBottom: '1.25rem' }}>
              Preserving India's living heritage through artist empowerment, immersive experiences,
              and community engagement. Connecting tradition with modern organizations.
            </p>
            {/* Social / Connect icons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://instagram.com/tvaritacollective"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                  color: '#9CA3AF',
                }}
              >
                <Globe size={16} />
              </a>
              <a
                href="mailto:corporate@tvaritacollective.com"
                aria-label="Email"
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                  color: '#9CA3AF',
                }}
              >
                <Mail size={16} />
              </a>
              <a
                href="https://tvaritacollective.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                  color: '#9CA3AF',
                }}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Nav groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>
                {group}
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{ fontSize: 'var(--text-sm)', color: '#9CA3AF', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>
              Corporate Inquiries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { Icon: Mail, text: 'corporate@tvaritacollective.com' },
                { Icon: Phone, text: '+91 98765 43210' },
                { Icon: MapPin, text: 'Bengaluru • Mumbai • Delhi' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: 'var(--text-sm)', color: '#9CA3AF' }}>
                  <Icon size={14} style={{ color: 'var(--color-terracotta)', flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="container"
          style={{
            paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '0.5rem',
            fontSize: 'var(--text-xs)', color: '#6B7280',
          }}
        >
          <span>© {new Date().getFullYear()} Tvarita Arts Collective. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Built with <Heart size={12} fill="#C45B39" color="#C45B39" /> for India's folk heritage.
          </span>
        </div>
      </div>
    </footer>
  );
}
