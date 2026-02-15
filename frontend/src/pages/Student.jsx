import { useEffect, useState, useCallback, useRef } from 'react';
import { useStudentStore } from '../stores/studentStore';
import { useToastStore } from '../stores/toastStore';
import NavBar from '../components/NavBar';
import AppFooter from '../components/AppFooter';
import HelpRequestForm from '../components/HelpRequestForm';
import PartnerCard from '../components/PartnerCard';
import TutorCard from '../components/TutorCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { searchAPI } from '../services/api';

const SEARCH_DEBOUNCE_MS = 400;

export default function Student() {
  const { requests, fetchRequests, fetchCourses, getRequestMatches, matchRequest, deleteRequest, error: fetchError } = useStudentStore();

  const retryFetch = () => {
    fetchRequests();
    fetchCourses();
  };
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [matchModalRequest, setMatchModalRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [findingMatches, setFindingMatches] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmRequest, setDeleteConfirmRequest] = useState(null);
  const debounceRef = useRef(null);

  const openMatchModal = useCallback(async (request) => {
    setMatchModalRequest(request);
    setMatches([]);
    setMatchesLoading(true);
    try {
      const data = await getRequestMatches(request.id);
      setMatches(Array.isArray(data) ? data : []);
    } catch (_) {
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }, [getRequestMatches]);

  const runMatchAndRefresh = useCallback(async () => {
    if (!matchModalRequest) return;
    setFindingMatches(true);
    try {
      await matchRequest(matchModalRequest.id);
      const data = await getRequestMatches(matchModalRequest.id);
      setMatches(Array.isArray(data) ? data : []);
    } catch (_) {
      useToastStore.getState().error('Failed to find matches');
    } finally {
      setFindingMatches(false);
    }
  }, [matchModalRequest, matchRequest, getRequestMatches]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmRequest) return;
    const req = deleteConfirmRequest;
    setDeletingId(req.id);
    try {
      const ok = await deleteRequest(req.id);
      if (ok) {
        await fetchRequests();
        if (matchModalRequest?.id === req.id) setMatchModalRequest(null);
        useToastStore.getState().success('Request deleted');
      } else {
        useToastStore.getState().error('Could not delete request');
      }
    } finally {
      setDeletingId(null);
      setDeleteConfirmRequest(null);
    }
  }, [deleteConfirmRequest, deleteRequest, fetchRequests, matchModalRequest]);

  // Fetch all students on mount (default dashboard)
  const fetchAllStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchAPI.search('', 'student', 100);
      setResults(res.data || []);
    } catch (err) {
      console.error('Fetch students failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchCourses();
  }, []);

  // Default: show all students. As user types: debounce and show closest matches.
  useEffect(() => {
    if (activeTab !== 'search') return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      fetchAllStudents();
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchAPI.search(q, 'student', 10);
        setResults(res.data || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTab, fetchAllStudents]);

  const tabs = [
    { id: 'search', label: 'Search' },
    { id: 'post', label: 'Post Help Request' },
    { id: 'my-requests', label: 'My Requests', badge: requests.length },
  ];

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
            Student Networking
          </h1>
          <p className="text-lg" style={{ color: 'var(--cream-700)' }}>Find tutors and get academic support</p>
        </div>

        {fetchError && (
          <div className="mb-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
            <p className="text-sm" style={{ color: 'var(--cream-800)' }}>{fetchError}</p>
            <button type="button" onClick={retryFetch} className="btn-secondary-warm text-sm py-2 px-4">
              Retry
            </button>
          </div>
        )}

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

        {activeTab === 'search' && (
          <div>
            <p className="text-sm mb-4" style={{ color: 'var(--cream-700)' }}>
              All students are shown below. Type to filter and see the closest matches.
            </p>
            <div className="relative mb-6">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
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
                placeholder="Filter by anything — swimming partner, CS 310, study buddy, gym..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-box-input pl-12 w-full"
              />
            </div>
            {(loading || searching) && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 mb-3" style={{ borderColor: 'var(--coral-600)' }} />
                <p style={{ color: 'var(--cream-700)' }}>{searching ? 'Finding closest matches...' : 'Loading students...'}</p>
              </div>
            )}
            {!loading && !searching && (
              <>
                <p className="font-dm-sans text-lg font-semibold mb-4" style={{ color: 'var(--cream-900)' }}>
                  {results.length} {results.length === 1 ? 'student' : 'students'}
                  {query.trim() ? ' (closest matches)' : ''}
                </p>
                {results.length === 0 ? (
                  <div className="text-center py-16 rounded-xl border" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
                    <p className="text-lg mb-2" style={{ color: 'var(--cream-700)' }}>No matching profiles</p>
                    <p className="text-sm" style={{ color: 'var(--cream-700)' }}>Try different words or clear the search to see everyone</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {results.map((student) => (
                      <PartnerCard key={student.id} student={student} />
                    ))}
                  </div>
                )}
              </>
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
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--cream-900)' }}>No help requests yet</p>
                <p className="text-sm mb-6" style={{ color: 'var(--cream-700)' }}>Post a request to get matched with tutors who can help.</p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="btn-primary-warm px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                >
                  Post a help request
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
                      <div className="flex gap-2 flex-wrap">
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openMatchModal(request)}
                        className="btn-primary-warm"
                      >
                        View Matched Tutors
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmRequest(request)}
                        disabled={deletingId === request.id}
                        className="btn-secondary-warm border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        {deletingId === request.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirmRequest}
        title="Delete help request?"
        message={
          deleteConfirmRequest
            ? `"${deleteConfirmRequest.title}" will be permanently deleted. Matched tutors for this request will also be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmRequest(null)}
      />

      {/* Matched Tutors modal */}
      {matchModalRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(61, 50, 41, 0.4)' }}
          onClick={(e) => e.target === e.currentTarget && setMatchModalRequest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="matched-tutors-modal-title"
        >
          <div
            className="rounded-2xl border shadow-2xl max-h-[90vh] w-full max-w-2xl flex flex-col"
            style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--cream-300)' }}>
              <h2 id="matched-tutors-modal-title" className="text-xl font-bold font-dm-sans" style={{ color: 'var(--cream-900)' }}>
                Matched Tutors – {matchModalRequest.title}
              </h2>
              <button
                type="button"
                onClick={() => setMatchModalRequest(null)}
                className="p-2 rounded-lg hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {matchesLoading ? (
                <div className="py-12 text-center" style={{ color: 'var(--cream-700)' }}>
                  Loading matches…
                </div>
              ) : matches.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4" style={{ color: 'var(--cream-800)' }}>No matched tutors yet.</p>
                  <button
                    type="button"
                    onClick={runMatchAndRefresh}
                    disabled={findingMatches}
                    className="btn-primary-warm"
                  >
                    {findingMatches ? 'Finding tutors…' : 'Find Matched Tutors'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <TutorCard
                      key={match.tutor_id}
                      tutor={{
                        id: match.tutor_id,
                        name: match.tutor_name,
                        gpa: match.tutor_gpa,
                        avatar_url: match.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.tutor_name || '')}`,
                        courses: [],
                      }}
                      matchScore={match.match_score}
                      matchReasons={match.match_reasons}
                      showMatchScore={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}
