import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar si está autenticado
 * @param {React.Component|null} props.fallback - Componente a renderizar si no está autenticado
 */
const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;

