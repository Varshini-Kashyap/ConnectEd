import { useState } from 'react';

export default function TutorCard({ tutor, matchScore, matchReasons, showMatchScore = false }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Match Score Badge (if applicable) */}
      {showMatchScore && matchScore !== undefined && (
        <div className="absolute top-4 right-4 bg-gmu-green text-white px-3 py-1 rounded-full text-sm font-bold">
          {matchScore}% Match
        </div>
      )}

      {/* Profile Section */}
      <div className="flex items-start mb-4">
        <img
          src={tutor.avatar_url || `https://ui-avatars.com/api/?name=${tutor.name}&background=006633&color=fff`}
          alt={tutor.name}
          className="w-16 h-16 rounded-full mr-4 border-2 border-gmu-green"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{tutor.name}</h3>
          <p className="text-gray-600">{tutor.year}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gmu-green font-semibold">
              GPA: {tutor.gpa?.toFixed(2) || 'N/A'}
            </span>
            {tutor.gpa >= 3.5 && (
              <span className="text-yellow-500 text-lg" title="High GPA">⭐</span>
            )}
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Can tutor:</p>
        <div className="flex flex-wrap gap-2">
          {tutor.courses?.slice(0, 4).map((course, idx) => (
            <span
              key={idx}
              className="bg-gmu-green text-white px-3 py-1 rounded-full text-xs font-semibold"
            >
              {course.code} ({course.grade})
            </span>
          ))}
          {tutor.courses?.length > 4 && (
            <span className="text-gray-500 text-xs py-1">
              +{tutor.courses.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Match Reasons (if applicable) */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Why this tutor:</p>
          <ul className="text-sm space-y-1">
            {matchReasons.map((reason, idx) => (
              <li key={idx} className="text-gray-700">• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hover Details Overlay */}
      {showDetails && tutor.bio && (
        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg p-6 flex flex-col justify-center z-10 animate-fadeIn">
          <p className="text-sm font-semibold text-gray-700 mb-2">About:</p>
          <p className="text-sm text-gray-700 mb-4">{tutor.bio}</p>
          {tutor.tutoring_sessions > 0 && (
            <p className="text-sm text-gmu-green font-semibold">
              ✓ {tutor.tutoring_sessions} tutoring sessions completed
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <button className="w-full bg-gmu-gold text-gmu-green py-2 rounded-lg hover:bg-yellow-400 transition font-semibold">
        Request Session
      </button>
    </div>
  );
}
