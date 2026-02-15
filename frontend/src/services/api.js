import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const careerAPI = {
  getAlumni: (filters) => api.get('/alumni', { params: filters }),
  getAlumniById: (id) => api.get(`/alumni/${id}`),
  sendConnection: (data) => api.post('/connections', data),
  getMyConnections: () => api.get('/connections/me'),
  acceptConnection: (id) => api.put(`/connections/${id}/accept`),
  declineConnection: (id) => api.put(`/connections/${id}/decline`),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
};

export const studentAPI = {
  getTutors: (filters) => api.get('/tutors', { params: filters }),
  createHelpRequest: (data) => api.post('/help-requests', data),
  getHelpRequests: (status) => api.get('/help-requests', { params: { status } }),
  matchRequest: (requestId) => api.post(`/help-requests/${requestId}/match`),
  getCourses: () => api.get('/courses'),
};

export const aiAPI = {
  draftMessage: (data) => api.post('/ai/draft-message', data),
  getMatchExplanation: (targetId) => api.get(`/ai/match-explanation/${targetId}`),
};

export default api;
