import { create } from 'zustand';
import { careerAPI } from '../services/api';

export const useCareerStore = create((set, get) => ({
  alumni: [],
  connections: [],
  loading: false,
  error: null,

  fetchAlumni: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await careerAPI.getAlumni(filters);
      set({ alumni: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch alumni', loading: false });
    }
  },

  sendConnection: async (targetId, message) => {
    try {
      await careerAPI.sendConnection({ target_id: targetId, message });
      await get().fetchConnections(); // Refetch to update UI
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to send connection' });
      return false;
    }
  },

  fetchConnections: async () => {
    try {
      const response = await careerAPI.getMyConnections();
      set({ connections: response.data });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch connections' });
    }
  },

  acceptConnection: async (connectionId) => {
    try {
      await careerAPI.acceptConnection(connectionId);
      get().fetchConnections();
      return true;
    } catch (error) {
      return false;
    }
  },

  declineConnection: async (connectionId) => {
    try {
      await careerAPI.declineConnection(connectionId);
      get().fetchConnections();
      return true;
    } catch (error) {
      return false;
    }
  },
}));
