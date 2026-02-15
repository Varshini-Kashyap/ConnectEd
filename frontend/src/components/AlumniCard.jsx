import { useState, useEffect, useRef } from 'react';
import MessageModal from './MessageModal';
import { aiAPI } from '../services/api';
import { useChatStore } from '../stores/chatStore';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function AlumniCard({ alumni, connectionStatus, connection }) {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [matchReasons, setMatchReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const { openChat } = useChatStore();

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(alumni.match_score || 0), 100);
    return () => clearTimeout(timer);
  }, [alumni.match_score]);

  // Fetch match reasons only when user hovers over the match badge (avoids N LLM calls per page load)
  const fetchedReasonsRef = useRef(false);
  const fetchReasons = () => {
    if (alumni.match_score === undefined || fetchedReasonsRef.current) return;
    fetchedReasonsRef.current = true;
    setLoadingReasons(true);
    aiAPI
      .getMatchExplanation(alumni.id)
      .then((response) => setMatchReasons(response.data.reasons || []))
      .catch((e) => console.error('Failed to fetch match explanation:', e))
      .finally(() => setLoadingReasons(false));
  };

  const initials = getInitials(alumni.name);

  return (
    <>
      <div className="profile-card-warm relative">
        <div className="relative h-20" style={{ background: 'var(--gradient-primary)' }}>
          {alumni.match_score !== undefined && (
            <div className="absolute top-4 right-4">
              <div
                className="relative inline-block px-3 py-1.5 rounded-full text-sm font-bold cursor-help"
                style={{ background: 'var(--coral-600)', color: 'white' }}
                onMouseEnter={() => {
                  setShowTooltip(true);
                  fetchReasons();
                }}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {animatedScore}% Match
                {showTooltip && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-4 rounded-lg shadow-xl text-sm z-20"
                    style={{ background: 'var(--cream-900)', color: 'var(--cream-100)' }}
                  >
                    <p className="font-semibold mb-2">Why this match?</p>
                    {loadingReasons ? (
                      <p className="text-sm opacity-80">Loading…</p>
                    ) : matchReasons.length > 0 ? (
                      <ul className="space-y-1">
                        {matchReasons.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm opacity-80">Unable to load reasons.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className="absolute left-6 rounded-full flex items-center justify-center font-dm-sans text-2xl font-bold text-white border-4 overflow-hidden"
            style={{
              bottom: '-40px',
              width: 80,
              height: 80,
              background: 'var(--gradient-primary)',
              borderColor: 'var(--cream-50)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {alumni.avatar_url ? (
              <img src={alumni.avatar_url} alt={alumni.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <h3 className="font-dm-sans text-xl font-semibold mb-1" style={{ color: 'var(--cream-900)' }}>
            {alumni.name}
          </h3>
          <p className="font-medium mb-1" style={{ color: 'var(--coral-600)' }}>{alumni.job_title}</p>
          <p className="text-sm mb-3" style={{ color: 'var(--cream-700)' }}>{alumni.company}</p>

          {/* AI suggestion (match reason) – always visible when we have a match score */}
          {alumni.match_score !== undefined && (
            <div className="match-reason-warm mb-4 flex gap-2 items-start">
              <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ stroke: 'var(--coral-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loadingReasons ? 'Loading match reasons...' : matchReasons.length > 0 ? matchReasons[0] : 'Shared interests and background'}</span>
            </div>
          )}

          {connectionStatus === 'pending' ? (
            <div className="w-full py-2.5 rounded-lg text-center font-semibold text-sm" style={{ background: 'rgba(255, 138, 111, 0.2)', color: 'var(--coral-600)' }}>
              Request Pending
            </div>
          ) : connectionStatus === 'accepted' ? (
            <div className="space-y-2">
              <div className="w-full py-2.5 rounded-lg text-center font-semibold text-sm" style={{ background: 'rgba(255, 138, 111, 0.25)', color: 'var(--coral-600)' }}>
                ✓ Connected
              </div>
              {connection && (
                <button
                  type="button"
                  onClick={() => openChat(connection)}
                  className="btn-primary-warm w-full"
                >
                  Message
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowModal(true);
                }}
                className="btn-primary-warm w-full"
              >
                Connect
              </button>
              <button type="button" className="btn-secondary-warm w-full">
                Message
              </button>
            </div>
          )}
        </div>
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
