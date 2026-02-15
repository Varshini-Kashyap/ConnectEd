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

  fetchRequests: async (status) => {
    set({ loading: true, error: null });
    try {
      const response = await studentAPI.getHelpRequests(status);
      set({ requests: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch requests', loading: false });
      return [];
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

  getRequestMatches: async (requestId) => {
    try {
      const response = await studentAPI.getRequestMatches(requestId);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch matches' });
      return [];
    }
  },

  deleteRequest: async (requestId) => {
    set({ error: null });
    try {
      await studentAPI.deleteHelpRequest(requestId);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to delete request' });
      return false;
    }
  },

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching courses from API...');
      const response = await studentAPI.getCourses();
      console.log('Courses response:', response.data);
      set({ courses: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      set({ error: error.response?.data?.detail || 'Failed to fetch courses', loading: false });
      return [];
    }
  },
}));
