import axios from 'axios';
import { supabase } from '../supabase';

/**
 * 📡 API CLIENT CONFIGURATION
 * Normalizes VITE_API_URL and enables proxy-friendly relative paths during development.
 */

const normalizeUrl = (url: string) => url.trim().replace(/\/+$|\s+$/g, '');

const getBaseURL = () => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim();
  if (rawUrl) {
    return normalizeUrl(rawUrl);
  }

  return import.meta.env.DEV ? '/api' : 'https://market-local-shops-143.vercel.app/api';
};

export const API_URL = getBaseURL();
const API_BASE_URL = API_URL;

console.log('📡 API URL Configured:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// 🗝️ Auth Interceptor — injects Supabase session token if present, falls back to localStorage
client.interceptors.request.use(async (config) => {
  // Detailed Request logging
  console.log(`📡 [API FETCH REQUEST] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, {
    params: config.params,
    data: config.data
  });

  try {
    // Try Supabase session first (preferred)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    }
  } catch (err) {
    console.warn('Supabase session retrieval failed, falling back to localStorage token:', err);
  }
  // Fallback to localStorage token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('📡 [API FETCH REQUEST ERROR]', error);
  return Promise.reject(error);
});

// Response Interceptor
client.interceptors.response.use(
  (response) => {
    // Detailed Response logging
    console.log(`📡 [API FETCH SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.baseURL || ''}${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      console.warn('🗝️ Auth Node Expired. Redirecting to login.');
    }

    // Detailed Error logging
    console.error(`📡 [API FETCH FAILURE] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ''}${error.config?.url}`, {
      status: status || 'TIMEOUT/NETWORK_ERROR',
      responseBody: error.response?.data,
      errorMessage: error.message
    });

    return Promise.reject(error);
  }
);

export default client;
