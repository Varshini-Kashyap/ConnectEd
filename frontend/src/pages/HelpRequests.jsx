import { useState, useEffect } from 'react';
import { useToastStore } from '../stores/toastStore';
import { helpRequestsAPI, coursesAPI } from '../services/api';

export default function HelpRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    urgent: false
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    loadRequests();
    loadCourses();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await helpRequestsAPI.getAll('open');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      useToastStore.getState().error('Please login to create a help request');
      return;
    }
    
    try {
      await helpRequestsAPI.create(formData, user.id);
      useToastStore.getState().success('Help request created! AI is finding the best tutors for you.');
      setShowForm(false);
      setFormData({ course_id: '', title: '', description: '', urgent: false });
      loadRequests();
    } catch (error) {
      useToastStore.getState().error('Failed to create help request');
    }
  };

  const handleFindMatches = async (request) => {
    setSelectedRequest(request);
    setLoadingMatches(true);
    
    try {
      const response = await helpRequestsAPI.getMatches(request.id);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to load matches:', error);
      useToastStore.getState().error('Failed to find tutor matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gmu-green">Help Requests</h1>
        {user && user.role === 'student' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gmu-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            {showForm ? 'Cancel' : 'Request Help'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create Help Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="4"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.urgent}
                onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                className="w-4 h-4 text-gmu-green"
              />
              <label className="ml-2 text-sm text-gray-700">Mark as urgent</label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gmu-green text-white py-3 rounded-lg hover:bg-green-700"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{request.title}</h3>
                <p className="text-gray-600 text-sm">Course ID: {request.course_id}</p>
              </div>
              {request.urgent && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Urgent</span>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{request.description}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleFindMatches(request)}
                className="bg-gmu-gold text-gmu-green px-4 py-2 rounded hover:bg-yellow-400 font-semibold"
              >
                Find Tutors (AI)
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">AI-Matched Tutors</h3>
            
            {loadingMatches ? (
              <div className="text-center py-8">Finding best tutors with Groq AI...</div>
            ) : matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold">{match.tutor_name}</h4>
                      <span className="bg-gmu-green text-white px-3 py-1 rounded-full text-sm">
                        {match.match_score}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">GPA: {match.tutor_gpa?.toFixed(2) || 'N/A'}</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-semibold mb-1">Why this tutor:</p>
                      <ul className="text-sm space-y-1">
                        {match.match_reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8">No tutors available for this course yet.</p>
            )}
            
            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full mt-6 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
