import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/api.js';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUserFromToken() {
    const token = localStorage.getItem('@towork:token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('@towork:token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserFromToken();
  }, []);

  async function login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });

    localStorage.setItem('@towork:token', response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  async function register({ fullName, email, password, accountType }) {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      accountType
    });

    localStorage.setItem('@towork:token', response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  function logout() {
    localStorage.removeItem('@towork:token');
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
