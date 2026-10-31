import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('brightloop_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('brightloop_token');
      const storedUser = localStorage.getItem('brightloop_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('brightloop_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.warn('Session verification error, will auto-login default staff:', e.message);
          await autoLoginDefaultStaff();
        }
      } else {
        await autoLoginDefaultStaff();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const autoLoginDefaultStaff = async () => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: 'sarah@brightloop.io',
        password: 'password123'
      });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('brightloop_token', res.data.token);
        localStorage.setItem('brightloop_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Auto login failed:', err);
    }
  };

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('brightloop_token', res.data.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.data.user));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('brightloop_token');
    localStorage.removeItem('brightloop_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

