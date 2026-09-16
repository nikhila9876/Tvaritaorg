import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  'Platform': [
    { label: 'Artists', to: '/artists' },
    { label: 'Art Forms', to: '/art-forms' },
    { label: 'Events', to: '/events' },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Stories', to: '/stories' },
    { label: 'Gallery', to: '/gallery' },
  ],
  'For Organizations': [
    { label: 'School Programs', to: '/school/dashboard' },
    { label: 'Corporate Experiences', to: '/corporate/dashboard' },
    { label: 'Partner With Us', to: '/contact' },
    { label: 'CSR Programs', to: '/contact?type=csr' },
  ],
  'Tvarita': [
    { label: 'About Us', to: '/about' },
    { label: 'Our Impact', to: '/#impact' },
    { label: 'Know Your Folk', to: '/#know-your-folk' },
    { label: 'Projects', to: '/#projects' },
    { label: 'Contact', to: '/contact' },
  ],
  'Legal': [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Refund Policy', to: '/refunds' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/tvaritacollective', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function PublicFooter() {
  return (
    <footer style={{ background: '#1C1C1C', color: '#E5E0D8', marginTop: 'auto' }}>
      {/* Main footer */}
      <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-10)' }}>
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
              and community engagement. Connecting tradition with the modern world.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                    color: '#9CA3AF',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9CA3AF'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-8)' }}>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>
                  {group}
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {links.map((link) => (
                    <li key={link.to}>
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
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { Icon: Mail, text: 'hello@tvaritacollective.com' },
                { Icon: Phone, text: '+91 98765 43210' },
                { Icon: MapPin, text: 'India' },
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
          <span>Built with ♥ for India's folk heritage.</span>
        </div>
      </div>
    </footer>
  );
}
