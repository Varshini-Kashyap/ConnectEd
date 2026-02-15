export default function SkeletonNotificationRow() {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-4 animate-pulse" style={{ borderColor: 'var(--cream-300)', background: 'var(--cream-50)' }}>
      <div className="w-12 h-12 rounded-full shrink-0" style={{ background: 'var(--cream-200)' }} />
      <div className="flex-1 min-w-0">
        <div className="h-5 rounded w-2/3 mb-2" style={{ background: 'var(--cream-200)' }} />
        <div className="h-4 rounded w-1/2 mb-3" style={{ background: 'var(--cream-200)' }} />
        <div className="flex gap-2">
          <div className="h-9 rounded-lg w-20" style={{ background: 'var(--cream-200)' }} />
          <div className="h-9 rounded-lg w-20" style={{ background: 'var(--cream-200)' }} />
        </div>
      </div>
    </div>
  );
}
