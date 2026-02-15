import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer
      className="mt-auto border-t py-4 px-4"
      style={{ borderColor: 'var(--cream-300)', background: 'var(--cream-50)' }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm" style={{ color: 'var(--cream-700)' }}>
        <span>ConnectEd · GMU</span>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <Link to="/career" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 rounded">
            Career
          </Link>
          <Link to="/profile" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 rounded">
            Profile
          </Link>
        </nav>
      </div>
    </footer>
  );
}
