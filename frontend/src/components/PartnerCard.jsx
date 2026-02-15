import { useState } from 'react';
import MessageModal from './MessageModal';
import { parseHobbies } from '../utils/hobbyEmoji';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  return name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
}

export default function PartnerCard({ student }) {
  const [showModal, setShowModal] = useState(false);
  const initials = getInitials(student.name);
  const hobbiesList = parseHobbies(student.hobbies || '');

  const targetForModal = {
    id: student.id,
    name: student.name,
    avatar_url: student.avatar_url,
    company: 'GMU',
    job_title: student.major || 'Student',
    major: student.major,
    graduation_year: student.year,
  };

  return (
    <>
      <div className="profile-card-warm">
        <div className="relative h-20" style={{ background: 'var(--gradient-primary)' }}>
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
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
        <div className="pt-12 px-6 pb-6">
          <h3 className="font-dm-sans text-xl font-semibold mb-1" style={{ color: 'var(--cream-900)' }}>
            {student.name}
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--cream-700)' }}>
            {student.major || 'Student'} {student.year ? `• ${student.year}` : ''}
          </p>
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowModal(true);
            }}
            className="btn-primary-warm w-full"
          >
            Connect
          </button>
        </div>
      </div>
      {showModal && (
        <MessageModal
          target={targetForModal}
          targetType="student"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
