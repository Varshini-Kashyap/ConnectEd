import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import api from '../services/api';

const MAJORS = ['Computer Science', 'Information Systems', 'Information Technology', 'Software Engineering', 'Cyber Security Engineering', 'Data Science', 'Mathematics', 'Business', 'Engineering'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Government', 'Consulting', 'Education', 'Non-profit'];
const HELP_OFFERED = ['Career guidance and industry insights', 'Resume and cover letter reviews', 'Technical interview preparation', 'Behavioral interview preparation', 'Networking strategies and tips', 'Specific technical mentorship', 'Grad school and advanced degree advice', 'Work-life balance and career growth', 'Company/industry-specific questions'];

export default function AlumniQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
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
      // Upload resume first if provided
      if (resumeFile) {
        const resumeFormData = new FormData();
        resumeFormData.append('file', resumeFile);
        await api.post('/users/upload-resume', resumeFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      const response = await api.put('/auth/complete-profile', formData);
      const updatedUser = { ...useAuthStore.getState().user, profile_completed: true, ...response.data };
      useAuthStore.getState().setUser(updatedUser);
      const { fireHeartConfettiBurst } = await import('../utils/confetti');
      fireHeartConfettiBurst();
      navigate('/stream-selector');
    } catch (error) {
      console.error('Profile save error:', error.response?.data || error.message);
      const msg = error.response?.data?.detail || error.message;
      useToastStore.getState().error('Failed to save profile: ' + (typeof msg === 'string' ? msg : 'Please try again.'));
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const years = Array.from({ length: 36 }, (_, i) => new Date().getFullYear() - i);

  const inputClass =
    'w-full px-4 py-3 rounded-lg font-inter border-2 bg-[var(--cream-100)] border-[var(--cream-300)] text-[var(--cream-900)] placeholder-[#8B7E74] focus:outline-none focus:border-[var(--coral-600)] focus:ring-4 focus:ring-[rgba(255,138,111,0.15)] transition-all duration-200';
  const labelClass = 'block font-dm-sans text-sm font-medium mb-2';
  const sectionTitleClass = 'font-dm-sans text-xl font-bold mb-4';
  const btnPrimary =
    'w-full py-3.5 rounded-lg font-dm-sans font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2';
  const btnSecondary =
    'flex-1 py-3 rounded-lg font-dm-sans font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--cream-100)' }}>
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            background: 'var(--cream-50)',
            borderColor: 'var(--cream-300)',
            boxShadow: 'var(--shadow-warm)',
          }}
        >
          <div className="mb-8">
            <h1 className="font-dm-sans text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--cream-900)' }}>
              Complete your alumni profile
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--cream-700)' }}>Step {step} of 3</p>
            <div
              className="rounded-full overflow-hidden"
              style={{
                background: 'var(--cream-200)',
                height: '8px',
                width: '100%',
              }}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Step ${step} of 3`}
            >
              <div
                className="rounded-full h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(step / 3) * 100}%`,
                  minWidth: step >= 1 ? '8px' : 0,
                  background: 'var(--gradient-primary)',
                  display: 'block',
                }}
              />
            </div>
          </div>

          {/* Step 1: Basic & Professional Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Basic & professional profile</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Major at GMU *</label>
                <select value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} className={inputClass} required>
                  <option value="">Select major</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Minor (optional)</label>
                <select value={formData.minor} onChange={(e) => setFormData({ ...formData, minor: e.target.value })} className={inputClass}>
                  <option value="">None</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Graduation year *</label>
                <select
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                  className={inputClass}
                >
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Current company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google, Amazon, Self-employed"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Current role / title *</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Industry</label>
                  <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className={inputClass}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.major || !formData.company || !formData.job_title}
                className={btnPrimary}
                style={{ background: 'var(--gradient-primary)' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Expertise & Journey */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Your expertise & journey</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Professional areas of expertise *</label>
                <textarea
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g., Full-stack development with React and Node.js, cloud architecture on AWS..."
                  className={inputClass}
                  rows="4"
                  maxLength={500}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--cream-700)' }}>What topics can you mentor students on?</p>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Your career journey from GMU to now</label>
                <textarea
                  value={formData.career_journey}
                  onChange={(e) => setFormData({ ...formData, career_journey: e.target.value })}
                  placeholder="e.g., Started as a frontend developer, moved into full-stack, now leading a team..."
                  className={inputClass}
                  rows="4"
                  maxLength={500}
                />
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Hobbies and interests outside of work *</label>
                <textarea
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="e.g., Marathon runner, love playing tennis, active in local tech meetups..."
                  className={inputClass}
                  rows="3"
                  maxLength={300}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className={btnSecondary} style={{ background: 'var(--cream-200)', color: 'var(--cream-800)' }}>
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.expertise || !formData.hobbies}
                  className={`${btnSecondary} ${!formData.expertise || !formData.hobbies ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Mentorship & Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Mentorship & availability</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Upload Resume (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full px-4 py-2 border-2 rounded-lg input-theme"
                />
                {resumeFile && <p className="text-sm mt-1" style={{ color: 'var(--coral-600)' }}>✓ {resumeFile.name}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--cream-700)' }}>Accepted: PDF, DOCX, TXT</p>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>What kind of help can you offer?</label>
                <div className="space-y-2">
                  {HELP_OFFERED.map(item => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.help_offered.includes(item)}
                        onChange={() => setFormData({ ...formData, help_offered: toggleArrayItem(formData.help_offered, item) })}
                        className="w-4 h-4 rounded border-2 border-[var(--cream-300)] text-coral-600 focus:ring-coral-500"
                      />
                      <span className="text-sm" style={{ color: 'var(--cream-800)' }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Specific technical topics (optional)</label>
                <textarea
                  value={formData.technical_topics}
                  onChange={(e) => setFormData({ ...formData, technical_topics: e.target.value })}
                  placeholder="e.g., System design, AWS certification prep, React best practices..."
                  className={inputClass}
                  rows="2"
                />
              </div>

              <div className="p-4 rounded-xl border space-y-4" style={{ background: 'var(--cream-100)', borderColor: 'var(--cream-300)' }}>
                <h3 className="font-dm-sans font-semibold" style={{ color: 'var(--cream-900)' }}>Your mentorship availability</h3>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accepting_connections}
                    onChange={(e) => setFormData({ ...formData, accepting_connections: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-[var(--cream-300)] text-coral-600 focus:ring-coral-500"
                  />
                  <span className="text-sm" style={{ color: 'var(--cream-800)' }}>Currently accepting connection requests from students</span>
                </label>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--cream-800)' }}>Preferred response time</label>
                  <select value={formData.response_time} onChange={(e) => setFormData({ ...formData, response_time: e.target.value })} className={inputClass}>
                    <option>Within 24 hours</option>
                    <option>2-3 days</option>
                    <option>When available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--cream-800)' }}>Preferred interaction mode</label>
                  <select value={formData.interaction_mode} onChange={(e) => setFormData({ ...formData, interaction_mode: e.target.value })} className={inputClass}>
                    <option>Any</option>
                    <option>Coffee chats</option>
                    <option>Virtual calls</option>
                    <option>Email advice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--cream-800)' }}>Maximum connections per month</label>
                  <select value={formData.max_connections} onChange={(e) => setFormData({ ...formData, max_connections: parseInt(e.target.value) })} className={inputClass}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={999}>No limit</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className={btnSecondary} style={{ background: 'var(--cream-200)', color: 'var(--cream-800)' }}>
                  Back
                </button>
                <button onClick={handleSubmit} className={btnPrimary} style={{ background: 'var(--gradient-primary)' }}>
                  Complete profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
