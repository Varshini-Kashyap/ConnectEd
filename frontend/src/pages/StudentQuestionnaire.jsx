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
      const updatedUser = { ...useAuthStore.getState().user, profile_completed: true, ...response.data };
      useAuthStore.getState().setUser(updatedUser);
      const { fireHeartConfettiBurst } = await import('../utils/confetti');
      fireHeartConfettiBurst();
      navigate('/stream-selector');
    } catch (error) {
      console.error('Profile save error:', error.response?.data || error.message);
      alert('Failed to save profile: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg font-inter border-2 bg-[var(--cream-100)] border-[var(--cream-300)] text-[var(--cream-900)] placeholder-[#8B7E74] focus:outline-none focus:border-[var(--coral-600)] focus:ring-4 focus:ring-[rgba(255,138,111,0.15)] transition-all duration-200';
  const labelClass = 'block font-dm-sans text-sm font-medium mb-2';
  const sectionTitleClass = 'font-dm-sans text-xl font-bold mb-4';
  const chipBase =
    'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2';
  const chipSelected = 'border-coral-500 bg-coral-500/15 text-coral-600 border-[var(--coral-600)]';
  const chipUnselected = 'border-[var(--cream-300)] bg-[var(--cream-100)] hover:border-[var(--cream-700)]';
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
              Complete your profile
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

          {/* Step 1: Academic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Academic profile</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Major *</label>
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
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>What year are you? *</label>
                <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className={inputClass}>
                  <option>Freshman</option>
                  <option>Sophomore</option>
                  <option>Junior</option>
                  <option>Senior</option>
                  <option>Graduate Student</option>
                </select>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Courses you&apos;ve taken *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COURSES.map(course => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => setFormData({ ...formData, courses_taken: toggleArrayItem(formData.courses_taken, course) })}
                      className={`${chipBase} ${formData.courses_taken.includes(course) ? chipSelected : chipUnselected}`}
                      style={formData.courses_taken.includes(course) ? {} : { color: 'var(--cream-800)' }}
                    >
                      {course}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--cream-700)' }}>Select all courses you&apos;ve taken or are currently taking</p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.major || formData.courses_taken.length === 0}
                className={btnPrimary}
                style={{ background: 'var(--gradient-primary)' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Career & Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Career & interests</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Career goals and target roles *</label>
                <textarea
                  value={formData.career_goals}
                  onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                  placeholder="e.g., I want to become a backend software engineer at a tech company..."
                  className={inputClass}
                  rows="4"
                  maxLength={500}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--cream-700)' }}>{formData.career_goals.length}/500 characters</p>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Target companies or industries</label>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map(company => (
                    <button
                      key={company}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_companies: toggleArrayItem(formData.target_companies, company) })}
                      className={`${chipBase} ${formData.target_companies.includes(company) ? chipSelected : chipUnselected}`}
                      style={formData.target_companies.includes(company) ? {} : { color: 'var(--cream-800)' }}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Areas of interest *</label>
                <textarea
                  value={formData.areas_of_interest}
                  onChange={(e) => setFormData({ ...formData, areas_of_interest: e.target.value })}
                  placeholder="e.g., Machine learning, cloud computing, mobile app development..."
                  className={inputClass}
                  rows="3"
                  maxLength={400}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className={btnSecondary} style={{ background: 'var(--cream-200)', color: 'var(--cream-800)' }}>
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.career_goals || !formData.areas_of_interest}
                  className={`${btnSecondary} ${!formData.career_goals || !formData.areas_of_interest ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className={sectionTitleClass} style={{ color: 'var(--cream-900)' }}>Skills & what you&apos;re looking for</h2>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Skills & technologies</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setFormData({ ...formData, skills: toggleArrayItem(formData.skills, skill) })}
                      className={`${chipBase} ${formData.skills.includes(skill) ? chipSelected : chipUnselected}`}
                      style={formData.skills.includes(skill) ? {} : { color: 'var(--cream-800)' }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>Hobbies and interests outside academics *</label>
                <textarea
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="e.g., Swimming twice a week, play guitar, member of chess club..."
                  className={inputClass}
                  rows="3"
                  maxLength={300}
                  required
                />
              </div>

              <div>
                <label className={labelClass} style={{ color: 'var(--cream-900)' }}>What are you looking for on ConnectEd?</label>
                <div className="space-y-2">
                  {LOOKING_FOR.map(item => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.looking_for.includes(item)}
                        onChange={() => setFormData({ ...formData, looking_for: toggleArrayItem(formData.looking_for, item) })}
                        className="w-4 h-4 rounded border-2 border-[var(--cream-300)] text-coral-600 focus:ring-coral-500"
                      />
                      <span className="text-sm" style={{ color: 'var(--cream-800)' }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className={btnSecondary} style={{ background: 'var(--cream-200)', color: 'var(--cream-800)' }}>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.hobbies}
                  className={btnPrimary}
                  style={{ background: 'var(--gradient-primary)' }}
                >
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
