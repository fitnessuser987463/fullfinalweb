// src/services/api.js

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120000, 
});

// Request interceptor (no changes needed here)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (THIS IS THE FIX)
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response
    return response;
  },
  (error) => {
    // --- FIX: REMOVED THE GENERIC TOAST NOTIFICATION ---
    
    // The interceptor's primary job is to handle global concerns.
    // A 401 Unauthorized error is a global concern, as it means the user's session is invalid.
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again."); // Give a more specific message
      localStorage.removeItem('token');
      // Use a short delay to allow the toast to be seen before redirecting
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    
    // For all other errors, we simply pass the error along.
    // It's now the responsibility of the component that made the API call
    // to catch the error and decide if a toast is necessary.
    return Promise.reject(error);
  }
);

export default api;