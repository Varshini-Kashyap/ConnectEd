import { useState, useEffect } from 'react';
import { useStudentStore } from '../stores/studentStore';
import TutorCard from './TutorCard';

export default function HelpRequestForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    urgent: false,
  });
  const [matchingState, setMatchingState] = useState('idle'); // idle, analyzing, finding, complete
  const [matches, setMatches] = useState([]);
  const [requestId, setRequestId] = useState(null);

  const { courses, fetchCourses, createRequest, matchRequest, loading, error } = useStudentStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    console.log('Courses loaded:', courses);
    if (courses && courses.length > 0) {
      console.log('First course:', courses[0]);
    }
  }, [courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: Analyzing
    setMatchingState('analyzing');
    const success = await createRequest(formData);
    
    if (!success) {
      setMatchingState('idle');
      return;
    }

    // Step 2: Finding tutors (with dramatic delay)
    setTimeout(async () => {
      setMatchingState('finding');
      
      // Get the latest request (just created)
      const requests = await useStudentStore.getState().fetchRequests();
      const latestRequest = requests?.[0];
      
      if (latestRequest) {
        setRequestId(latestRequest.id);
        const tutorMatches = await matchRequest(latestRequest.id);
        
        // Step 3: Show results with stagger
        setTimeout(() => {
          setMatches(tutorMatches);
          setMatchingState('complete');
        }, 1500);
      }
    }, 1000);
  };

  const resetForm = () => {
    setFormData({ course_id: '', title: '', description: '', urgent: false });
    setMatchingState('idle');
    setMatches([]);
    setRequestId(null);
    if (onSuccess) onSuccess();
  };

  if (matchingState !== 'idle') {
    return (
      <div className="rounded-xl border p-8" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-warm)' }}>
        {matchingState === 'analyzing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: 'var(--coral-600)' }}></div>
            <p className="text-xl font-semibold" style={{ color: 'var(--cream-800)' }}>Analyzing your request...</p>
            <p className="mt-2" style={{ color: 'var(--cream-700)' }}>Understanding what you need help with</p>
          </div>
        )}

        {matchingState === 'finding' && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="inline-block rounded-full p-4 mb-4 animate-bounce" style={{ background: 'var(--cream-200)' }}>
                <svg className="w-12 h-12" style={{ color: 'var(--coral-600)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: 'var(--cream-800)' }}> Finding tutors...</p>
            <p style={{ color: 'var(--cream-700)' }}>Checking qualified tutors in your course</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--coral-600)' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--coral-600)', animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--coral-600)', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {matchingState === 'complete' && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-block rounded-full p-4 mb-4" style={{ background: 'var(--coral-600)' }}>
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--coral-600)' }}>
                 Found {matches.length} matching tutors!
              </h3>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-4 mb-6">
                {matches.map((match, idx) => (
                  <div key={idx} className="animate-slideUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <TutorCard
                      tutor={{ id: match.tutor_id, name: match.tutor_name, gpa: match.tutor_gpa, avatar_url: `https://ui-avatars.com/api/?name=${match.tutor_name}`, courses: [] }}
                      matchScore={match.match_score}
                      matchReasons={match.match_reasons}
                      showMatchScore={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-lg mb-6" style={{ background: 'var(--cream-100)' }}>
                <p style={{ color: 'var(--cream-700)' }}>No tutors available for this course yet.</p>
                <p className="text-sm mt-2" style={{ color: 'var(--cream-700)' }}>Try posting in the general help forum</p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="w-full py-3 rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              Post Another Request
            </button>
          </div>
        )}

      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-warm)' }}>
      <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--coral-600)' }}>Request Help</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cream-800)' }}>Course *</label>
        <select
          value={formData.course_id}
          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
          className="input-theme w-full px-4 py-2"
          required
        >
          <option value="">Select a course</option>
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))
          ) : (
            <option disabled>Loading courses...</option>
          )}
        </select>
        {courses && courses.length === 0 && (
          <p className="text-xs text-red-500 mt-1">No courses available. Please contact support.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cream-800)' }}>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Need help with recursion"
          className="input-theme w-full px-4 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cream-800)' }}>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you need help with in detail..."
          className="input-theme w-full px-4 py-2"
          rows="4"
          required
        />
        <p className="text-xs mt-1" style={{ color: 'var(--cream-700)' }}>Be specific about topics, concepts, or assignments you need help with</p>
      </div>

      <div className="flex items-center p-3 rounded-lg" style={{ background: 'var(--cream-100)' }}>
        <input
          type="checkbox"
          checked={formData.urgent}
          onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
          className="w-5 h-5 rounded"
          style={{ accentColor: 'var(--coral-600)' }}
        />
        <label className="ml-3 text-sm font-medium" style={{ color: 'var(--cream-800)' }}>🚨 Mark as urgent (exam/deadline approaching)</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg disabled:opacity-50 font-semibold transition text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
        style={{ background: 'var(--gradient-primary)', color: 'white' }}
      >
        {loading ? 'Submitting...' : ' Find Tutors Now'}
      </button>
    </form>
  );
}
