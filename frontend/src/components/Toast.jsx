import { createPortal } from 'react-dom';
import { useToastStore } from '../stores/toastStore';

const styles = {
  success: {
    background: 'var(--coral-600)',
    color: 'white',
    icon: '✓',
  },
  error: {
    background: '#dc2626',
    color: 'white',
    icon: '!',
  },
  info: {
    background: 'var(--cream-800)',
    color: 'var(--cream-50)',
    icon: 'i',
  },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  const container = (
    <div
      className="fixed top-4 right-4 z-[2000] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const s = styles[t.type] || styles.info;
        return (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border border-white/10"
            style={{
              background: s.background,
              color: s.color,
              animation: 'toastSlideIn 0.25s ease-out',
            }}
            role="alert"
            aria-live="polite"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold" aria-hidden>
              {s.icon}
            </span>
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );

  return createPortal(container, document.body);
}
