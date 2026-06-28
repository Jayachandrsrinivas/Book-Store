import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-load session from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Standard API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  };

  const login = async (email, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    const userProfile = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.businessName,
    };
    localStorage.setItem('user', JSON.stringify(userProfile));
    setUser(userProfile);
    return userProfile;
  };

  const register = async (name, email, password, role, businessName) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, businessName }),
    });
    localStorage.setItem('token', data.token);
    const userProfile = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.businessName,
    };
    localStorage.setItem('user', JSON.stringify(userProfile));
    setUser(userProfile);
    return userProfile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    const userProfile = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.businessName,
    };
    localStorage.setItem('user', JSON.stringify(userProfile));
    setUser(userProfile);
    return userProfile;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, apiCall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
