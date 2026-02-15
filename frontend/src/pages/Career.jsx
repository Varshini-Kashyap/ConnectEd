import { useEffect, useState } from 'react';
import { useCareerStore } from '../stores/careerStore';
import NavBar from '../components/NavBar';
import AlumniCard from '../components/AlumniCard';

export default function Career() {
  const { alumni, connections, fetchAlumni, fetchConnections, loading } = useCareerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const majors = ['All', 'Computer Science', 'Information Technology', 'Software Engineering', 'Cyber Security Engineering'];
  const companies = ['All', 'Google', 'Amazon', 'Microsoft', 'Capital One', 'Accenture', 'Deloitte'];

  useEffect(() => {
    fetchAlumni();
    fetchConnections();
  }, []);

  useEffect(() => {
    let filtered = alumni;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alum =>
        alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Major filter
    if (selectedMajor !== 'All') {
      filtered = filtered.filter(alum => alum.major === selectedMajor);
    }

    // Company filter
    if (selectedCompany && selectedCompany !== 'All') {
      filtered = filtered.filter(alum => alum.company === selectedCompany);
    }

    setFilteredAlumni(filtered);
  }, [alumni, searchTerm, selectedMajor, selectedCompany]);

  const getConnectionStatus = (alumniId) => {
    const connection = connections.find(
      conn => conn.target_id === alumniId || conn.requester_id === alumniId
    );
    return connection?.status;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-100)' }}>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-4" style={{ borderColor: 'var(--coral-600)' }} />
            <p className="text-lg" style={{ color: 'var(--cream-700)' }}>Loading alumni...</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-4" style={{ color: 'var(--cream-700)' }}>No alumni found matching your criteria</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedMajor('All'); setSelectedCompany(''); }}
              className="font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 rounded"
              style={{ color: 'var(--coral-600)' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
            {filteredAlumni.map((alum) => (
              <AlumniCard
                key={alum.id}
                alumni={alum}
                connectionStatus={getConnectionStatus(alum.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
