import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import NavBar from '../components/NavBar';
import api from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user?.profile_data || {});
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const profile = user.profile_data || {};
  const isStudent = user.role === 'student';

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/complete-profile', formData);
      const updatedUser = { ...user, ...response.data, profile_data: formData };
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mr-6"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gmu-green">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block bg-gmu-gold text-gmu-green px-3 py-1 rounded-full text-sm font-semibold">
                      {user.role === 'student' ? 'Student' : 'Alumni'}
                    </span>
                    {isStudent && profile.is_tutor && (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Tutor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gmu-green text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {!isEditing ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600">Major</h3>
                      <p className="text-lg">{user.major || 'Not specified'}</p>
                    </div>
                    {user.minor && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600">Minor</h3>
                        <p className="text-lg">{user.minor}</p>
                      </div>
                    )}
                    {isStudent ? (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600">Year</h3>
                          <p className="text-lg">{user.year || 'Not specified'}</p>
                        </div>
                        {user.gpa && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-600">GPA</h3>
                            <p className="text-lg">{parseFloat(user.gpa).toFixed(2)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600">Graduation Year</h3>
                          <p className="text-lg">{user.graduation_year || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600">Company</h3>
                          <p className="text-lg">{user.company || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600">Job Title</h3>
                          <p className="text-lg">{user.job_title || 'Not specified'}</p>
                        </div>
                        {profile.location && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-600">Location</h3>
                            <p className="text-lg">{profile.location}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Student-specific */}
                {isStudent && (
                  <>
                    {profile.career_goals && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Career Goals</h2>
                        <p className="text-gray-700">{profile.career_goals}</p>
                      </div>
                    )}

                    {profile.target_companies && profile.target_companies.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Target Companies</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.target_companies.map((company, idx) => (
                            <span key={idx} className="bg-gmu-gold text-gmu-green px-3 py-1 rounded-full text-sm font-semibold">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.areas_of_interest && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Areas of Interest</h2>
                        <p className="text-gray-700">{profile.areas_of_interest}</p>
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.looking_for && profile.looking_for.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Looking For</h2>
                        <ul className="list-disc list-inside space-y-1">
                          {profile.looking_for.map((item, idx) => (
                            <li key={idx} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Alumni-specific */}
                {!isStudent && (
                  <>
                    {profile.expertise_areas && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Expertise</h2>
                        <p className="text-gray-700">{profile.expertise_areas}</p>
                      </div>
                    )}

                    {profile.career_journey && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Career Journey</h2>
                        <p className="text-gray-700">{profile.career_journey}</p>
                      </div>
                    )}

                    {profile.help_offered && profile.help_offered.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Help Offered</h2>
                        <ul className="list-disc list-inside space-y-1">
                          {profile.help_offered.map((item, idx) => (
                            <li key={idx} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Common */}
                {profile.hobbies && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Hobbies & Interests</h2>
                    <p className="text-gray-700">{profile.hobbies}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</h2>
                
                {isStudent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Major *</label>
                        <input
                          type="text"
                          value={formData.major || user.major || ''}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Minor</label>
                        <input
                          type="text"
                          value={formData.minor || user.minor || ''}
                          onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                        <select
                          value={formData.year || user.year || 'Freshman'}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        >
                          <option>Freshman</option>
                          <option>Sophomore</option>
                          <option>Junior</option>
                          <option>Senior</option>
                          <option>Graduate Student</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Career Goals *</label>
                      <textarea
                        value={formData.career_goals || ''}
                        onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                        placeholder="e.g., I want to become a backend software engineer at a tech company..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Target Companies (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.target_companies || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, target_companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Google, Amazon, Meta"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Areas of Interest *</label>
                      <textarea
                        value={formData.areas_of_interest || ''}
                        onChange={(e) => setFormData({ ...formData, areas_of_interest: e.target.value })}
                        placeholder="e.g., Machine learning, cloud computing, mobile app development..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.skills || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Python, Java, React, AWS"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies *</label>
                      <textarea
                        value={formData.hobbies || ''}
                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                        placeholder="e.g., Swimming twice a week, play guitar, member of chess club..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Looking For (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.looking_for || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, looking_for: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Career mentorship, Resume help, Study partners"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Major *</label>
                        <input
                          type="text"
                          value={formData.major || user.major || ''}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Minor</label>
                        <input
                          type="text"
                          value={formData.minor || user.minor || ''}
                          onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year *</label>
                        <input
                          type="number"
                          value={formData.graduation_year || user.graduation_year || ''}
                          onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                        <input
                          type="text"
                          value={formData.company || user.company || ''}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                        <input
                          type="text"
                          value={formData.job_title || user.job_title || ''}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="San Francisco, CA"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                        <input
                          type="text"
                          value={formData.industry || ''}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="Technology"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expertise Areas *</label>
                      <textarea
                        value={formData.expertise_areas || formData.expertise || ''}
                        onChange={(e) => setFormData({ ...formData, expertise_areas: e.target.value, expertise: e.target.value })}
                        placeholder="e.g., Full-stack development with React and Node.js, cloud architecture on AWS..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Career Journey</label>
                      <textarea
                        value={formData.career_journey || ''}
                        onChange={(e) => setFormData({ ...formData, career_journey: e.target.value })}
                        placeholder="e.g., Started as a frontend developer, moved into full-stack, now leading a team..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies *</label>
                      <textarea
                        value={formData.hobbies || ''}
                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                        placeholder="e.g., Marathon runner, love playing tennis, active in local tech meetups..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Help Offered (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.help_offered || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, help_offered: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Career guidance, Resume reviews, Technical mentorship"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Technical Topics</label>
                      <input
                        type="text"
                        value={formData.specific_topics || formData.technical_topics || ''}
                        onChange={(e) => setFormData({ ...formData, specific_topics: e.target.value, technical_topics: e.target.value })}
                        placeholder="System design, AWS certification prep, React best practices"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h3 className="font-semibold text-gray-800">Mentorship Availability</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.accepting_requests !== false}
                          onChange={(e) => setFormData({ ...formData, accepting_requests: e.target.checked })}
                          className="w-4 h-4 text-gmu-green"
                        />
                        <span className="ml-2 text-sm">Currently accepting connection requests</span>
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Response Time</label>
                        <select
                          value={formData.preferred_response_time || formData.response_time || 'Within 24 hours'}
                          onChange={(e) => setFormData({ ...formData, preferred_response_time: e.target.value, response_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option>Within 24 hours</option>
                          <option>2-3 days</option>
                          <option>When available</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Interaction Mode</label>
                        <select
                          value={formData.preferred_interaction || formData.interaction_mode || 'Any'}
                          onChange={(e) => setFormData({ ...formData, preferred_interaction: e.target.value, interaction_mode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option>Any</option>
                          <option>Coffee chats</option>
                          <option>Virtual calls</option>
                          <option>Email advice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setFormData(user.profile_data || {});
                      setIsEditing(false);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
