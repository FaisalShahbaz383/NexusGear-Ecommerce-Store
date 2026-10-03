import axios from 'axios';

// Dynamic API base URL: defaults to env var or localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Error parsing userInfo from localStorage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token invalid/expired, trigger logout event
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('userInfo')) {
        // Only clear if userInfo exists to prevent infinite loops
        // localStorage.removeItem('userInfo');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
