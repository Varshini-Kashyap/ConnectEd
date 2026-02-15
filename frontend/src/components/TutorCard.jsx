import { parseHobbies } from '../utils/hobbyEmoji';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function TutorCard({ tutor, matchScore, matchReasons, showMatchScore = false }) {
  const initials = getInitials(tutor.name);
  const hobbiesList = parseHobbies(tutor.hobbies || tutor.profile_data?.hobbies || '');
  const sharedSummary = matchReasons?.length > 0 ? matchReasons[0] : 'You share similar courses and academic interests.';

  return (
    <div className="profile-card-warm">
      <div className="relative h-20" style={{ background: 'var(--gradient-primary)' }}>
        {showMatchScore && matchScore !== undefined && (
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: 'var(--coral-600)', color: 'white' }}
          >
            {matchScore}% Match
          </div>
        )}
        <div
          className="absolute left-6 rounded-full flex items-center justify-center font-dm-sans text-2xl font-bold text-white border-4 overflow-hidden"
          style={{
            bottom: '-40px',
            width: 80,
            height: 80,
            background: 'var(--gradient-primary)',
            borderColor: 'var(--cream-50)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {tutor.avatar_url ? (
            <img src={tutor.avatar_url} alt={tutor.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>

      <div className="pt-12 px-6 pb-6">
        <h3 className="font-dm-sans text-xl font-semibold mb-1" style={{ color: 'var(--cream-900)' }}>
          {tutor.name}
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--cream-700)' }}>
          {tutor.year} {tutor.gpa != null ? `• ${Number(tutor.gpa).toFixed(2)} GPA` : ''}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {(tutor.courses || []).slice(0, 4).map((course, idx) => (
            <span key={idx} className="interest-tag-warm">
              {course.code || course.course_id}
            </span>
          ))}
          {(tutor.courses?.length || 0) > 4 && (
            <span className="text-xs py-1" style={{ color: 'var(--cream-700)' }}>
              +{tutor.courses.length - 4} more
            </span>
          )}
        </div>

        {hobbiesList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hobbiesList.map(({ label, emoji }, idx) => (
              <span key={idx} className="interest-tag-warm inline-flex items-center gap-1">
                <span>{emoji}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        )}

        <div className="match-reason-warm mb-4 flex gap-2 items-start">
          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ stroke: 'var(--coral-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--cream-800)' }}>Shared interest summary</p>
            <span>{sharedSummary}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-primary-warm w-full">
            Request Session
          </button>
          <button type="button" className="btn-secondary-warm w-full">
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
