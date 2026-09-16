import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, ChevronDown, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Ask Tvarita', to: '/ask-tvarita' },
  { label: 'About', to: '/about' },
  { label: 'Artists', to: '/artists' },
  { label: 'Art Forms', to: '/art-forms' },
  {
    label: 'Experiences',
    to: '/experiences',
    children: [
      { label: 'Performances', to: '/experiences?type=performance' },
      { label: 'Workshops', to: '/experiences?type=workshop' },
      { label: 'Corporate Events', to: '/experiences?type=corporate' },
    ],
  },
  { label: 'Events', to: '/events' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Stories', to: '/stories' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

function roleDashboard(role) {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'artist': return '/artist/dashboard';
    case 'school': return '/school/dashboard';
    case 'corporate': return '/corporate/dashboard';
    default: return '/app/profile';
  }
}

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const userMenuRef = useRef();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 'var(--header-height)',
          background: scrolled ? 'rgba(253,250,246,0.97)' : 'var(--color-bg)',
          borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          transition: 'all var(--transition-base)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-primary)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>T</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-lg)', lineHeight: 1.1, color: 'var(--color-text)' }}>
                Tvarita
              </div>
              <div style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-terracotta)', fontWeight: 600 }}>
                Arts Collective
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            {NAV_LINKS.slice(0, 7).map((link) => (
              <DesktopNavItem key={link.to} link={link} />
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Cart */}
            <Link to="/marketplace" className="btn btn-icon btn-ghost" aria-label="Cart" style={{ position: 'relative' }}>
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--color-terracotta)', color: '#fff',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)',
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={14} className="hide-mobile" />
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '0.5rem',
                    minWidth: 200, boxShadow: 'var(--shadow-lg)', zIndex: 200,
                  }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border-light)', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{user?.email}</div>
                    </div>
                    <Link
                      to={roleDashboard(user?.role)}
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/app/notifications"
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bell size={16} /> Notifications
                    </Link>
                    <Link
                      to="/app/profile"
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} /> Profile
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0.25rem 0' }} />
                    <button
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
                <Link to="/register" className="btn btn-terracotta btn-sm">Get Involved</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="btn btn-icon btn-ghost show-mobile-only"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            style={{
              position: 'absolute', top: 0, right: 0,
              width: '80%', maxWidth: 320, height: '100%',
              background: 'var(--color-surface)',
              padding: '5rem 1.5rem 2rem',
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `btn btn-ghost ${isActive ? 'btn-primary' : ''}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-terracotta" onClick={() => setMobileOpen(false)}>Get Involved</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function DesktopNavItem({ link }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!link.children) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [link.children]);

  if (!link.children) {
    return (
      <NavLink
        to={link.to}
        style={({ isActive }) => ({
          padding: '0.375rem 0.625rem',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          borderRadius: 'var(--radius-md)',
          color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
          background: isActive ? 'rgba(45,106,79,0.08)' : 'transparent',
          textDecoration: 'none',
          transition: 'all var(--transition-fast)',
        })}
      >
        {link.label}
      </NavLink>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.375rem 0.625rem',
          fontSize: 'var(--text-sm)', fontWeight: 500,
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)', background: 'transparent',
          border: 'none', cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {link.label} <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '0.5rem',
          minWidth: 200, boxShadow: 'var(--shadow-lg)', zIndex: 200,
        }}>
          {link.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              style={{ display: 'block', padding: '0.5rem 0.75rem', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', transition: 'background var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
