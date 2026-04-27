import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth
import Login from './auth/Login';

// Shared Components
import MainMenu from './shared/components/MainMenu';
import ProtectedRoute from './shared/components/ProtectedRoute';
import RoleGuard from './shared/guards/RoleGuard';

// Portal Líneas de Producto
import AdminPanel from './portales/lineas-producto/components/AdminPanel';
import AsistenciaPanel from './portales/lineas-producto/components/AsistenciaPanel';
import PanelToderas from './portales/lineas-producto/components/PanelToderas';

// Portal Horarios Instructoras
import Dashboard from './portales/horarios-instructoras/components/Dashboard';
import ProgramacionHorarios from './portales/horarios-instructoras/components/ProgramacionHorarios';
import VistaAdministrativa from './portales/horarios-instructoras/components/VistaAdministrativa';

const LOGIN_PATH = '/cap/cafe';

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

function App() {
  const [userData, setUserData] = useState(() => getInitialUserData());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getInitialUserData()));

  const handleLogin = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('userData');
  };

  // Roles permitidos para acceso a horarios
  const rolesHorariosAdmin = [
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO'
  ];

  const rolesHorariosInstructor = ['INSTRUCTOR'];
  const loginElement = <Login onLogin={handleLogin} />;

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de Login */}
          <Route 
            path={LOGIN_PATH}
            element={
              isAuthenticated ? <Navigate to="/menu" replace /> : loginElement
            } 
          />

          {/* Menú Principal */}
          <Route 
            path="/menu" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <MainMenu userData={userData} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Portal Líneas de Producto */}
          <Route 
            path="/portal/lineas-producto" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <AdminPanel userData={userData} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/lineas-producto/asistencia" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <AsistenciaPanel userData={userData} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/lineas-producto/panel-toderas" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <PanelToderas userData={userData} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Portal Horarios Instructoras - Vista Administrativa */}
          <Route 
            path="/portal/horarios-instructoras/admin" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <RoleGuard 
                  userData={userData} 
                  allowedRoles={rolesHorariosAdmin}
                  redirectTo="/menu"
                >
                  <VistaAdministrativa userData={userData} onLogout={handleLogout} />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          {/* Portal Horarios Instructoras - Vista Instructor */}
          <Route 
            path="/portal/horarios-instructoras/instructor" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <RoleGuard 
                  userData={userData} 
                  allowedRoles={rolesHorariosInstructor}
                  redirectTo="/menu"
                >
                  <Dashboard userData={userData} onLogout={handleLogout} />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/horarios-instructoras/instructor/programacion" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} fallback={loginElement}>
                <RoleGuard 
                  userData={userData} 
                  allowedRoles={rolesHorariosInstructor}
                  redirectTo="/menu"
                >
                  <ProgramacionHorarios userData={userData} onLogout={handleLogout} />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          {/* Ruta por defecto */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/menu" replace /> : loginElement
            } 
          />

          {/* Ruta 404 */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? <Navigate to="/menu" replace /> : loginElement
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App
