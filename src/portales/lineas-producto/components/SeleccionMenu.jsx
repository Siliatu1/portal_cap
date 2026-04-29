import React from "react";
import { User, LogOut, Coffee, Book, ArrowRight } from "lucide-react";
import "../styles/seleccion_menu.css";


const SeleccionMenu = ({
  onSelectEscuelaCafe,
  onSelectEvaluacionToderas,
  onViewPanel,
  onBack,
  nombreUsuario,
}) => {
  return (
    <div className="seleccion-menu-container">
      <div className="seleccion-menu-header">
        <div className="header-actions-sm">
          {onViewPanel && (
            <button className="panel-button-sm" onClick={onViewPanel}>
              <User size={18} /> VER MI PANEL
            </button>
          )}
          <button className="back-button-sm" onClick={onBack}>
            <LogOut size={18} /> CERRAR SESIÓN
          </button>
        </div>
        <p className="welcome-text">BIENVENIDA DE VUELTA</p>
        <h1 className="user-name">¡Hola, {nombreUsuario}!</h1>
        <p className="subtitle-text">Selecciona qué deseas registrar hoy</p>
        <div className="divider-line"></div>
      </div>

      <div className="cards-container-sm">
        <div className="menu-card-sm escuela-cafe">
          <div className="card-icon-wrapper green-bg">
           <Coffee size={32} />
          </div>
          <h3 className="card-title-sm">Escuela Café</h3>
          <p className="card-description-sm">
            Registra y gestiona las formaciones.
          </p>
          <button className="btn-ingresar" onClick={onSelectEscuelaCafe}>
            REGISTRAR <ArrowRight size={18} />
          </button>
        </div>

        <div className="menu-card-sm evaluacion-toderas">
          <div className="card-icon-wrapper orange-bg">
            <Book size={32} />
          </div>
          <h3 className="card-title-sm">Evaluación Toderas</h3>

          <p className="card-description-sm">
            Registra evaluaciones y seguimiento del desempeño de las Toderas.
          </p>
          <button className="btn-ingresar" onClick={onSelectEvaluacionToderas}>
            REGISTRAR <ArrowRight size={18} />
          </button>
        </div> 
      </div>
    </div>
  );
};

export default SeleccionMenu;


