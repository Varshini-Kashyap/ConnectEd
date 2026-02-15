export default function SkeletonTutorCard() {
  return (
    <div className="profile-card-warm rounded-xl overflow-hidden animate-pulse" style={{ pointerEvents: 'none' }}>
      <div className="p-5 flex gap-4">
        <div className="w-16 h-16 rounded-full shrink-0" style={{ background: 'var(--cream-200)' }} />
        <div className="flex-1">
          <div className="h-5 rounded w-2/3 mb-2" style={{ background: 'var(--cream-200)' }} />
          <div className="h-4 rounded w-1/2 mb-2" style={{ background: 'var(--cream-200)' }} />
          <div className="h-4 rounded w-full mt-2" style={{ background: 'var(--cream-200)' }} />
          <div className="flex gap-2 mt-3">
            <div className="h-6 rounded-full w-16" style={{ background: 'var(--cream-200)' }} />
            <div className="h-6 rounded-full w-20" style={{ background: 'var(--cream-200)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
