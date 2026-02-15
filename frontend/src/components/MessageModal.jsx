import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCareerStore } from '../stores/careerStore';
import { aiAPI } from '../services/api';

export default function MessageModal({ target, targetType, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const openedAtRef = useRef(Date.now());
  const { sendConnection } = useCareerStore();

  useEffect(() => {
    // Auto-draft message on modal open
    handleDraftMessage();
  }, []);

  const handleDraftMessage = async () => {
    setDraftLoading(true);
    try {
      const response = await aiAPI.draftMessage({
        target_id: target.id,
        target_type: targetType,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Failed to draft message:', error);
      setMessage(`Hi ${target.name}, I'd love to connect and learn from your experience at ${target.company}.`);
    } finally {
      setDraftLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setLoading(true);
    const success = await sendConnection(target.id, message);
    setLoading(false);

    if (success) {
      showToast('Connection request sent successfully!', 'success');
      setTimeout(() => onClose(), 1500);
    } else {
      showToast('Failed to send connection request', 'error');
    }
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (e.target !== e.currentTarget) return;
    if (Date.now() - openedAtRef.current < 300) return;
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"
      style={{ animation: 'messageModalFadeIn 0.2s ease-out' }}
      onClick={handleBackdropClick}
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div
        className="rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
        style={{ animation: 'messageModalSlideUp 0.3s ease-out', background: 'var(--cream-50)', border: '1px solid var(--cream-300)' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
          {/* Alumni Info Header */}
          <div className="flex items-center mb-6 pb-4 border-b" style={{ borderColor: 'var(--cream-300)' }}>
            <img
              src={target.avatar_url || `https://ui-avatars.com/api/?name=${target.name}`}
              alt={target.name}
              className="w-16 h-16 rounded-full mr-4 border-2 object-cover"
              style={{ borderColor: 'var(--cream-300)' }}
            />
            <div>
              <h3 id="message-modal-title" className="text-2xl font-bold font-dm-sans" style={{ color: 'var(--coral-600)' }}>{target.name}</h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--cream-700)' }}>{target.job_title} at {target.company}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cream-600)' }}>{target.major} · Class of {target.graduation_year}</p>
            </div>
          </div>

          {/* Message Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold font-dm-sans" style={{ color: 'var(--cream-900)' }}>Your Message</label>
              {!draftLoading && (
                <button
                  type="button"
                  onClick={handleDraftMessage}
                  className="text-sm font-medium hover:underline flex items-center transition-opacity"
                  style={{ color: 'var(--coral-600)' }}
                >
                  ✨ Regenerate with AI
                </button>
              )}
            </div>

            {draftLoading ? (
              <div className="w-full px-4 py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center" style={{ borderColor: 'var(--cream-300)', background: 'var(--cream-100)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[var(--coral-600)] mb-3" style={{ borderColor: 'var(--cream-300)' }} />
                <p className="text-sm" style={{ color: 'var(--cream-700)' }}>Generating personalized message...</p>
              </div>
            ) : (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to connect..."
                className="input-theme w-full px-4 py-3 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[var(--coral-500)]"
                style={{ minHeight: '10rem' }}
                rows={6}
                maxLength={300}
              />
            )}
            <p className="text-xs mt-2 flex justify-between" style={{ color: 'var(--cream-600)' }}>
              <span>Tip: Mention specific interests or questions to increase response rate</span>
              {!draftLoading && <span>{message.length}/300</span>}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || draftLoading || !message.trim()}
              className="btn-primary-warm flex-1 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Connection Request'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary-warm flex-1 py-3 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      {toast && createPortal(
        <div
          className="fixed top-4 right-4 z-[110] px-6 py-4 rounded-xl shadow-lg text-white font-semibold"
          style={{
            animation: 'messageModalSlideDown 0.3s ease-out',
            background: toast.type === 'success' ? 'var(--coral-600)' : '#dc2626',
          }}
        >
          {toast.message}
        </div>,
        document.body
      )}
    </>
  );
}
