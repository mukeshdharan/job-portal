import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
          // Fetch notifications if logged in
          fetchNotifications();
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user: loggedUser } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch full profile info
      const meRes = await axios.get('/api/auth/me');
      setUser(meRes.data);
      fetchNotifications();
      return meRes.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, companyName) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role, companyName });
      const { token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const meRes = await axios.get('/api/auth/me');
      setUser(meRes.data);
      return meRes.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setNotifications([]);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/users/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await axios.post('/api/users/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const updateProfileLocal = (updatedProfile) => {
    setUser(prev => ({
      ...prev,
      profile: updatedProfile
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      notifications,
      login,
      register,
      logout,
      fetchNotifications,
      markNotificationsRead,
      updateProfileLocal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
