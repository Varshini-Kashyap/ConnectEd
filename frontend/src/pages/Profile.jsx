import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import NavBar from '../components/NavBar';
import AppFooter from '../components/AppFooter';
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
      useToastStore.getState().success('Profile updated successfully!');
    } catch (error) {
      useToastStore.getState().error('Failed to update profile. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream-50)' }}>
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border p-8 mb-6" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-warm)' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full mr-6" />
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--coral-600)' }}>{user.name}</h1>
                  <p className="text-sm" style={{ color: 'var(--cream-700)' }}>{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'var(--gold-600)', color: 'var(--cream-900)' }}>
                      {user.role === 'student' ? 'Student' : 'Alumni'}
                    </span>
                    {isStudent && profile.is_tutor && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'var(--sage-600)', color: 'white' }}>Tutor</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-8" style={{ background: 'var(--cream-50)', borderColor: 'var(--cream-300)', boxShadow: 'var(--shadow-warm)' }}>
            {!isEditing ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Basic Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Major</h3>
                      <p className="text-lg">{user.major || 'Not specified'}</p>
                    </div>
                    {user.minor && (
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Minor</h3>
                        <p className="text-lg">{user.minor}</p>
                      </div>
                    )}
                    {isStudent ? (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Year</h3>
                          <p className="text-lg">{user.year || 'Not specified'}</p>
                        </div>
                        {user.gpa && (
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>GPA</h3>
                            <p className="text-lg">{parseFloat(user.gpa).toFixed(2)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Graduation Year</h3>
                          <p className="text-lg">{user.graduation_year || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Company</h3>
                          <p className="text-lg">{user.company || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Job Title</h3>
                          <p className="text-lg">{user.job_title || 'Not specified'}</p>
                        </div>
                        {profile.location && (
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--cream-700)' }}>Location</h3>
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
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Career Goals</h2>
                        <p style={{ color: 'var(--cream-800)' }}>{profile.career_goals}</p>
                      </div>
                    )}

                    {profile.target_companies && profile.target_companies.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Target Companies</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.target_companies.map((company, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'var(--gold-600)', color: 'var(--cream-900)' }}>
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.areas_of_interest && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Areas of Interest</h2>
                        <p style={{ color: 'var(--cream-800)' }}>{profile.areas_of_interest}</p>
                      </div>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(255, 138, 111, 0.2)', color: 'var(--coral-600)' }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.looking_for && profile.looking_for.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Looking For</h2>
                        <ul className="list-disc list-inside space-y-1">
                          {profile.looking_for.map((item, idx) => (
                            <li key={idx} style={{ color: 'var(--cream-800)' }}>{item}</li>
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
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Expertise</h2>
                        <p style={{ color: 'var(--cream-800)' }}>{profile.expertise_areas}</p>
                      </div>
                    )}

                    {profile.career_journey && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Career Journey</h2>
                        <p style={{ color: 'var(--cream-800)' }}>{profile.career_journey}</p>
                      </div>
                    )}

                    {profile.help_offered && profile.help_offered.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Help Offered</h2>
                        <ul className="list-disc list-inside space-y-1">
                          {profile.help_offered.map((item, idx) => (
                            <li key={idx} style={{ color: 'var(--cream-800)' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Common */}
                {profile.hobbies && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: 'var(--cream-900)', borderColor: 'var(--cream-300)' }}>Hobbies & Interests</h2>
                    <p style={{ color: 'var(--cream-800)' }}>{profile.hobbies}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--cream-900)' }}>Edit Profile</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--cream-700)' }} aria-label="Form sections">
                  {isStudent ? 'Sections: Basic info · Career & goals' : 'Sections: Basic info · Career & details · Availability'}
                </p>
                {isStudent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Major *</label>
                        <input
                          type="text"
                          value={formData.major || user.major || ''}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Minor</label>
                        <input
                          type="text"
                          value={formData.minor || user.minor || ''}
                          onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Year *</label>
                        <select
                          value={formData.year || user.year || 'Freshman'}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="input-theme w-full px-4 py-2"
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Career Goals *</label>
                      <textarea
                        value={formData.career_goals || ''}
                        onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                        placeholder="e.g., I want to become a backend software engineer at a tech company..."
                        className="input-theme w-full px-4 py-2"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Target Companies (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.target_companies || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, target_companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Google, Amazon, Meta"
                        className="input-theme w-full px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Areas of Interest *</label>
                      <textarea
                        value={formData.areas_of_interest || ''}
                        onChange={(e) => setFormData({ ...formData, areas_of_interest: e.target.value })}
                        placeholder="e.g., Machine learning, cloud computing, mobile app development..."
                        className="input-theme w-full px-4 py-2"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.skills || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Python, Java, React, AWS"
                        className="input-theme w-full px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Hobbies *</label>
                      <textarea
                        value={formData.hobbies || ''}
                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                        placeholder="e.g., Swimming twice a week, play guitar, member of chess club..."
                        className="input-theme w-full px-4 py-2"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Looking For (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.looking_for || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, looking_for: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Career mentorship, Resume help, Study partners"
                        className="input-theme w-full px-4 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Major *</label>
                        <input
                          type="text"
                          value={formData.major || user.major || ''}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Minor</label>
                        <input
                          type="text"
                          value={formData.minor || user.minor || ''}
                          onChange={(e) => setFormData({ ...formData, minor: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Graduation Year *</label>
                        <input
                          type="number"
                          value={formData.graduation_year || user.graduation_year || ''}
                          onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Company *</label>
                        <input
                          type="text"
                          value={formData.company || user.company || ''}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Job Title *</label>
                        <input
                          type="text"
                          value={formData.job_title || user.job_title || ''}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Location</label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="San Francisco, CA"
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Industry</label>
                        <input
                          type="text"
                          value={formData.industry || ''}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="Technology"
                          className="input-theme w-full px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Expertise Areas *</label>
                      <textarea
                        value={formData.expertise_areas || formData.expertise || ''}
                        onChange={(e) => setFormData({ ...formData, expertise_areas: e.target.value, expertise: e.target.value })}
                        placeholder="e.g., Full-stack development with React and Node.js, cloud architecture on AWS..."
                        className="input-theme w-full px-4 py-2"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Career Journey</label>
                      <textarea
                        value={formData.career_journey || ''}
                        onChange={(e) => setFormData({ ...formData, career_journey: e.target.value })}
                        placeholder="e.g., Started as a frontend developer, moved into full-stack, now leading a team..."
                        className="input-theme w-full px-4 py-2"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Hobbies *</label>
                      <textarea
                        value={formData.hobbies || ''}
                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                        placeholder="e.g., Marathon runner, love playing tennis, active in local tech meetups..."
                        className="input-theme w-full px-4 py-2"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Help Offered (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.help_offered || []).join(', ')}
                        onChange={(e) => setFormData({ ...formData, help_offered: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Career guidance, Resume reviews, Technical mentorship"
                        className="input-theme w-full px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cream-800)' }}>Specific Technical Topics</label>
                      <input
                        type="text"
                        value={formData.specific_topics || formData.technical_topics || ''}
                        onChange={(e) => setFormData({ ...formData, specific_topics: e.target.value, technical_topics: e.target.value })}
                        placeholder="System design, AWS certification prep, React best practices"
                        className="input-theme w-full px-4 py-2"
                      />
                    </div>

                    <div className="p-4 rounded-lg space-y-3" style={{ background: 'var(--cream-100)' }}>
                      <h3 className="font-semibold" style={{ color: 'var(--cream-900)' }}>Mentorship Availability</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.accepting_requests !== false}
                          onChange={(e) => setFormData({ ...formData, accepting_requests: e.target.checked })}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--coral-600)' }}
                        />
                        <span className="ml-2 text-sm">Currently accepting connection requests</span>
                      </label>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: 'var(--cream-800)' }}>Response Time</label>
                        <select
                          value={formData.preferred_response_time || formData.response_time || 'Within 24 hours'}
                          onChange={(e) => setFormData({ ...formData, preferred_response_time: e.target.value, response_time: e.target.value })}
                          className="input-theme w-full px-3 py-2"
                        >
                          <option>Within 24 hours</option>
                          <option>2-3 days</option>
                          <option>When available</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1" style={{ color: 'var(--cream-800)' }}>Interaction Mode</label>
                        <select
                          value={formData.preferred_interaction || formData.interaction_mode || 'Any'}
                          onChange={(e) => setFormData({ ...formData, preferred_interaction: e.target.value, interaction_mode: e.target.value })}
                          className="input-theme w-full px-3 py-2"
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
                    className="flex-1 py-3 rounded-lg font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setFormData(user.profile_data || {});
                      setIsEditing(false);
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
                    style={{ background: 'var(--cream-200)', color: 'var(--cream-800)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}