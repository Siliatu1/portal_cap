import { Coffee, Store, FileText, Edit, Book, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';

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
              <Coffee size={20} />
              <span>Escuela Cafe HEL</span>
            </button>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioPuntoVenta}>
              <Store size={20} />
              <span>Escuela Cafe PDV</span>
            </button>
          </>
        ) : esRolPuntoVenta ? (
          <>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioPuntoVenta}>
              <Coffee size={20} />
              <span>Escuela del Cafe</span>
            </button>
            <button className="header-nav-btn" onClick={onActions.abrirFormularioEvaluacionTodera}>
              <CheckCircle2 size={20} />
              <span>Evaluacion Toderas</span>
            </button>
          </>
        ) : esRolHeladeria ? (
          <button className="header-nav-btn" onClick={onActions.abrirFormularioEscuelaCafe}>
            <Edit size={20} />
            <span>Inscripcion Aqui</span>
          </button>
        ) : (
          <button className="header-nav-btn" onClick={onActions.registrarPersona}>
            <Book size={20} />
            <span>Registrar Estudiante</span>
          </button>
        )}

        {puedeVerTodera && !esRolPuntoVenta && (
          <button className="header-nav-btn" onClick={onActions.abrirFormularioEvaluacionTodera}>
            <CheckCircle2 size={20} />
            <span>Evaluacion Todera</span>
          </button>
        )}

        <button className="btn-nav-header" onClick={onActions.navigateBack}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <button className="btn-nav-header" onClick={onActions.logout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default AdminPanelHeader;


