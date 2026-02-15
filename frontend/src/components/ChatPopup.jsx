import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

export default function ChatPopup({ connection, onClose, onMinimize, isMinimized, showList, onShowList, onSelectChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const { openChat } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages(connection.id);
      setMessages(response.data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await messageAPI.getAcceptedConnections();
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchConnections();
    } else {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [connection.id, showList]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messageAPI.sendMessage({
        connection_id: connection.id,
        content: newMessage.trim()
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div className="w-80 bg-white rounded-t-lg shadow-2xl border-t-4 border-gmu-green">
        <div
          onClick={onMinimize}
          className="flex items-center justify-between p-3 bg-gmu-green text-white cursor-pointer hover:bg-green-700"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            <span className="font-semibold">Messaging</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:text-gmu-gold">
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Show list of all conversations
  if (showList) {
    return (
      <div className="w-96 bg-white rounded-t-lg shadow-2xl border-t-4 border-gmu-green flex flex-col" style={{ height: '500px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gmu-green text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            <span className="font-semibold text-lg">Messaging</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onMinimize} className="hover:text-gmu-gold text-xl">−</button>
            <button onClick={onClose} className="hover:text-gmu-gold">✕</button>
          </div>
        </div>

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loadingConnections ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gmu-green"></div>
            </div>
          ) : connections.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No connections yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  onClick={() => openChat(conn)}
                  className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition"
                >
                  <img
                    src={conn.other_user.avatar_url}
                    alt={conn.other_user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{conn.other_user.name}</div>
                    <div className="text-sm text-gray-600">{conn.other_user.job_title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show individual chat
  return (
    <div className="w-96 bg-white rounded-t-lg shadow-2xl border-t-4 border-gmu-green flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gmu-green text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <button onClick={onShowList} className="hover:text-gmu-gold mr-1">
            ←
          </button>
          <img
            src={connection.other_user.avatar_url}
            alt={connection.other_user.name}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <div>
            <div className="font-semibold">{connection.other_user.name}</div>
            <div className="text-xs opacity-90">{connection.other_user.job_title}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onMinimize} className="hover:text-gmu-gold text-xl">−</button>
          <button onClick={onClose} className="hover:text-gmu-gold">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start your conversation with {connection.other_user.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.sender_id === user.id
                    ? 'bg-gmu-green text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-green-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gmu-green text-sm"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-gmu-green text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
