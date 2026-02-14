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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gmu-green mb-2">Alumni Network</h1>
          <p className="text-gray-600">Connect with GMU graduates at top companies</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, company, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent text-lg"
            />
            <svg
              className="absolute left-4 top-4 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-6 space-y-4">
          {/* Major Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Filter by Major:</p>
            <div className="flex flex-wrap gap-2">
              {majors.map((major) => (
                <button
                  key={major}
                  onClick={() => setSelectedMajor(major)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedMajor === major
                      ? 'bg-gmu-green text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {major}
                </button>
              ))}
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Filter by Company:</p>
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedCompany === company
                      ? 'bg-gmu-gold text-gmu-green'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold text-gmu-green">{filteredAlumni.length}</span> alumni
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gmu-green mb-4"></div>
            <p className="text-gray-600 text-lg">Loading alumni...</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No alumni found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedMajor('All');
                setSelectedCompany('');
              }}
              className="mt-4 text-gmu-green hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
