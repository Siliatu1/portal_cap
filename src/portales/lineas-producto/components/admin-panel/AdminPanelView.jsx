import AdminPanelHeader from './AdminPanelHeader';
import GestionInstructorasSection from './GestionInstructorasSection';
import InscripcionesSection from './InscripcionesSection';
import InstructorasModals from './InstructorasModals';
import SectionTabs from './SectionTabs';
import ToderaSection from './ToderaSection';

function AdminPanelView({ controller }) {
  const { screen, user, permissions, data, loading, forms, actions } = controller;

  return (
    <div className="admin-container">
      <AdminPanelHeader permissions={permissions} onActions={actions} />

      <main className="admin-main">
        <div className="admin-content">
          <h1 className="admin-title">Hola, {user.nombreUsuario}</h1>
          <h2 className="admin-subtitle">Lineas de Producto C&W</h2>

          <SectionTabs
            activeSection={screen.seccionActiva}
            permissions={permissions}
            onChange={actions.setSeccionActiva}
          />

          {screen.seccionActiva === 'escuela_cafe' && (
            <InscripcionesSection
              data={data}
              filtros={forms.filtros}
              options={data.filterOptions}
              fotosCache={data.fotosCache}
              loading={loading.inscripciones}
              puedeEliminar={permissions.puedeEliminar}
              onActions={actions}
            />
          )}

          {screen.seccionActiva === 'evaluacion_todera' && permissions.puedeVerTodera && (
            <ToderaSection
              data={data}
              filtros={forms.filtrosTodera}
              options={data.filterOptions}
              fotosCache={data.fotosCache}
              loading={loading.todera}
              puedeEliminar={permissions.puedeEliminar}
              puedeVerFiltroInstructora={permissions.puedeVerFiltroInstructora}
              cargoUsuario={user.cargoUsuario}
              onActions={actions}
            />
          )}

          {screen.seccionActiva === 'gestion_instructoras' && permissions.puedeGestionarInstructoras && (
            <GestionInstructorasSection
              data={data}
              filtros={forms.filtrosGestionInstructoras}
              loading={loading.gestionInstructoras}
              onActions={actions}
            />
          )}
        </div>
      </main>

      <InstructorasModals
        forms={forms}
        data={data}
        loading={loading}
        onActions={actions}
      />
    </div>
  );
}

export default AdminPanelView;
