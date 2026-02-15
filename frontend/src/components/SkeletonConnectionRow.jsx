export default function SkeletonConnectionRow() {
  return (
    <div className="rounded-xl border p-4 flex items-center gap-4 animate-pulse" style={{ borderColor: 'var(--cream-300)', background: 'var(--cream-50)' }}>
      <div className="w-14 h-14 rounded-full shrink-0" style={{ background: 'var(--cream-200)' }} />
      <div className="flex-1">
        <div className="h-5 rounded w-1/2 mb-2" style={{ background: 'var(--cream-200)' }} />
        <div className="h-4 rounded w-2/3" style={{ background: 'var(--cream-200)' }} />
      </div>
      <div className="h-10 rounded-lg w-24 shrink-0" style={{ background: 'var(--cream-200)' }} />
    </div>
  );
}
