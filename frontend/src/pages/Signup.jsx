import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate student email
    if (formData.role === 'student' && !formData.email.endsWith('@gmu.edu')) {
      setError('Students must use @gmu.edu email address');
      return;
    }

    const success = await register(formData);
    if (success) {
      navigate('/questionnaire');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gmu-green to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gmu-green mb-2">Join ConnectEd</h1>
          <p className="text-gray-600">Create your GMU network account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={formData.role === 'student' ? 'yourname@gmu.edu' : 'your@email.com'}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
              required
            />
            {formData.role === 'student' && (
              <p className="text-xs text-gray-500 mt-1">Must be a @gmu.edu email address</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating Account...' : 'Continue to Profile Setup'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-gmu-green font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
