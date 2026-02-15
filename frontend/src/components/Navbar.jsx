import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';

export default function NavBar() {
  const { user, logout } = useAuthStore();
  const { clearAllChats } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await careerAPI.getPendingRequests();
        console.log('Pending requests response:', response.data);
        setPendingCount(response.data.length);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };
    
    fetchPending();
    const interval = setInterval(fetchPending, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAllChats(); // Clear all open chats
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gmu-green text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/stream-selector" className="text-2xl font-bold flex items-center">
            <span className="text-gmu-gold">Connect</span>Ed
          </Link>

          <div className="flex gap-6 items-center">
            <Link
              to="/career"
              className={`hover:text-gmu-gold transition ${
                location.pathname === '/career' ? 'text-gmu-gold' : ''
              }`}
            >
              Career
            </Link>
            <Link
              to="/student"
              className={`hover:text-gmu-gold transition ${
                location.pathname === '/student' ? 'text-gmu-gold' : ''
              }`}
            >
              Student
            </Link>
            <Link
              to="/profile"
              className={`hover:text-gmu-gold transition ${
                location.pathname === '/profile' ? 'text-gmu-gold' : ''
              }`}
            >
              Profile
            </Link>
            <Link
              to="/requests"
              className={`hover:text-gmu-gold transition relative ${
                location.pathname === '/requests' ? 'text-gmu-gold' : ''
              }`}
            >
              Requests
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              to="/messages"
              className={`hover:text-gmu-gold transition ${
                location.pathname === '/messages' ? 'text-gmu-gold' : ''
              }`}
            >
              Messages
            </Link>

            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
