/**
 * Shared Axios instance.
 *
 * - Automatically attaches the JWT from localStorage as a Bearer token.
 * - On any 401 response (expired / invalid token) clears storage and
 *   redirects the user to /login so they re-authenticate.
 */
import axios from 'axios';

const api = axios.create({
  // Vite proxy forwards /api/* to Flask on port 5001 — no hardcoded host needed.
  baseURL: '/',
});

/* ── Request interceptor: attach token ─────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: handle 401 ──────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and send to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Use window.location so it works outside React Router context too
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
