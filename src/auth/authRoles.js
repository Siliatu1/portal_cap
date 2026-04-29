// Roles autorizados para acceder al portal
export const ROLES_AUTORIZADOS = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA',
  'JEFE OPERATIVO DE MERCADEO',
  'JEFE DESARROLLO DE PRODUCTO',
  'ANALISTA EVENTOS Y HELADERIAS',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
  'INSTRUCTOR',
];

/**
 * Valida si un usuario tiene un rol autorizado
 * @param {string} cargo - El cargo/rol del usuario
 * @returns {boolean} true si el cargo está autorizado, false en caso contrario
 */
export function isRoleAuthorized(cargo) {
  if (!cargo || typeof cargo !== 'string') {
    return false;
  }
  return ROLES_AUTORIZADOS.includes(cargo.trim());
}

/**
 * Obtiene el rol del usuario desde los datos de la API
 * @param {object} userData - Los datos del usuario desde la API
 * @returns {string} El cargo/rol del usuario
 */
export function getUserRole(userData) {
  if (!userData) {
    return '';
  }
  
  // Intenta obtener el cargo desde diferentes campos posibles
  return userData.cargo || 
         userData.attributes?.cargo || 
         userData.role || 
         userData.attributes?.role ||
         '';
}

/**
 * Valida que un usuario tenga acceso al portal
 * @param {object} userData - Los datos del usuario desde la API
 * @returns {object} { authorized: boolean, message: string }
 */
export function validateUserAccess(userData) {
  const cargo = getUserRole(userData);
  
  if (!cargo) {
    return {
      authorized: false,
      message: 'El usuario no tiene un rol asignado',
    };
  }
  
  if (!isRoleAuthorized(cargo)) {
    return {
      authorized: false,
      message: `El rol no está autorizado para acceder al portal`,
    };
  }
  
  return {
    authorized: true,
    message: 'Usuario autorizado',
  };
}
