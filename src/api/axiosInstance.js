/**
 * Shared Axios instance.
 *
 * - baseURL is read from VITE_API_URL at build time.
 *   - Development: leave VITE_API_URL unset — Vite proxy forwards /api/* to Flask.
 *   - Production:  set VITE_API_URL=https://api.yourdomain.com in your build env.
 * - Automatically attaches the JWT from localStorage as a Bearer token.
 * - On any 401 response clears storage and redirects to /login.
 */
import axios from 'axios';

const api = axios.create({
  // Falls back to '/' so the Vite dev proxy still works when VITE_API_URL is not set.
  baseURL: import.meta.env.VITE_API_URL || '/',
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
