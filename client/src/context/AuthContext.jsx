import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session on application load
  const checkAuth = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await apiClient('/auth/me');
      if (res.ok && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        // Clear token if invalid
        localStorage.removeItem('cybernexus_token');
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('cybernexus_token', res.data.token);
      }
      return { success: true };
    } else {
      setAuthError(res.error);
      return { success: false, error: res.error };
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setAuthError(null);
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('cybernexus_token', res.data.token);
      }
      return { success: true };
    } else {
      setAuthError(res.error);
      return { success: false, error: res.error };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      localStorage.removeItem('cybernexus_token');
    }
  };

  // Update profile
  const updateProfile = async (username) => {
    const res = await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      setUser((prev) => ({ ...prev, username: res.data.data.username }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
