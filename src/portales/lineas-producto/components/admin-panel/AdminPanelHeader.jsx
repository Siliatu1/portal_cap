function AdminPanelHeader({ permissions, onActions }) {
  const {
    esAccesoDual,
    esRolPuntoVenta,
    esRolHeladeria,
    puedeVerTodera,
  } = permissions;

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="header-titles">
          <span className="header-logo-text">PANEL LINEAS DE PRODUCTO C&W</span>
          <span className="header-subtitle">Gestion Administrativa</span>
        </div>
      </div>

      <div className="header-right">
        {esAccesoDual ? (
          <>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioEscuelaCafe}>
              <i className="bi bi-cup-hot" />
              <span>Escuela Cafe HEL</span>
            </button>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioPuntoVenta}>
              <i className="bi bi-shop-window" />
              <span>Escuela Cafe PDV</span>
            </button>
          </>
        ) : esRolPuntoVenta ? (
          <>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioPuntoVenta}>
              <i className="bi bi-cup-hot" />
              <span>Escuela del Cafe</span>
            </button>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioEvaluacionTodera}>
              <i className="bi bi-clipboard-check" />
              <span>Evaluacion Toderas</span>
            </button>
          </>
        ) : esRolHeladeria ? (
          <button className="header-nav-btn" onClick={onActions.abrirFormularioEscuelaCafe}>
            <i className="bi bi-pencil-square" />
            <span>Inscripcion Aqui</span>
          </button>
        ) : (
          <button className="header-nav-btn" onClick={onActions.registrarPersona}>
            <i className="bi bi-book" />
            <span>Registrar Estudiante</span>
          </button>
        )}

        {puedeVerTodera && !esRolPuntoVenta && (
          <button className="header-nav-btn" onClick={onActions.abrirFormularioEvaluacionTodera}>
            <i className="bi bi-clipboard-check" />
            <span>Evaluacion Todera</span>
          </button>
        )}

        <button className="btn-nav-header" onClick={onActions.navigateBack}>
          <i className="bi bi-arrow-left" />
          <span>Volver</span>
        </button>
        <button className="btn-nav-header" onClick={onActions.logout}>
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </header>
  );
}

export default AdminPanelHeader;
