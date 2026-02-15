import { useEffect, useState } from 'react';

const THEME_KEY = 'connected-theme';

/** Small heart icon for Valentine’s accent — decorative, aria-hidden when used with text */
function HeartIcon({ className = '', ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function AuthLayout({ children, title, subtitle }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Layer 1: Full-page illustration (spans entire viewport) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        aria-hidden
        style={{
          backgroundImage: 'url(/illustration.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Layer 2: Theme-aware overlay (full page) – lighter opacity so illustration shows through */}
      <div
        className="absolute inset-0 z-0 transition-colors duration-300"
        aria-hidden
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(160deg, rgba(26,20,16,0.82) 0%, rgba(45,36,25,0.85) 50%, rgba(26,20,16,0.88) 100%)'
              : 'linear-gradient(160deg, rgba(245,241,232,0.65) 0%, rgba(240,233,220,0.72) 50%, rgba(255,251,245,0.78) 100%)',
        }}
      />
      {/* Theme toggle - top right (above overlay) */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-[20] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream-100)]"
        style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-300)',
          boxShadow: 'var(--shadow-warm)',
          color: 'var(--coral-600)',
        }}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Centered card container (above overlay) */}
      <div className="relative z-[20] w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-warm-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <h1 className="font-dm-sans text-3xl font-bold text-center mb-1" style={{ color: 'var(--cream-900)' }}>
          ConnectEd
        </h1>
        {subtitle && (
          <p className="text-center text-sm mb-6" style={{ color: 'var(--cream-700)' }}>
            {subtitle}
          </p>
        )}

        {/* Card: form + tagline inside */}
        <div
          className="w-full rounded-2xl p-8 border shadow-warm-lg"
          style={{
            background: 'var(--cream-50)',
            borderColor: 'var(--cream-300)',
            boxShadow: 'var(--shadow-warm)',
          }}
        >
          {title && (
            <h2 className="font-dm-sans text-xl font-semibold text-center mb-2" style={{ color: 'var(--cream-900)' }}>
              {title}
            </h2>
          )}
          {/* Tagline inside the form card (Valentine’s touch: heart accent) */}
          <p
            className="text-center text-sm font-medium italic mb-6 flex items-center justify-center gap-1.5 flex-wrap"
            style={{ color: 'var(--sage-600)' }}
          >
            The Mason Network Reimagined.
            <span className="inline-flex items-center justify-center text-coral-500 transition-transform duration-300 hover:scale-110" aria-hidden="true" title="Connect with heart">
              <HeartIcon className="w-4 h-4" />
            </span>
          </p>
          {children}
        </div>
        {/* Valentine’s bonus: subtle “Made with heart” for Patriots */}
        <p className="mt-6 text-center text-xs select-none" style={{ color: 'var(--cream-700)' }}>
          Made with <HeartIcon className="w-3.5 h-3.5 inline-block text-coral-500" /> for Patriots
        </p>
      </div>
    </div>
  );
}
