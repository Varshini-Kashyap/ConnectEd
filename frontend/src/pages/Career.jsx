import { useEffect, useState, useRef, useCallback } from 'react';
import { useCareerStore } from '../stores/careerStore';
import { useAuthStore } from '../stores/authStore';
import NavBar from '../components/NavBar';
import AppFooter from '../components/AppFooter';
import AlumniCard from '../components/AlumniCard';
import SkeletonAlumniCard from '../components/SkeletonAlumniCard';

const SEARCH_DEBOUNCE_MS = 400;

export default function Career() {
  const { alumni, connections, fetchAlumni, fetchConnections, loading, error } = useCareerStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const debounceRef = useRef(null);

  const majors = ['All', 'Computer Science', 'Information Systems', 'Data Science', 'Cyber Security Engineering', 'Systems Engineering', 'Biology', 'Psychology', 'Business', 'Economics', 'English', 'Mechanical Engineering', 'Nursing', 'Government'];
  const companies = ['All', 'Google', 'Amazon', 'Microsoft', 'Capital One', 'Accenture', 'Deloitte', 'Meta', 'Apple', 'Stripe', 'NIH', 'JPMorgan Chase', 'Federal Reserve', 'Boeing', 'Inova', 'CBO'];

  const fetchWithFilters = useCallback(() => {
    const params = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedMajor && selectedMajor !== 'All') params.major = selectedMajor;
    if (selectedCompany && selectedCompany !== 'All') params.company = selectedCompany;
    fetchAlumni(params);
  }, [searchTerm, selectedMajor, selectedCompany, fetchAlumni]);

  // Initial load: fetch connections; alumni are loaded by the filter effect below
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Single source of truth: when search term or pill filters change, refetch. Debounce only when user is typing (search term non-empty).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm.trim()) {
      fetchWithFilters();
      return;
    }
    debounceRef.current = setTimeout(fetchWithFilters, SEARCH_DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, selectedMajor, selectedCompany, fetchWithFilters]);

  const filteredAlumni = alumni.filter(alum => alum.id !== user?.id); // Don't show own profile

  const getConnectionStatus = (alumniId) => {
    const connection = connections.find(
      conn => conn.other_user?.id === alumniId
    );
    return { status: connection?.status, connection };
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream-100)' }}>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2 font-dm-sans"
            style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Career Networking
          </h1>
          <p className="text-lg" style={{ color: 'var(--cream-700)' }}>Connect with alumni and discover career opportunities</p>
        </div>

        <div className="relative mb-6">
          <svg
            className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
            style={{ color: 'var(--cream-700)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth={2} />
            <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, company, or major..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box-input pl-[4rem]"
          />
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2 font-dm-sans" style={{ color: 'var(--cream-900)' }}>Filter by Major</p>
            <div className="flex flex-wrap gap-3">
              {majors.map((major) => (
                <button
                  key={major}
                  onClick={() => setSelectedMajor(major)}
                  className={`filter-pill-warm px-5 py-2.5 rounded-full font-dm-sans font-medium text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 ${selectedMajor === major ? 'active-pill' : ''}`}
                  style={
                    selectedMajor === major
                      ? { background: 'var(--gradient-primary)', color: 'white', borderColor: 'var(--coral-600)' }
                      : { background: 'var(--cream-50)', color: 'var(--cream-800)', borderColor: 'var(--cream-300)' }
                  }
                >
                  {major}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2 font-dm-sans" style={{ color: 'var(--cream-900)' }}>Filter by Company</p>
            <div className="flex flex-wrap gap-3">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`filter-pill-warm px-5 py-2.5 rounded-full font-dm-sans font-medium text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 ${selectedCompany === company ? 'active-pill' : ''}`}
                  style={
                    selectedCompany === company
                      ? { background: 'var(--gradient-primary)', color: 'white', borderColor: 'var(--coral-600)' }
                      : { background: 'var(--cream-50)', color: 'var(--cream-800)', borderColor: 'var(--cream-300)' }
                  }
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.3)' }}>
            <p className="text-sm" style={{ color: 'var(--cream-900)' }}>{error}</p>
            <button type="button" onClick={() => fetchWithFilters()} className="btn-secondary-warm text-sm py-2 px-4">
              Retry
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <p className="font-dm-sans text-lg font-semibold" style={{ color: 'var(--cream-900)' }}>
            {filteredAlumni.length} {filteredAlumni.length === 1 ? 'alumnus' : 'alumni'} found
            {searchTerm ? ` matching "${searchTerm}"` : ''}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              title="Grid view"
              className={`view-btn-warm ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              type="button"
              title="List view"
              className={`view-btn-warm ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`stagger-children ${viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {Array.from({ length: 6 }, (_, i) => <SkeletonAlumniCard key={i} />)}
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: 'var(--cream-700)' }}>No alumni found matching your criteria</p>
            <p className="text-sm mb-6" style={{ color: 'var(--cream-600)' }}>Try a different search or broaden your filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedMajor('All'); setSelectedCompany('All'); fetchWithFilters(); }}
              className="btn-primary-warm py-2.5 px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={`stagger-children ${viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {filteredAlumni.map((alum) => {
              const { status, connection } = getConnectionStatus(alum.id);
              return (
                <AlumniCard
                  key={alum.id}
                  alumni={alum}
                  connectionStatus={status}
                  connection={connection}
                />
              );
            })}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
