import { useEffect, useState } from 'react';
import { useStudentStore } from '../stores/studentStore';
import NavBar from '../components/NavBar';
import TutorCard from '../components/TutorCard';
import HelpRequestForm from '../components/HelpRequestForm';

export default function Student() {
  const { tutors, requests, courses, fetchTutors, fetchRequests, fetchCourses, loading } = useStudentStore();
  const [activeTab, setActiveTab] = useState('find');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchTutors();
    fetchRequests();
    fetchCourses();
  }, []);

  useEffect(() => {
    let list = tutors;
    if (selectedCourse !== 'all') {
      list = list.filter(tutor =>
        tutor.courses?.some(c => c.course_id === parseInt(selectedCourse, 10))
      );
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(tutor =>
        tutor.name?.toLowerCase().includes(q) ||
        tutor.courses?.some(c => courses.find(co => co.id === c.course_id)?.code?.toLowerCase().includes(q))
      );
    }
    setFilteredTutors(list);
  }, [tutors, selectedCourse, searchTerm, courses]);

  const tabs = [
    { id: 'find', label: 'Find Tutors' },
    { id: 'post', label: 'Post Help Request' },
    { id: 'my-requests', label: 'My Requests', badge: requests.length },
  ];

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
            Student Networking
          </h1>
          <p className="text-lg" style={{ color: 'var(--cream-700)' }}>Find tutors and get academic support</p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {tabs.map(({ id, label, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`tab-btn-warm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 ${activeTab === id ? 'active' : ''}`}
            >
              {label}
              {badge > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={activeTab === id ? { background: 'rgba(255,255,255,0.3)', color: 'white' } : { background: 'var(--coral-600)', color: 'white' }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'find' && (
          <div>
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
                placeholder="e.g. Find a tutor for CS 310, or by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-box-input pl-[4rem]"
              />
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-2 font-dm-sans" style={{ color: 'var(--cream-900)' }}>Filter by Course</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCourse('all')}
                  className={`filter-pill-warm px-5 py-2.5 rounded-full font-dm-sans font-medium text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 ${selectedCourse === 'all' ? 'active-pill' : ''}`}
                  style={
                    selectedCourse === 'all'
                      ? { background: 'var(--gradient-primary)', color: 'white', borderColor: 'var(--coral-600)' }
                      : { background: 'var(--cream-50)', color: 'var(--cream-800)', borderColor: 'var(--cream-300)' }
                  }
                >
                  All Courses
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(String(course.id))}
                    className={`filter-pill-warm px-5 py-2.5 rounded-full font-dm-sans font-medium text-sm border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 ${selectedCourse === String(course.id) ? 'active-pill' : ''}`}
                    style={
                      selectedCourse === String(course.id)
                        ? { background: 'var(--gradient-primary)', color: 'white', borderColor: 'var(--coral-600)' }
                        : { background: 'var(--cream-50)', color: 'var(--cream-800)', borderColor: 'var(--cream-300)' }
                    }
                  >
                    {course.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <p className="font-dm-sans text-lg font-semibold" style={{ color: 'var(--cream-900)' }}>
                {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor' : 'tutors'} found
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
                <p className="text-lg" style={{ color: 'var(--cream-700)' }}>Loading tutors...</p>
              </div>
            ) : filteredTutors.length === 0 ? (
              <div className="text-center py-20 rounded-xl border" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
                <p className="text-lg mb-2" style={{ color: 'var(--cream-700)' }}>No tutors found</p>
                <p className="text-sm" style={{ color: 'var(--cream-700)' }}>Try selecting a different course</p>
              </div>
            ) : (
              <div className={viewMode === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'post' && (
          <div className="max-w-3xl mx-auto">
            <HelpRequestForm
              onSuccess={() => { fetchRequests(); setActiveTab('my-requests'); }}
            />
          </div>
        )}

        {activeTab === 'my-requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="text-center py-20 rounded-xl border" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
                <p className="text-lg mb-4" style={{ color: 'var(--cream-700)' }}>No help requests yet</p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="px-6 py-3 rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  Post Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border p-6"
                    style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-warm)' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--cream-900)' }}>{request.title}</h3>
                        <p className="text-sm mb-2" style={{ color: 'var(--cream-700)' }}>
                          Course ID: {request.course_id} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {request.urgent && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">🚨 Urgent</span>
                        )}
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={
                            request.status === 'open' ? { background: 'var(--coral-500)', color: 'white' } :
                            request.status === 'matched' ? { background: 'var(--coral-400)', color: 'var(--cream-900)' } :
                            { background: 'var(--cream-200)', color: 'var(--cream-800)' }
                          }
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <p className="mb-4" style={{ color: 'var(--cream-800)' }}>{request.description}</p>
                    <button
                      onClick={() => alert('View matches feature coming soon!')}
                      className="btn-primary-warm"
                    >
                      View Matched Tutors
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
