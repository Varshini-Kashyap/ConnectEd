import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { notificationsAPI } from '../services/api';

const THEME_KEY = 'connected-theme';

const navBarStyle = {
  background: 'var(--cream-50)',
  borderColor: 'var(--cream-300)',
  boxShadow: 'var(--shadow-sm)',
  padding: '1rem 1.5rem',
};

const dropdownStyle = {
  background: 'var(--cream-50)',
  borderColor: 'var(--cream-300)',
  boxShadow: 'var(--shadow-lg)',
};

function BriefcaseIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function NavBar() {
  const { user, logout } = useAuthStore();
  const { clearAllChats } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPending = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        if (cancelled) return;
        const data = response?.data ?? {};
        const list = data.connection_requests ?? [];
        setPendingCount(list.length);
      } catch (err) {
        if (!cancelled) console.error('Error fetching notifications:', err);
      }
    };
    fetchPending();
    const pendingInterval = setInterval(fetchPending, 10000);
    return () => {
      cancelled = true;
      clearInterval(pendingInterval);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    clearAllChats();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b" style={navBarStyle}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/stream-selector"
          className="flex items-center gap-3 font-dm-sans text-xl font-bold no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 rounded-lg"
          style={{ color: 'var(--cream-900)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <BriefcaseIcon className="w-[18px] h-[18px] text-white" />
          </div>
          ConnectEd
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Link to="/stream-selector" onClick={closeMobileMenu} className={`nav-link-warm block md:inline-block ${isActive('/stream-selector') ? 'active' : ''}`}>
              Home
            </Link>
            {user?.role !== 'alumni' && (
              <Link to="/student" onClick={closeMobileMenu} className={`nav-link-warm block md:inline-block ${isActive('/student') ? 'active' : ''}`}>
                Student
              </Link>
            )}
            <Link to="/career" onClick={closeMobileMenu} className={`nav-link-warm block md:inline-block ${isActive('/career') ? 'active' : ''}`}>
              Career
            </Link>
            <Link
              to="/notifications"
              onClick={closeMobileMenu}
              className={`nav-link-warm flex items-center justify-center relative p-2 md:p-2.5 ${isActive('/notifications') ? 'active' : ''}`}
              title="Notifications"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
            style={{ background: 'var(--cream-200)', color: 'var(--cream-900)' }}
            aria-expanded={mobileMenuOpen}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg py-1 pr-2 border-none bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                  style={{ color: 'var(--cream-900)' }}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Profile menu"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name || 'Profile'}
                    className="w-10 h-10 rounded-full object-cover border-2"
                    style={{ borderColor: 'var(--cream-300)' }}
                  />
                  <span className="text-sm font-dm-sans font-medium hidden sm:inline" style={{ color: 'var(--cream-800)' }}>
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--cream-700)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 py-1 min-w-[160px] rounded-lg border shadow-lg z-50" style={dropdownStyle}>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-sm font-dm-sans font-medium no-underline transition-colors hover:bg-[var(--cream-200)] focus:outline-none focus-visible:ring-0"
                      style={{ color: 'var(--cream-900)' }}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm font-dm-sans font-medium border-none bg-transparent cursor-pointer transition-colors hover:bg-[var(--cream-200)] focus:outline-none focus-visible:ring-0"
                      style={{ color: 'var(--cream-900)' }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                style={{ background: 'var(--cream-200)', color: 'var(--coral-600)' }}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span className="sr-only">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} aria-hidden />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[280px] flex flex-col border-l shadow-xl"
            style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--cream-300)' }}>
              <span className="font-dm-sans font-bold" style={{ color: 'var(--cream-900)' }}>Menu</span>
              <button type="button" onClick={closeMobileMenu} className="p-2 rounded-lg hover:bg-[var(--cream-200)] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500" aria-label="Close menu">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link to="/stream-selector" onClick={closeMobileMenu} className={`nav-link-warm block ${isActive('/stream-selector') ? 'active' : ''}`}>
                Home
              </Link>
              {user?.role !== 'alumni' && (
                <Link to="/student" onClick={closeMobileMenu} className={`nav-link-warm block ${isActive('/student') ? 'active' : ''}`}>
                  Student
                </Link>
              )}
              <Link to="/career" onClick={closeMobileMenu} className={`nav-link-warm block ${isActive('/career') ? 'active' : ''}`}>
                Career
              </Link>
              <Link to="/notifications" onClick={closeMobileMenu} className={`nav-link-warm flex items-center gap-2 ${isActive('/notifications') ? 'active' : ''}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
                {pendingCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">{pendingCount}</span>}
              </Link>
            </div>
            {user && (
              <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--cream-300)' }}>
                <div className="flex items-center gap-3 py-2">
                  <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: 'var(--cream-300)' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--cream-900)' }}>{user.name}</span>
                </div>
                <Link to="/profile" onClick={closeMobileMenu} className="nav-link-warm block">Profile</Link>
                <button type="button" onClick={toggleTheme} className="nav-link-warm block w-full text-left">
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button type="button" onClick={handleLogout} className="nav-link-warm block w-full text-left" style={{ color: 'var(--coral-600)' }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
