import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import AuthLayout from '../components/AuthLayout';

function HeartIcon({ className = '', ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const inputBase =
  'w-full px-4 py-3 rounded-lg font-inter text-base transition-all duration-200 ' +
  'border-2 bg-[var(--cream-100)] border-[var(--cream-300)] ' +
  'text-[var(--cream-900)] placeholder-[#8B7E74] ' +
  'focus:outline-none focus:border-[var(--coral-600)] focus:bg-[var(--cream-50)] focus:ring-4 focus:ring-[rgba(255,138,111,0.15)] ' +
  'hover:border-[var(--cream-700)] hover:bg-[var(--cream-50)]';

const selectBase = inputBase + ' cursor-pointer appearance-none bg-no-repeat pr-10';
const selectBg = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B5E52\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")';

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

    if (formData.role === 'student' && !formData.email.endsWith('@gmu.edu')) {
      setError('Students must use a @gmu.edu email address');
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
    <AuthLayout
      subtitle="Create your account and join the Mason network"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#b91c1c',
            }}
            role="alert"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="signup-name" className="block font-dm-sans text-sm font-medium mb-2" style={{ color: 'var(--cream-900)' }}>
            Full name <span className="text-red-500" aria-hidden>*</span>
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputBase}
            placeholder="Your name"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block font-dm-sans text-sm font-medium mb-2" style={{ color: 'var(--cream-900)' }}>
            Email <span className="text-red-500" aria-hidden>*</span>
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputBase}
            placeholder={formData.role === 'student' ? 'you@gmu.edu' : 'you@email.com'}
            required
            aria-required="true"
            aria-describedby="signup-email-hint"
          />
          {formData.role === 'student' && (
            <p id="signup-email-hint" className="text-xs mt-1.5" style={{ color: 'var(--cream-700)' }}>
              Students must use a @gmu.edu email address
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="block font-dm-sans text-sm font-medium mb-2" style={{ color: 'var(--cream-900)' }}>
            Password <span className="text-red-500" aria-hidden>*</span>
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={inputBase}
            placeholder="At least 6 characters"
            required
            minLength={6}
            aria-required="true"
            aria-describedby="signup-password-hint"
          />
          <p id="signup-password-hint" className="text-xs mt-1.5" style={{ color: 'var(--cream-700)' }}>
            Minimum 6 characters
          </p>
        </div>

        <div>
          <label htmlFor="signup-role" className="block font-dm-sans text-sm font-medium mb-2" style={{ color: 'var(--cream-900)' }}>
            I am <span className="text-red-500" aria-hidden>*</span>
          </label>
          <select
            id="signup-role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={selectBase}
            style={{
              backgroundImage: selectBg,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
            }}
            aria-required="true"
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg font-dm-sans font-semibold text-white text-base transition-all duration-[250ms] ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-coral-500 focus-visible:ring-offset-[var(--cream-50)] inline-flex items-center justify-center gap-2"
          style={{
            background: 'var(--gradient-valentine, var(--gradient-primary))',
            boxShadow: '0 1px 3px 0 rgba(61, 50, 41, 0.1)',
          }}
        >
          {loading ? 'Creating account…' : (
            <>
              Continue to profile setup
              <HeartIcon className="w-4 h-4 opacity-90" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--cream-700)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-semibold transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 rounded"
          style={{ color: 'var(--coral-600)' }}
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
