import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import AppFooter from '../components/AppFooter';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useChatStore } from '../stores/chatStore';
import { careerAPI, notificationsAPI } from '../services/api';
import SkeletonNotificationRow from '../components/SkeletonNotificationRow';

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
  const { user } = useAuthStore();
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const { openChat } = useChatStore();

  const fetchNotifications = async () => {
    setFetchError(null);
    try {
      const res = await notificationsAPI.getNotifications();
      const data = res.data || {};
      setConnectionRequests(data.connection_requests ?? []);
      setMessageRequests(data.message_requests ?? []);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      setFetchError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      await careerAPI.acceptConnection(connectionId);
      setConnectionRequests((prev) => prev.filter((r) => r.id !== connectionId));
      useToastStore.getState().success('Connection accepted');
    } catch (e) {
      console.error('Accept failed:', e);
      useToastStore.getState().error('Something went wrong. Try again.');
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await careerAPI.declineConnection(connectionId);
      setConnectionRequests((prev) => prev.filter((r) => r.id !== connectionId));
      useToastStore.getState().success('Request declined');
    } catch (e) {
      console.error('Decline failed:', e);
      useToastStore.getState().error('Something went wrong. Try again.');
    }
  };

  const hasAny = connectionRequests.length > 0 || messageRequests.length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream-100)' }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
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

        {fetchError && (
          <div className="mb-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}>
            <p className="text-sm" style={{ color: 'var(--cream-800)' }}>{fetchError}</p>
            <button type="button" onClick={() => { setLoading(true); fetchNotifications(); }} className="btn-secondary-warm text-sm py-2 px-4">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonNotificationRow key={i} />
            ))}
          </div>
        ) : !hasAny ? (
          <div
            className="rounded-xl border py-16 px-6 text-center"
            style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)' }}
          >
            <p className="text-lg font-medium" style={{ color: 'var(--cream-900)' }}>No notifications yet</p>
            <p className="text-sm mt-2 mb-6" style={{ color: 'var(--cream-600)' }}>
              When someone sends you a connection request or message, it will appear here.
            </p>
            <Link
              to="/career"
              className="btn-primary-warm inline-flex py-3 px-6"
            >
              {user?.role === 'alumni' ? 'Go to Career' : 'Browse alumni'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {connectionRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 font-dm-sans" style={{ color: 'var(--cream-900)' }}>
                  Connection requests ({connectionRequests.length})
                </h2>
                <ul className="space-y-3">
                  {connectionRequests.map((req) => (
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
                        {req.requester && (
                          <p className="text-sm mt-0.5" style={{ color: 'var(--cream-700)' }}>
                            {req.requester.role === 'student'
                              ? [req.requester.major, req.requester.year].filter(Boolean).join(' • ') || 'Student'
                              : [req.requester.job_title, req.requester.company].filter(Boolean).join(' @ ') || 'Alumni'}
                          </p>
                        )}
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
                  New messages ({messageRequests.length})
                </h2>
                <ul className="space-y-3">
                  {messageRequests.map((msg) => (
                    <li
                      key={msg.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => msg.link && msg.sender && openChat({ id: msg.link, other_user: msg.sender })}
                      onKeyDown={(e) => e.key === 'Enter' && msg.link && msg.sender && openChat({ id: msg.link, other_user: msg.sender })}
                      className="rounded-xl border p-4 flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      {msg.sender?.avatar_url && (
                        <img
                          src={msg.sender.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 shrink-0"
                          style={{ borderColor: 'var(--cream-300)' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--cream-900)' }}>{msg.title || 'New message'}</p>
                        <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--cream-700)' }}>{msg.preview || ''}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--cream-600)' }}>{formatTime(msg.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
