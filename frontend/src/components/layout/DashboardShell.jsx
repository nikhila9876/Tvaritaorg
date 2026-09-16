import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, LogOut, Bell, User, ChevronRight,
  LayoutDashboard, Users, Music, Calendar, BookOpen,
  ShoppingBag, BarChart3, Settings, FileText, Globe,
  Briefcase, GraduationCap, Wallet, Camera, BookMarked,
  Home, Clock, Mic2, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Artists', to: '/admin/artists', icon: Users },
    { label: 'Art Forms', to: '/admin/art-forms', icon: Music },
    { label: 'Events', to: '/admin/events', icon: Calendar },
    { label: 'Bookings', to: '/admin/bookings', icon: BookOpen },
    { label: 'Products', to: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', to: '/admin/orders', icon: FileText },
    { label: 'Knowledge', to: '/admin/knowledge', icon: BookMarked },
    { label: 'Community', to: '/admin/community', icon: Globe },
    { label: 'Impact', to: '/admin/impact', icon: BarChart3 },
    { label: 'Content', to: '/admin/content', icon: FileText },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ],
  artist: [
    { label: 'Dashboard', to: '/artist/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/artist/profile', icon: User },
    { label: 'Bookings', to: '/artist/bookings', icon: BookOpen },
    { label: 'Availability', to: '/artist/availability', icon: Calendar },
    { label: 'Earnings', to: '/artist/earnings', icon: Wallet },
    { label: 'Gallery', to: '/artist/gallery', icon: Camera },
    { label: 'Knowledge', to: '/artist/knowledge', icon: BookMarked },
  ],
  school: [
    { label: 'Dashboard', to: '/school/dashboard', icon: LayoutDashboard },
    { label: 'Programs', to: '/school/programs', icon: GraduationCap },
    { label: 'Bookings', to: '/school/bookings', icon: BookOpen },
    { label: 'Payments', to: '/school/payments', icon: Wallet },
    { label: 'Feedback', to: '/school/feedback', icon: FileText },
  ],
  corporate: [
    { label: 'Dashboard', to: '/corporate/dashboard', icon: LayoutDashboard },
    { label: 'Experiences', to: '/corporate/experiences', icon: Briefcase },
    { label: 'My Registrations', to: '/corporate/registrations', icon: BookOpen },
    { label: 'Notifications', to: '/corporate/notifications', icon: Bell },
    { label: 'Company Profile', to: '/corporate/profile', icon: User },
  ],
  user: [
    { label: 'Profile', to: '/app/profile', icon: User },
    { label: 'Notifications', to: '/app/notifications', icon: Bell },
  ],
};

export default function DashboardShell({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = {
    admin: 'NGO Admin',
    artist: 'Artist Portal',
    school: 'School Portal',
    corporate: 'Corporate Portal',
    user: 'My Account',
  }[role] || 'Dashboard';

  const notifLink = role === 'corporate' ? '/corporate/notifications' : '/app/notifications';
  const profileLink = role === 'corporate' ? '/corporate/profile' : '/app/profile';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: 'var(--sidebar-width)',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 60,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-base)',
        }}
          className="dashboard-sidebar"
        >
          {/* Sidebar header */}
          <div style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid var(--color-border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem', fontFamily: 'var(--font-serif)' }}>T</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1 }}>Tvarita</div>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-terracotta)', fontWeight: 600 }}>Arts Collective</div>
              </div>
            </Link>
            <button className="btn btn-icon btn-ghost" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '0.75rem 0.75rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="badge badge-green" style={{ fontSize: '0.625rem' }}>{roleLabel}</div>
            {role === 'corporate' && (
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.orgId || 'CORP'}
              </span>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(45,106,79,0.08)' : 'transparent',
                  marginBottom: '0.125rem',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)', flexShrink: 0,
              }}>
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Corporate Partner'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.companyName || user?.email}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} title="Tvarita Homepage">
                <Home size={14} />
              </Link>
              <Link to={notifLink} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} title="Notifications">
                <Bell size={14} />
              </Link>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', color: 'var(--color-error)' }} onClick={handleLogout} title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 0 }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 'var(--header-height)',
          background: 'rgba(253,250,246,0.97)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-icon btn-ghost" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={20} />
            </button>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {roleLabel}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/corporate/experiences" className="btn btn-secondary btn-sm hide-mobile" style={{ fontSize: 'var(--text-xs)' }}>
              <Briefcase size={14} /> Browse Experiences
            </Link>
            <Link to={notifLink} className="btn btn-icon btn-ghost" aria-label="Notifications">
              <Bell size={18} />
            </Link>
            <Link to={profileLink} className="btn btn-icon btn-ghost" aria-label="Profile">
              <User size={18} />
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 1200 }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
          .dashboard-sidebar ~ * {
            margin-left: var(--sidebar-width);
          }
        }
      `}</style>
    </div>
  );
}
