import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { messageAPI } from '../services/api';
import { useEffect, useState } from 'react';

export default function MessagingButton() {
  const { openChats, openChat, showChatList } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const [firstConnection, setFirstConnection] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchFirstConnection = async () => {
      try {
        const response = await messageAPI.getAcceptedConnections();
        if (response.data?.length > 0) {
          setFirstConnection(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    fetchFirstConnection();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const res = await messageAPI.getUnreadCount();
        setUnreadCount(res.data?.count ?? 0);
      } catch (_) {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleClick = () => {
    if (openChats.length > 0) {
      showChatList(openChats[0].connection.id);
    } else if (firstConnection) {
      openChat(firstConnection);
      setTimeout(() => showChatList(firstConnection.id), 100);
    }
  };

  if (!isAuthenticated || openChats.length > 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--coral-500)] relative"
        style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          boxShadow: 'var(--shadow-lg)',
        }}
        title={unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'Open Messages'}
        aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Open messages'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
