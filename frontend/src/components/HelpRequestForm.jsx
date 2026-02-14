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

  const { courses, fetchCourses, createRequest, matchRequest, loading } = useStudentStore();

  useEffect(() => {
    fetchCourses();
  }, []);

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
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Analyzing State */}
        {matchingState === 'analyzing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gmu-green mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Analyzing your request...</p>
            <p className="text-gray-500 mt-2">Understanding what you need help with</p>
          </div>
        )}

        {/* Finding State */}
        {matchingState === 'finding' && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="inline-block bg-green-100 rounded-full p-4 mb-4 animate-bounce">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">🔍 Finding tutors...</p>
            <p className="text-gray-500">Checking qualified tutors in your course</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-gmu-green rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gmu-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gmu-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {/* Complete State */}
        {matchingState === 'complete' && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-block bg-green-500 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gmu-green mb-2">
                ✅ Found {matches.length} matching tutors!
              </h3>
              <p className="text-gray-600">📤 Notifications sent to all tutors</p>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-4 mb-6">
                {matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="animate-slideUp"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <TutorCard
                      tutor={{
                        id: match.tutor_id,
                        name: match.tutor_name,
                        gpa: match.tutor_gpa,
                        avatar_url: `https://ui-avatars.com/api/?name=${match.tutor_name}`,
                        courses: [],
                      }}
                      matchScore={match.match_score}
                      matchReasons={match.match_reasons}
                      showMatchScore={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                <p className="text-gray-600">No tutors available for this course yet.</p>
                <p className="text-sm text-gray-500 mt-2">Try posting in the general help forum</p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="w-full bg-gmu-green text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Post Another Request
            </button>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.5s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-2xl font-bold text-gmu-green mb-4">Request Help</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
        <select
          value={formData.course_id}
          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Need help with recursion"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you need help with in detail..."
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
          rows="4"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Be specific about topics, concepts, or assignments you need help with
        </p>
      </div>

      <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
        <input
          type="checkbox"
          checked={formData.urgent}
          onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
          className="w-5 h-5 text-gmu-green focus:ring-gmu-green border-gray-300 rounded"
        />
        <label className="ml-3 text-sm font-medium text-gray-700">
          🚨 Mark as urgent (exam/deadline approaching)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gmu-green text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition text-lg"
      >
        {loading ? 'Submitting...' : '🔍 Find Tutors Now'}
      </button>
    </form>
  );
}
