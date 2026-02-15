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
        className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl"
        style={{ animation: 'messageModalSlideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
          {/* Alumni Info Header */}
          <div className="flex items-center mb-6 pb-4 border-b">
            <img
              src={target.avatar_url || `https://ui-avatars.com/api/?name=${target.name}`}
              alt={target.name}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h3 id="message-modal-title" className="text-2xl font-bold text-gmu-green">{target.name}</h3>
              <p className="text-gray-600">{target.job_title} at {target.company}</p>
              <p className="text-sm text-gray-500">{target.major} • Class of {target.graduation_year}</p>
            </div>
          </div>

          {/* Message Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Your Message</label>
              {!draftLoading && (
                <button
                  onClick={handleDraftMessage}
                  className="text-sm text-gmu-green hover:underline flex items-center"
                >
                  ✨ Regenerate with AI
                </button>
              )}
            </div>

            {draftLoading ? (
              <div className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gmu-green mb-3"></div>
                <p className="text-gray-600">Generating personalized message...</p>
              </div>
            ) : (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to connect..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gmu-green focus:border-transparent transition"
                rows="8"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              Tip: Mention specific interests or questions to increase response rate
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSend}
              disabled={loading || draftLoading || !message.trim()}
              className="flex-1 bg-gmu-green text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
              ) : (
                'Send Connection Request'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-semibold transition"
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
          className={`fixed top-4 right-4 z-[110] px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white font-semibold`}
          style={{ animation: 'messageModalSlideDown 0.3s ease-out' }}
        >
          {toast.message}
        </div>,
        document.body
      )}
    </>
  );
}
