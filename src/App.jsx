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
import { AuthProvider, useAuth } from './shared/context/AuthContext';

const LOGIN_PATH = '/cap/cafe';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  // Roles permitidos para acceso a horarios
  const rolesHorariosAdmin = [
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO'
  ];

  const rolesHorariosInstructor = ['INSTRUCTOR'];
  const loginElement = <Login />;

  return (
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
              <ProtectedRoute fallback={loginElement}>
                <MainMenu />
              </ProtectedRoute>
            } 
          />

          {/* Portal Líneas de Producto */}
          <Route 
            path="/portal/lineas-producto" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/lineas-producto/asistencia" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <AsistenciaPanel />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/lineas-producto/panel-toderas" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <PanelToderas />
              </ProtectedRoute>
            } 
          />

          {/* Portal Horarios Instructoras - Vista Administrativa */}
          <Route 
            path="/portal/horarios-instructoras/admin" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <RoleGuard 
                  allowedRoles={rolesHorariosAdmin}
                  redirectTo="/menu"
                >
                  <VistaAdministrativa />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          {/* Portal Horarios Instructoras - Vista Instructor */}
          <Route 
            path="/portal/horarios-instructoras/instructor" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <RoleGuard 
                  allowedRoles={rolesHorariosInstructor}
                  redirectTo="/menu"
                >
                  <Dashboard />
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portal/horarios-instructoras/instructor/programacion" 
            element={
              <ProtectedRoute fallback={loginElement}>
                <RoleGuard 
                  allowedRoles={rolesHorariosInstructor}
                  redirectTo="/menu"
                >
                  <ProgramacionHorarios />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App
