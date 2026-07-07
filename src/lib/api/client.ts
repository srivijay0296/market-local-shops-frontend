// src/lib/api/client.ts
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "";

export const backendApi = axios.create({
  baseURL: API_URL, // includes /api
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // set true only if backend uses cookies/sessions
});

backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

backendApi.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default backendApi;