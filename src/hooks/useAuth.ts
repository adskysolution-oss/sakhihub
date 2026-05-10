'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  role: string;
  status: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error, logout };
}
