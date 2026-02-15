export default function SkeletonAlumniCard() {
  return (
    <div className="profile-card-warm rounded-xl overflow-hidden animate-pulse" style={{ pointerEvents: 'none' }}>
      <div className="h-20 rounded-t-xl" style={{ background: 'var(--cream-200)' }} />
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-full shrink-0" style={{ background: 'var(--cream-200)', marginTop: '-40px' }} />
          <div className="flex-1 pt-2">
            <div className="h-5 rounded w-3/4 mb-2" style={{ background: 'var(--cream-200)' }} />
            <div className="h-4 rounded w-1/2" style={{ background: 'var(--cream-200)' }} />
          </div>
        </div>
        <div className="h-4 rounded w-full mt-4" style={{ background: 'var(--cream-200)' }} />
        <div className="h-4 rounded w-5/6 mt-2" style={{ background: 'var(--cream-200)' }} />
        <div className="flex gap-2 mt-4">
          <div className="h-10 rounded-lg w-24" style={{ background: 'var(--cream-200)' }} />
          <div className="h-10 rounded-lg w-24" style={{ background: 'var(--cream-200)' }} />
        </div>
      </div>
    </div>
  );
}
