import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { messageAPI } from '../services/api';
import { useEffect, useState } from 'react';

export default function MessagingButton() {
  const { openChats, openChat, showChatList } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const [firstConnection, setFirstConnection] = useState(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) return;
    
    const fetchFirstConnection = async () => {
      try {
        const response = await messageAPI.getAcceptedConnections();
        if (response.data.length > 0) {
          setFirstConnection(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    fetchFirstConnection();
  }, [isAuthenticated]);

  const handleClick = () => {
    if (openChats.length > 0) {
      // If chat is already open, show the list
      showChatList(openChats[0].connection.id);
    } else if (firstConnection) {
      // Open first connection with list view
      openChat(firstConnection);
      setTimeout(() => showChatList(firstConnection.id), 100);
    }
  };

  // Don't show button if not authenticated or chat is already open
  if (!isAuthenticated || openChats.length > 0) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-gmu-green text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all hover:scale-110 z-50"
      title="Open Messages"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </button>
  );
}
