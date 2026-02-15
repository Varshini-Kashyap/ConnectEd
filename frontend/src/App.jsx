import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ThemeSync from './components/ThemeSync';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Questionnaire from './pages/Questionnaire';
import StreamSelector from './components/StreamSelector';
import Career from './pages/Career';
import Student from './pages/Student';
import Profile from './pages/Profile';
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
