import { create } from 'zustand';
import { studentAPI } from '../services/api';

export const useStudentStore = create((set) => ({
  tutors: [],
  requests: [],
  courses: [],
  loading: false,
  error: null,

  fetchTutors: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await studentAPI.getTutors(filters);
      set({ tutors: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch tutors', loading: false });
    }
  },

  createRequest: async (requestData) => {
    set({ loading: true, error: null });
    try {
      await studentAPI.createHelpRequest(requestData);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to create request', loading: false });
      return false;
    }
  },

  fetchRequests: async (status = 'open') => {
    set({ loading: true, error: null });
    try {
      const response = await studentAPI.getHelpRequests(status);
      set({ requests: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch requests', loading: false });
    }
  },

  matchRequest: async (requestId) => {
    try {
      const response = await studentAPI.matchRequest(requestId);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to match request' });
      return [];
    }
  },

  fetchCourses: async () => {
    try {
      const response = await studentAPI.getCourses();
      set({ courses: response.data });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch courses' });
    }
  },
}));
