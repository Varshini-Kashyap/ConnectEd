import { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';

export default function ConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await careerAPI.getPendingRequests();
      console.log('ConnectionRequests - Pending requests:', response.data);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      await careerAPI.acceptConnection(connectionId);
      setRequests(requests.filter(r => r.id !== connectionId));
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await careerAPI.declineConnection(connectionId);
      setRequests(requests.filter(r => r.id !== connectionId));
    } catch (error) {
      console.error('Error declining connection:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No pending connection requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gmu-green mb-4">
        Connection Requests ({requests.length})
      </h2>
      
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gmu-gold">
          <div className="flex items-start gap-4">
            <img
              src={request.requester.avatar_url}
              alt={request.requester.name}
              className="w-16 h-16 rounded-full"
            />
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">
                {request.requester.name}
              </h3>
              
              <p className="text-gray-600">
                {request.requester.role === 'student' ? (
                  <>
                    {request.requester.major} • {request.requester.year}
                  </>
                ) : (
                  <>
                    {request.requester.job_title} @ {request.requester.company}
                  </>
                )}
              </p>
              
              {request.message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 italic">"{request.message}"</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleAccept(request.id)}
              className="flex-1 bg-gmu-green text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => handleDecline(request.id)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-semibold"
            >
              ✗ Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
