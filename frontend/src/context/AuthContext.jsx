import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('bookverse_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login action for User, Seller, Admin
  const login = async (email, password, role) => {
    try {
      const endpoint = `${API_BASE}/${role === 'user' ? 'users' : role}/login`;
      const response = await axios.post(endpoint, { email, password });
      
      const userData = {
        token: response.data.token,
        role: role,
        ...(response.data.user || response.data.seller || response.data.admin)
      };

      setUser(userData);
      localStorage.setItem('bookverse_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Registration action for User and Seller
  const register = async (name, email, password, role) => {
    try {
      const endpoint = `${API_BASE}/${role === 'user' ? 'users' : 'seller'}/register`;
      const response = await axios.post(endpoint, { name, email, password });
      
      if (role === 'user') {
        const userData = {
          token: response.data.token,
          role: 'user',
          ...response.data.user
        };
        setUser(userData);
        localStorage.setItem('bookverse_user', JSON.stringify(userData));
      }

      return {
        success: true,
        message: response.data.message || 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  // Logout action
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bookverse_user');
  };

  // Update profile for user
  const updateProfile = async (name, email, password) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const response = await axios.put(`${API_BASE}/users/profile`, { name, email, password }, config);
      
      const updatedUser = {
        ...user,
        name: response.data.name,
        email: response.data.email
      };
      
      setUser(updatedUser);
      localStorage.setItem('bookverse_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, API_BASE }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
