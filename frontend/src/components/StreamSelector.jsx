import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import NavBar from './NavBar';
import AppFooter from './AppFooter';

/** Heart icon for Valentine’s “Connect with heart” accent */
function HeartIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const listItemClasses = 'flex items-center gap-2 font-inter text-sm';
const listIconClasses = 'w-5 h-5 shrink-0 text-sage-600';

export default function StreamSelector() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream-100)' }}>
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14 flex-1 w-full">
        {/* Welcome */}
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-dm-sans text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--cream-900)' }}>
            Welcome back, {firstName}
          </h1>
          <p className="font-inter text-base sm:text-lg" style={{ color: 'var(--cream-700)' }}>
            Choose how you’d like to connect today
          </p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-sm" style={{ color: 'var(--cream-700)' }} aria-hidden="true">
            <HeartIcon className="w-4 h-4 text-coral-500" />
            Connect with heart
          </span>
        </header>

        {/* Cards: 1 for alumni (Career only), 2 for students (Career + Academic Help) */}
        <div className={`grid gap-6 sm:gap-8 ${isStudent ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>
          {/* Connect for Career — visible to everyone */}
          <article
            onClick={() => navigate('/career')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/career');
              }
            }}
            role="button"
            tabIndex={0}
            className="stream-card-warm group p-6 sm:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shrink-0"
              style={{ background: 'var(--gradient-success)' }}
              aria-hidden
            >
              {/* Career icon: briefcase (job / professional) */}
              <svg className="w-8 h-8 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="font-dm-sans text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--cream-900)' }}>
              Connect for Career
            </h2>
            <p className="font-inter text-sm sm:text-base mb-5" style={{ color: 'var(--cream-700)' }}>
              Network with GMU alumni at top companies. Get career advice, mentorship, and industry insights.
            </p>
            <ul className="space-y-2 mb-6">
              <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Browse alumni by company & major
              </li>
              <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                AI-powered match scores
              </li>
              <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Send connection requests
              </li>
            </ul>
            <span
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-dm-sans font-semibold text-white text-base transition-all duration-[250ms] ease-out group-hover:shadow-md group-hover:-translate-y-0.5"
              style={{
                background: 'var(--gradient-valentine, var(--gradient-primary))',
                boxShadow: '0 1px 3px 0 rgba(61, 50, 41, 0.1)',
              }}
            >
              Explore alumni network
              <HeartIcon className="w-4 h-4 opacity-90" />
            </span>
          </article>

          {/* Find Academic Help — students only */}
          {isStudent && (
            <article
              onClick={() => navigate('/student')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/student');
                }
              }}
              role="button"
              tabIndex={0}
              className="stream-card-warm group p-6 sm:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'var(--gradient-primary)' }}
                aria-hidden
              >
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="font-dm-sans text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--cream-900)' }}>
                Find Academic Help
              </h2>
              <p className="font-inter text-sm sm:text-base mb-5" style={{ color: 'var(--cream-700)' }}>
                Connect with peer tutors who excel in your courses. Get help with assignments, projects, and exam prep.
              </p>
              <ul className="space-y-2 mb-6">
                <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                  <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  One search — tutors, study buddies, partners
                </li>
                <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                  <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Top 10 matches for what you type
                </li>
                <li className={listItemClasses} style={{ color: 'var(--cream-800)' }}>
                  <svg className={listIconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Post help requests
                </li>
              </ul>
              <span
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-dm-sans font-semibold text-white text-base transition-all duration-[250ms] ease-out group-hover:shadow-md group-hover:-translate-y-0.5"
                style={{
                  background: 'var(--gradient-valentine, var(--gradient-primary))',
                  boxShadow: '0 1px 3px 0 rgba(61, 50, 41, 0.1)',
                }}
              >
                Search students
                <HeartIcon className="w-4 h-4 opacity-90" />
              </span>
            </article>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-sm" style={{ color: 'var(--cream-700)' }}>
          Made with <HeartIcon className="w-3.5 h-3.5 inline-block text-coral-500 align-middle" /> for Patriots
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
