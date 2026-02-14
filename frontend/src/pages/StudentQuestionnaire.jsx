import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const MAJORS = ['Computer Science', 'Information Systems', 'Information Technology', 'Software Engineering', 'Cyber Security Engineering', 'Data Science', 'Mathematics', 'Business', 'Engineering'];
const COURSES = ['CS 112', 'CS 211', 'CS 310', 'CS 330', 'CS 367', 'CS 450', 'CS 465', 'CS 471', 'CS 483', 'MATH 113', 'MATH 114', 'MATH 213', 'MATH 125', 'STAT 344'];
const COMPANIES = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Startups', 'Finance', 'Healthcare', 'Government', 'Consulting'];
const SKILLS = ['Python', 'Java', 'C++', 'JavaScript', 'SQL', 'React', 'Django', 'Spring', 'Node.js', 'Git', 'Docker', 'AWS'];
const LOOKING_FOR = ['Career mentorship from alumni', 'Resume and interview help', 'Study partners for specific courses', 'Tutoring (I need help)', 'Tutoring (I can help others)', 'Project collaboration partners', 'Hobby and activity partners'];

export default function StudentQuestionnaire() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    major: '',
    minor: '',
    year: 'Freshman',
    courses_taken: [],
    career_goals: '',
    target_companies: [],
    areas_of_interest: '',
    skills: [],
    hobbies: '',
    looking_for: [],
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gmu-green mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Step {step} of 3</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-gmu-green h-2 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>

          {/* Step 1: Academic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Academic Profile</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Major *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">What year are you? *</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                >
                  <option>Freshman</option>
                  <option>Sophomore</option>
                  <option>Junior</option>
                  <option>Senior</option>
                  <option>Graduate Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Courses you've taken *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COURSES.map(course => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => setFormData({ ...formData, courses_taken: toggleArrayItem(formData.courses_taken, course) })}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        formData.courses_taken.includes(course)
                          ? 'bg-gmu-green text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Select all courses you've taken or are currently taking</p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.major || formData.courses_taken.length === 0}
                className="w-full bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Career & Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Career & Interests</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Career goals and target roles *</label>
                <textarea
                  value={formData.career_goals}
                  onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                  placeholder="e.g., I want to become a backend software engineer at a tech company..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="4"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.career_goals.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target companies or industries</label>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map(company => (
                    <button
                      key={company}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_companies: toggleArrayItem(formData.target_companies, company) })}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        formData.target_companies.includes(company)
                          ? 'bg-gmu-gold text-gmu-green'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Areas of interest *</label>
                <textarea
                  value={formData.areas_of_interest}
                  onChange={(e) => setFormData({ ...formData, areas_of_interest: e.target.value })}
                  placeholder="e.g., Machine learning, cloud computing, mobile app development..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="3"
                  maxLength={400}
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
                  disabled={!formData.career_goals || !formData.areas_of_interest}
                  className="flex-1 bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills & What You're Looking For</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skills & Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setFormData({ ...formData, skills: toggleArrayItem(formData.skills, skill) })}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        formData.skills.includes(skill)
                          ? 'bg-gmu-green text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies and interests outside academics *</label>
                <textarea
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="e.g., Swimming twice a week, play guitar, member of chess club..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green"
                  rows="3"
                  maxLength={300}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What are you looking for on ConnectEd?</label>
                <div className="space-y-2">
                  {LOOKING_FOR.map(item => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.looking_for.includes(item)}
                        onChange={() => setFormData({ ...formData, looking_for: toggleArrayItem(formData.looking_for, item) })}
                        className="w-4 h-4 text-gmu-green focus:ring-gmu-green border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
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
                  disabled={!formData.hobbies}
                  className="flex-1 bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
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
