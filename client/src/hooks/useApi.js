// src/hooks/useApi.js

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import api from '../services/api';
import toast from 'react-hot-toast';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const enabled = options.enabled === undefined ? true : options.enabled;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(url, options);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      
      // --- FIX: This block is modified to prevent unwanted toasts ---
      if (err.name !== 'CanceledError' && !options.silent) {
        // Only show a toast if the error is NOT a 404 (Not Found).
        // A 404 is a valid state (e.g., "no active challenge") and the UI should handle it.
        if (err.response?.status !== 404 && err.response?.status !== 401) {
          toast.error(err.response?.data?.message || 'Failed to fetch data');
        }
      }
      // --- END FIX ---

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url && enabled && !authLoading) {
      fetchData();
    } else {
      setLoading(authLoading);
    }
  }, [url, enabled, authLoading]);

  return { data, loading, error, refetch: fetchData };
};