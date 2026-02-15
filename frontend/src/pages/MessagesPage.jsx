import { useEffect, useState } from 'react';
import { messageAPI } from '../services/api';
import { useChatStore } from '../stores/chatStore';
import NavBar from '../components/NavBar';

export default function MessagesPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openChat } = useChatStore();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await messageAPI.getAcceptedConnections();
        setConnections(response.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gmu-green mb-6">Messages</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gmu-green mx-auto"></div>
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No connections yet. Connect with alumni to start messaging!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                onClick={() => openChat(conn)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer flex items-center gap-4"
              >
                <img
                  src={conn.other_user.avatar_url}
                  alt={conn.other_user.name}
                  className="w-14 h-14 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{conn.other_user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {conn.other_user.job_title} @ {conn.other_user.company}
                  </p>
                </div>
                <button className="bg-gmu-green text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
