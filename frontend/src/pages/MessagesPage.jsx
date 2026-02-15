import { useEffect, useState } from 'react';
import { messageAPI } from '../services/api';
import { useChatStore } from '../stores/chatStore';
import NavBar from '../components/NavBar';
import AppFooter from '../components/AppFooter';
import SkeletonConnectionRow from '../components/SkeletonConnectionRow';

export default function MessagesPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { openChat } = useChatStore();

  const fetchConnections = async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const response = await messageAPI.getAcceptedConnections();
      setConnections(response.data ?? []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setFetchError('Could not load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream-100)' }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <h1
          className="text-3xl font-bold mb-1 font-dm-sans"
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Messages
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--cream-700)' }}>
          Your conversations with connections
        </p>

        {fetchError && (
          <div className="mb-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
            <p className="text-sm" style={{ color: 'var(--cream-800)' }}>{fetchError}</p>
            <button type="button" onClick={fetchConnections} className="btn-secondary-warm text-sm py-2 px-4">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <ul className="space-y-3 stagger-children">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}><SkeletonConnectionRow /></li>
            ))}
          </ul>
        ) : connections.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed py-16 px-6 text-center"
            style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}
          >
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--cream-200)' }}>
              <svg className="w-10 h-10" style={{ color: 'var(--cream-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium" style={{ color: 'var(--cream-900)' }}>No conversations yet</p>
            <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--cream-700)' }}>
              Go to Career, find alumni you’d like to connect with, and send a connection request. Once they accept, you can message here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {connections.map((conn) => (
              <li key={conn.id}>
                <button
                  type="button"
                  onClick={() => openChat(conn)}
                  className="w-full rounded-xl border p-4 flex items-center gap-4 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-500)] focus-visible:ring-offset-2 profile-card-warm"
                  style={{ borderColor: 'var(--cream-300)' }}
                >
                  <img
                    src={conn.other_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.other_user?.name || '?')}`}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 shrink-0"
                    style={{ borderColor: 'var(--cream-300)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--cream-900)' }}>{conn.other_user?.name || 'Unknown'}</h3>
                    <p className="text-sm truncate mt-0.5" style={{ color: 'var(--cream-700)' }}>
                      {conn.other_user?.job_title && conn.other_user?.company
                        ? `${conn.other_user.job_title} · ${conn.other_user.company}`
                        : conn.other_user?.major || 'ConnectEd'}
                    </p>
                  </div>
                  <span className="btn-primary-warm shrink-0 text-sm py-2 px-4">Message</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
