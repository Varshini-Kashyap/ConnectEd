import { useEffect, useState } from 'react';
import { useStudentStore } from '../stores/studentStore';
import NavBar from '../components/NavBar';
import TutorCard from '../components/TutorCard';
import HelpRequestForm from '../components/HelpRequestForm';

export default function Student() {
  const { tutors, requests, courses, fetchTutors, fetchRequests, fetchCourses, loading } = useStudentStore();
  const [activeTab, setActiveTab] = useState('find'); // find, post, my-requests
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [filteredTutors, setFilteredTutors] = useState([]);

  useEffect(() => {
    fetchTutors();
    fetchRequests();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse === 'all') {
      setFilteredTutors(tutors);
    } else {
      setFilteredTutors(
        tutors.filter(tutor =>
          tutor.courses?.some(course => course.course_id === parseInt(selectedCourse))
        )
      );
    }
  }, [tutors, selectedCourse]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gmu-green mb-2">Student Help Center</h1>
          <p className="text-gray-600">Find tutors and get academic support</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'find'
                  ? 'text-gmu-green border-b-4 border-gmu-green'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📚 Find Tutors
            </button>
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'post'
                  ? 'text-gmu-green border-b-4 border-gmu-green'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ✋ Post Help Request
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'my-requests'
                  ? 'text-gmu-green border-b-4 border-gmu-green'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 My Requests
              {requests.length > 0 && (
                <span className="ml-2 bg-gmu-gold text-gmu-green px-2 py-1 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Find Tutors Tab */}
        {activeTab === 'find' && (
          <div>
            {/* Course Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Course:
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-bold text-gmu-green">{filteredTutors.length}</span> tutors
              </p>
            </div>

            {/* Tutors Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gmu-green mb-4"></div>
                <p className="text-gray-600 text-lg">Loading tutors...</p>
              </div>
            ) : filteredTutors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg mb-2">No tutors found</p>
                <p className="text-gray-500">Try selecting a different course</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Help Request Tab */}
        {activeTab === 'post' && (
          <div className="max-w-3xl mx-auto">
            <HelpRequestForm
              onSuccess={() => {
                fetchRequests();
                setActiveTab('my-requests');
              }}
            />
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg mb-4">No help requests yet</p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="bg-gmu-green text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Post Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Course ID: {request.course_id} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {request.urgent && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            🚨 Urgent
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'open' ? 'bg-green-100 text-green-800' :
                          request.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{request.description}</p>
                    <button
                      onClick={() => {
                        // Could implement view matches functionality here
                        alert('View matches feature coming soon!');
                      }}
                      className="bg-gmu-gold text-gmu-green px-4 py-2 rounded-lg hover:bg-yellow-400 font-semibold"
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
