import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useChatStore } from './stores/chatStore';
import ThemeSync from './components/ThemeSync';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Questionnaire from './pages/Questionnaire';
import StreamSelector from './components/StreamSelector';
import Career from './pages/Career';
import Student from './pages/Student';
import Profile from './pages/Profile';
import RequestsPage from './pages/RequestsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPopup from './components/ChatPopup';
import MessagingButton from './components/MessagingButton';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user && !user.profile_completed) {
    return <Navigate to="/questionnaire" />;
  }
  
  return children;
}

function App() {
  const { openChats, closeChat, minimizeChat, showChatList, showChatWindow } = useChatStore();
  
  return (
    <Router>
      <ThemeSync />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route
          path="/stream-selector"
          element={
            <ProtectedRoute>
              <StreamSelector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <Career />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <Student />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      
      {/* Floating Messaging Button */}
      <MessagingButton />
      
      {/* Chat Popups - Fixed positioning, won't affect page layout */}
      {openChats.map((chat, index) => (
        <div key={chat.connection.id} style={{ position: 'fixed', bottom: 0, right: `${16 + (index * 400)}px`, zIndex: 1000 }}>
          <ChatPopup
            connection={chat.connection}
            isMinimized={chat.isMinimized}
            showList={chat.showList}
            onClose={() => closeChat(chat.connection.id)}
            onMinimize={() => minimizeChat(chat.connection.id)}
            onShowList={() => showChatList(chat.connection.id)}
            onSelectChat={(conn) => showChatWindow(chat.connection.id)}
          />
        </div>
      ))}
    </Router>
  );
}

export default App;
