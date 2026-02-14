import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const MAJORS = ['Computer Science', 'Information Systems', 'Information Technology', 'Software Engineering', 'Cyber Security Engineering', 'Data Science', 'Mathematics', 'Business', 'Engineering'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Government', 'Consulting', 'Education', 'Non-profit'];
const HELP_OFFERED = ['Career guidance and industry insights', 'Resume and cover letter reviews', 'Technical interview preparation', 'Behavioral interview preparation', 'Networking strategies and tips', 'Specific technical mentorship', 'Grad school and advanced degree advice', 'Work-life balance and career growth', 'Company/industry-specific questions'];

export default function AlumniQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    major: '',
    minor: '',
    graduation_year: new Date().getFullYear(),
    company: '',
    job_title: '',
    industry: '',
    location: '',
    expertise: '',
    career_journey: '',
    hobbies: '',
    help_offered: [],
    technical_topics: '',
    accepting_connections: true,
    response_time: 'Within 24 hours',
    interaction_mode: 'Any',
    max_connections: 10,
  });

  const handleSubmit = async () => {
    try {
      const response = await api.put('/auth/complete-profile', formData);
      console.log('Profile saved:', response.data);
      // Update user in auth store
      const updatedUser = { ...useAuthStore.getState().user, profile_completed: true, ...response.data };
      useAuthStore.getState().setUser(updatedUser);
      navigate('/stream-selector');
    } catch (error) {
      console.error('Profile save error:', error.response?.data || error.message);
      alert('Failed to save profile: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const years = Array.from({ length: 36 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gmu-green mb-2">Complete Your Alumni Profile</h1>
            <p className="text-gray-600">Step {step} of 3</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-gmu-green h-2 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>

          {/* Step 1: Basic & Professional Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic & Professional Profile</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Major at GMU *</label>
                <select
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  required
                >
                  <option value="">Select major</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minor (optional)</label>
                <select
                  value={formData.minor}
                  onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                >
                  <option value="">None</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year *</label>
                <select
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                >
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google, Amazon, Self-employed"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Role/Title *</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.major || !formData.company || !formData.job_title}
                className="w-full bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Expertise & Journey */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Expertise & Journey</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Professional areas of expertise *</label>
                <textarea
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g., Full-stack development with React and Node.js, cloud architecture on AWS..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="4"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">What topics can you mentor students on?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your career journey from GMU to now</label>
                <textarea
                  value={formData.career_journey}
                  onChange={(e) => setFormData({ ...formData, career_journey: e.target.value })}
                  placeholder="e.g., Started as a frontend developer, moved into full-stack, now leading a team..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="4"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies and interests outside of work *</label>
                <textarea
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="e.g., Marathon runner, love playing tennis, active in local tech meetups..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="3"
                  maxLength={300}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.expertise || !formData.hobbies}
                  className="flex-1 bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Mentorship & Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mentorship & Availability</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What kind of help can you offer?</label>
                <div className="space-y-2">
                  {HELP_OFFERED.map(item => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.help_offered.includes(item)}
                        onChange={() => setFormData({ ...formData, help_offered: toggleArrayItem(formData.help_offered, item) })}
                        className="w-4 h-4 text-gmu-green focus:ring-gmu-green border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specific technical topics (optional)</label>
                <textarea
                  value={formData.technical_topics}
                  onChange={(e) => setFormData({ ...formData, technical_topics: e.target.value })}
                  placeholder="e.g., System design, AWS certification prep, React best practices..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="2"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">Your Mentorship Availability</h3>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accepting_connections}
                    onChange={(e) => setFormData({ ...formData, accepting_connections: e.target.checked })}
                    className="w-4 h-4 text-gmu-green focus:ring-gmu-green border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Currently accepting connection requests from students</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Preferred response time:</label>
                  <select
                    value={formData.response_time}
                    onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Within 24 hours</option>
                    <option>2-3 days</option>
                    <option>When available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Preferred interaction mode:</label>
                  <select
                    value={formData.interaction_mode}
                    onChange={(e) => setFormData({ ...formData, interaction_mode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Any</option>
                    <option>Coffee chats</option>
                    <option>Virtual calls</option>
                    <option>Email advice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Maximum connections per month:</label>
                  <select
                    value={formData.max_connections}
                    onChange={(e) => setFormData({ ...formData, max_connections: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={999}>No limit</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
