import '../styles/admin_panel.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SeleccionMenu from './SeleccionMenu';
import AdminPanelView from './admin-panel/AdminPanelView';
import { useAdminPanelController } from '../hooks/useAdminPanelController';

function AdminPanel() {
  const controller = useAdminPanelController();
  const { screen, user, actions } = controller;

  if (screen.vistaActual === 'seleccion_menu') {
    return (
      <SeleccionMenu
        onSelectEscuelaCafe={actions.abrirFormularioPuntoVenta}
        onSelectEvaluacionToderas={actions.abrirFormularioEvaluacionTodera}
        onViewPanel={actions.verMiPanel}
        onBack={actions.volverDesdeSeleccion}
        nombreUsuario={user.nombreUsuario}
      />
    );
  }

  return <AdminPanelView controller={controller} />;
}

export default AdminPanel;
