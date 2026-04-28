import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard - Componente para proteger rutas basadas en roles
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Lista de roles permitidos
 * @param {React.Component} props.children - Componente hijo a renderizar si tiene permiso
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene permiso (default: /menu)
 */
const RoleGuard = ({ allowedRoles, children, redirectTo = '/menu' }) => {
  const { userData } = useAuth();
  const datosUsuario = userData?.data || userData || {};
  const cargoUsuario = datosUsuario?.cargo || '';

  const tieneAcceso = allowedRoles.includes(cargoUsuario);

  if (!tieneAcceso) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleGuard;
