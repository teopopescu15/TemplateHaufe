import axios from 'axios';

// Use /api for production domain, localhost:9000/api for local development
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction
  ? '/api'  // Relative path for production (proxied by Caddy)
  : (import.meta.env.VITE_API_URL || 'http://localhost:9000') + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // 120 seconds timeout for long-running requests (GitHub API calls)
});

// Track ongoing refresh to prevent multiple simultaneous calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401/403 (unauthorized/forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Prevent infinite loops - only retry once per request
      if (originalRequest._retry) {
        // Refresh failed, redirect to login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Skip refresh attempt for /auth/refresh itself (prevent loop)
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Another request is already refreshing - queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Attempt to refresh token
        await api.post('/auth/refresh');

        // Success! Process queued requests
        processQueue();
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - reject queued requests and redirect
        processQueue(refreshError);
        isRefreshing = false;

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
