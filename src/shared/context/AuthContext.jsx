import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const getInitialUserData = () => {
  const savedUserData = localStorage.getItem('userData');

  if (!savedUserData) {
    return null;
  }

  try {
    return JSON.parse(savedUserData);
  } catch (error) {
    console.error('Error al cargar datos de sesión:', error);
    localStorage.removeItem('userData');
    return null;
  }
};

const clearSessionCaches = () => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('pdv_')) {
      localStorage.removeItem(key);
    }
  });
};

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(() => getInitialUserData());
  const [sessionCache, setSessionCache] = useState({});

  const login = useCallback((data) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setUserData(null);
    setSessionCache({});
    localStorage.removeItem('userData');
    clearSessionCaches();
  }, []);

  const setSessionCacheValue = useCallback((key, value) => {
    setSessionCache((prev) => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key]) : value,
    }));
  }, []);

  const value = useMemo(() => ({
    userData,
    sessionCache,
    isAuthenticated: Boolean(userData),
    login,
    logout,
    setSessionCacheValue,
  }), [login, logout, sessionCache, setSessionCacheValue, userData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
};