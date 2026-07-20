// src/lib/api/client.ts
// Single Axios instance used by ALL API modules.
// Automatically attaches the JWT from localStorage and clears it on 401.
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

export const backendApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR: attach JWT ─────────────────────────────────────────
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR: handle 401 gracefully ─────────────────────────────
backendApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      // Token expired or invalid — clear storage so next request won't retry with a bad token
      localStorage.removeItem('token');
      delete backendApi.defaults.headers.common['Authorization'];
      // Do NOT redirect here; let AuthContext handle the user state
    }
    return Promise.reject(err);
  }
);

export default backendApi;