import { useState, useEffect } from 'react';
import { usersAPI, connectionsAPI } from '../services/api';

export default function Alumni({ user }) {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = async () => {
    try {
      const response = await usersAPI.getAlumni();
      setAlumni(response.data);
    } catch (error) {
      console.error('Failed to load alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (alumniId) => {
    if (!user) {
      alert('Please login to connect with alumni');
      return;
    }
    
    try {
      await connectionsAPI.create({ target_id: alumniId, message }, user.id);
      alert('Connection request sent!');
      setSelectedAlumni(null);
      setMessage('');
    } catch (error) {
      alert('Failed to send connection request');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gmu-green mb-8">GMU Alumni Network</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((alum) => (
          <div key={alum.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <img src={alum.avatar_url} alt={alum.name} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 className="text-xl font-bold">{alum.name}</h3>
                <p className="text-gray-600">{alum.job_title}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>Company:</strong> {alum.company}</p>
              <p className="text-sm"><strong>Major:</strong> {alum.major}</p>
              <p className="text-sm"><strong>Graduated:</strong> {alum.graduation_year}</p>
            </div>
            
            <p className="text-gray-700 text-sm mb-4">{alum.bio}</p>
            
            <button
              onClick={() => setSelectedAlumni(alum)}
              className="w-full bg-gmu-green text-white py-2 rounded hover:bg-green-700 transition"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Connect with {selectedAlumni.name}</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to connect..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              rows="4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleConnect(selectedAlumni.id)}
                className="flex-1 bg-gmu-green text-white py-2 rounded hover:bg-green-700"
              >
                Send Request
              </button>
              <button
                onClick={() => setSelectedAlumni(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
