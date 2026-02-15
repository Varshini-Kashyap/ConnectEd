import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { notificationsAPI, careerAPI } from '../services/api';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function Notifications() {
  const [data, setData] = useState({ connection_requests: [], message_requests: [] });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getNotifications();
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      await careerAPI.acceptConnection(connectionId);
      fetchNotifications();
    } catch (e) {
      console.error('Accept failed:', e);
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await careerAPI.declineConnection(connectionId);
      fetchNotifications();
    } catch (e) {
      console.error('Decline failed:', e);
    }
  };

  const connRequests = data.connection_requests || [];
  const messageRequests = data.message_requests || [];
  const hasAny = connRequests.length > 0 || messageRequests.length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-100)' }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-3xl font-bold mb-2 font-dm-sans"
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Notifications
        </h1>
        <p className="text-lg mb-6" style={{ color: 'var(--cream-700)' }}>
          Connection requests, messages, and updates
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 mb-4" style={{ borderColor: 'var(--coral-600)' }} />
            <p style={{ color: 'var(--cream-700)' }}>Loading...</p>
          </div>
        ) : !hasAny ? (
          <div
            className="rounded-xl border py-16 px-6 text-center"
            style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}
          >
            <p className="text-lg" style={{ color: 'var(--cream-700)' }}>No notifications yet</p>
            <p className="text-sm mt-2" style={{ color: 'var(--cream-600)' }}>
              When someone sends you a connection request or message, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 font-dm-sans" style={{ color: 'var(--cream-900)' }}>
                  Connection requests
                </h2>
                <ul className="space-y-3">
                  {connRequests.map((req) => (
                    <li
                      key={req.id}
                      className="rounded-xl border p-4 flex items-start gap-4"
                      style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      <img
                        src={req.requester?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester?.name || '?')}`}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 shrink-0"
                        style={{ borderColor: 'var(--cream-300)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold" style={{ color: 'var(--cream-900)' }}>
                          {req.requester?.name || 'Someone'} wants to connect
                        </p>
                        {req.message && (
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--cream-700)' }}>
                            {req.message}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: 'var(--cream-600)' }}>
                          {formatTime(req.created_at)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => handleAccept(req.id)}
                            className="btn-primary-warm text-sm py-2 px-4"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(req.id)}
                            className="btn-secondary-warm text-sm py-2 px-4"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {messageRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 font-dm-sans" style={{ color: 'var(--cream-900)' }}>
                  Message requests
                </h2>
                <ul className="space-y-3">
                  {messageRequests.map((msg) => (
                    <li
                      key={msg.id}
                      className="rounded-xl border p-4"
                      style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      <p className="text-sm" style={{ color: 'var(--cream-800)' }}>{msg.preview || 'New message'}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--cream-600)' }}>{formatTime(msg.created_at)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
