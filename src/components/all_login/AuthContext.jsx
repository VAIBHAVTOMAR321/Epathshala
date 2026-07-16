import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const STORAGE_KEY = 'gyandhara_auth';
const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const createAxiosInstance = (accessToken, refreshToken, logout) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(`${API_URL}/refresh-token/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          
          processQueue(null, access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [role, setRole] = useState(null);
  const [uniqueId, setUniqueId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed.user || null);
        setAccessToken(parsed.access || null);
        setRefreshToken(parsed.refresh || null);
        setRole(parsed.role || null);
        setUniqueId(parsed.unique_id || null);
      } catch (err) {
        console.error('Failed to parse auth data:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  // Persist auth state to localStorage on changes
  useEffect(() => {
    if (accessToken) {
      const authData = {
        user,
        access: accessToken,
        refresh: refreshToken,
        role,
        unique_id: uniqueId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, accessToken, refreshToken, role, uniqueId]);

  const login = (data) => {
    setUser(data.user);
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    setRole(data.role);
    setUniqueId(data.unique_id);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setUniqueId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return null;
    
    try {
      const response = await axios.post(`${API_URL}/refresh-token/`, {
        refresh: refreshToken,
      });
      const { access } = response.data;
      setAccessToken(access);
      return access;
    } catch (error) {
      logout();
      return null;
    }
  };

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    role,
    uniqueId,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!accessToken,
    isReady,
  }), [user, accessToken, refreshToken, role, uniqueId, isReady]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}