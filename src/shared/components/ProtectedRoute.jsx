import React from 'react';

/**
 * ProtectedRoute - Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {boolean} props.isAuthenticated - Estado de autenticación
 * @param {React.Component} props.children - Componente hijo a renderizar si está autenticado
 * @param {React.Component|null} props.fallback - Componente a renderizar si no está autenticado
 */
const ProtectedRoute = ({ isAuthenticated, children, fallback = null }) => {
  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
