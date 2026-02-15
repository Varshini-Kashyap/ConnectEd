import { create } from 'zustand';

const TOAST_TTL_MS = 4000;

export const useToastStore = create((set, get) => ({
  toasts: [],

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_TTL_MS);
    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message) => get().showToast(message, 'success'),
  error: (message) => get().showToast(message, 'error'),
  info: (message) => get().showToast(message, 'info'),
}));
