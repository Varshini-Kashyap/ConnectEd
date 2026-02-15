import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';

function formatMessageTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ChatPopup({ connection, onClose, onMinimize, isMinimized, showList, onShowList, onSelectChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();
  const { openChat } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages(connection.id);
      const list = Array.isArray(response?.data) ? response.data : [];
      setMessages(list);
      setTimeout(scrollToBottom, 80);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
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
      setLoadingMessages(false);
      fetchConnections();
    } else if (connection?.id) {
      setLoadingMessages(true);
      setMessages([]);
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [connection?.id, showList]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      await messageAPI.sendMessage({
        connection_id: connection.id,
        content: text,
      });
      await fetchMessages();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatContainerClass = 'flex flex-col rounded-t-2xl overflow-hidden shadow-[0_-4px_24px_rgba(61,50,41,0.12)]';
  const headerStyle = {
    background: 'var(--gradient-primary)',
    color: 'white',
    padding: '0.75rem 1rem',
  };
  const listBg = 'var(--cream-100)';
  const inputBorder = 'var(--cream-300)';

  const chatPanelClass = 'w-full h-full flex flex-col overflow-hidden sm:w-[380px] sm:h-[520px] sm:rounded-t-2xl';
  if (isMinimized) {
    return (
      <div className="w-full sm:w-80 rounded-t-2xl overflow-hidden border border-b-0" style={{ background: 'var(--cream-50)', boxShadow: 'var(--shadow-lg)' }}>
        <div
          onClick={onMinimize}
          className="flex items-center justify-between cursor-pointer transition-opacity hover:opacity-95"
          style={headerStyle}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-semibold text-sm">Messages</span>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">✕</button>
        </div>
      </div>
    );
  }

  if (showList) {
    return (
      <div className={chatPanelClass} style={{ background: 'var(--cream-50)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between shrink-0" style={headerStyle}>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-semibold text-lg">Messages</span>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={onMinimize} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Minimize">−</button>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ background: listBg }}>
          {loadingConnections ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-[var(--coral-600)] border-[var(--cream-300)]" />
              <p className="text-sm" style={{ color: 'var(--cream-700)' }}>Loading conversations...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--cream-200)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--cream-700)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-medium" style={{ color: 'var(--cream-900)' }}>No conversations yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--cream-700)' }}>Accept connection requests from Career to start messaging.</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--cream-200)' }}>
              {connections.map((conn) => (
                <li key={conn.id}>
                  <button
                    type="button"
                    onClick={() => (onSelectChat ? onSelectChat(conn) : openChat(conn))}
                    className="w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-[var(--cream-200)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-500)] focus-visible:ring-inset"
                  >
                    <img
                      src={conn.other_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.other_user?.name || '?')}`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 shrink-0"
                      style={{ borderColor: 'var(--cream-300)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--cream-900)' }}>{conn.other_user?.name || 'Unknown'}</p>
                      <p className="text-sm truncate" style={{ color: 'var(--cream-700)' }}>
                        {conn.other_user?.job_title && conn.other_user?.company
                          ? `${conn.other_user.job_title} · ${conn.other_user.company}`
                          : conn.other_user?.major || 'ConnectEd'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--cream-500)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={chatPanelClass} style={{ background: 'var(--cream-50)', boxShadow: 'var(--shadow-lg)' }}>
      <header className="flex items-center justify-between shrink-0 gap-2" style={headerStyle}>
        <button
          type="button"
          onClick={onShowList}
          className="p-2 -ml-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
          aria-label="Back to conversations"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <img
            src={connection.other_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.other_user?.name || '?')}`}
            alt=""
            className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shrink-0"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold truncate">{connection.other_user?.name || 'Unknown'}</p>
            <p className="text-xs opacity-90 truncate">{connection.other_user?.job_title || connection.other_user?.major || 'ConnectEd'}</p>
          </div>
        </button>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={onMinimize} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Minimize">−</button>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">✕</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1" style={{ background: listBg }}>
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[var(--coral-600)] border-[var(--cream-300)]" />
            <p className="text-sm" style={{ color: 'var(--cream-700)' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--cream-200)' }}>
              <svg className="w-7 h-7" style={{ color: 'var(--coral-500)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--cream-900)' }}>Start the conversation</p>
            <p className="text-sm mt-1" style={{ color: 'var(--cream-700)' }}>Say hi to {connection.other_user?.name || 'them'}.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`chat-bubble max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    isMe ? 'chat-bubble-me' : 'chat-bubble-them'
                  }`}
                >
                  <p className="text-[15px] leading-snug break-words whitespace-pre-wrap" style={{ color: isMe ? 'white' : 'var(--cream-900)' }}>{msg.content}</p>
                  <p className={`text-[11px] mt-1.5 ${isMe ? 'text-white/80' : ''}`} style={!isMe ? { color: 'var(--cream-600)' } : undefined}>
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-2 shrink-0" />
      </div>

      <div className="shrink-0 p-3 border-t" style={{ background: 'var(--cream-50)', borderColor: inputBorder }}>
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-[15px] border-2 transition focus:outline-none focus:ring-2 focus:ring-[var(--coral-500)] focus:ring-offset-2 disabled:opacity-60 input-theme"
            style={{ borderColor: inputBorder }}
            aria-label="Message input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="btn-primary-warm shrink-0 px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            aria-label="Send message"
          >
            {sending ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Sending
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
