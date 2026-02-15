import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible confirmation dialog. Use instead of window.confirm for consistent UI/UX.
 * @param {boolean} open - Whether the dialog is visible
 * @param {string} title - Dialog title
 * @param {string} message - Body text
 * @param {string} confirmLabel - Confirm button text (e.g. "Delete")
 * @param {string} cancelLabel - Cancel button text
 * @param {'default'|'danger'} variant - danger = red confirm button for destructive actions
 * @param {boolean} loading - Disable buttons and show loading on confirm
 * @param {() => void} onConfirm - Called when user confirms
 * @param {() => void} onCancel - Called when user cancels (backdrop, Cancel, Escape)
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const timer = setTimeout(() => {
      (variant === 'danger' ? cancelRef.current : confirmRef.current)?.focus();
    }, 50);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, variant, onCancel]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) return;
    onCancel?.();
  };

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(61, 50, 41, 0.4)',
        animation: 'confirmDialogFadeIn 0.2s ease-out',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl p-6"
        style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-300)',
          animation: 'confirmDialogSlideUp 0.25s var(--ease-out-smooth)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-xl font-bold font-dm-sans mb-2"
          style={{ color: 'var(--cream-900)' }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          className="text-sm mb-6"
          style={{ color: 'var(--cream-700)' }}
        >
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === 'danger'
                ? 'btn-danger-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2'
                : 'btn-primary-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2'
            }
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
