import { useState, useEffect } from 'react';
import MessageModal from './MessageModal';
import { aiAPI } from '../services/api';

export default function AlumniCard({ alumni, connectionStatus }) {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [matchReasons, setMatchReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score on mount
    const timer = setTimeout(() => {
      setAnimatedScore(alumni.match_score || 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [alumni.match_score]);

  const fetchMatchExplanation = async () => {
    if (matchReasons.length > 0) return;
    setLoadingReasons(true);
    try {
      const response = await aiAPI.getMatchExplanation(alumni.id);
      setMatchReasons(response.data.reasons);
    } catch (error) {
      console.error('Failed to fetch match explanation:', error);
    } finally {
      setLoadingReasons(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-blue-500 to-blue-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-400 to-gray-500';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Match Score Badge */}
        {alumni.match_score !== undefined && (
          <div
            className="relative mb-4"
            onMouseEnter={() => {
              setShowTooltip(true);
              fetchMatchExplanation();
            }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className={`${getScoreBadgeColor(alumni.match_score)} text-white px-4 py-2 rounded-full text-center font-bold text-lg inline-block cursor-help`}>
              {animatedScore}% Match
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute z-10 bg-gray-900 text-white p-4 rounded-lg shadow-xl mt-2 w-64 text-sm">
                <p className="font-semibold mb-2">Why this match?</p>
                {loadingReasons ? (
                  <p className="text-gray-300">Loading...</p>
                ) : (
                  <ul className="space-y-1">
                    {matchReasons.map((reason, idx) => (
                      <li key={idx} className="text-gray-200">• {reason}</li>
                    ))}
                  </ul>
                )}
                <div className="absolute -top-2 left-8 w-4 h-4 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="flex items-start mb-4">
          <img
            src={alumni.avatar_url || `https://ui-avatars.com/api/?name=${alumni.name}&background=006633&color=fff`}
            alt={alumni.name}
            className="w-16 h-16 rounded-full mr-4 border-2 border-gmu-green"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{alumni.name}</h3>
            <p className="text-gmu-green font-semibold">{alumni.job_title}</p>
            <p className="text-gray-600 text-sm">{alumni.company}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <p className="text-sm">
            <strong className="text-gray-700">Major:</strong> {alumni.major}
          </p>
          <p className="text-sm">
            <strong className="text-gray-700">Graduated:</strong> {alumni.graduation_year}
          </p>
          {alumni.location && (
            <p className="text-sm">
              <strong className="text-gray-700">Location:</strong> {alumni.location}
            </p>
          )}
        </div>

        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{alumni.bio}</p>

        {/* Match Score Bar */}
        {alumni.match_score !== undefined && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(alumni.match_score)} transition-all duration-1000 ease-out`}
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Connection Status or Button */}
        {connectionStatus === 'pending' ? (
          <div className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg text-center font-semibold">
            Request Pending
          </div>
        ) : connectionStatus === 'accepted' ? (
          <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg text-center font-semibold">
            ✓ Connected
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gmu-green text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Connect
          </button>
        )}
      </div>

      {showModal && (
        <MessageModal
          target={alumni}
          targetType="alumni"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
