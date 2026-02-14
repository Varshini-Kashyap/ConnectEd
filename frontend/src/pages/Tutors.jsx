import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      const response = await usersAPI.getTutors();
      setTutors(response.data);
    } catch (error) {
      console.error('Failed to load tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gmu-green mb-8">Find a Tutor</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <img src={tutor.avatar_url} alt={tutor.name} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 className="text-xl font-bold">{tutor.name}</h3>
                <p className="text-gray-600">{tutor.year}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>Major:</strong> {tutor.major}</p>
              <p className="text-sm"><strong>GPA:</strong> {tutor.gpa ? parseFloat(tutor.gpa).toFixed(2) : 'N/A'}</p>
            </div>
            
            <p className="text-gray-700 text-sm mb-4">{tutor.bio}</p>
            
            <div className="flex items-center justify-center bg-gmu-green text-white py-2 rounded">
              <span className="text-sm font-semibold">Available for Tutoring</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
