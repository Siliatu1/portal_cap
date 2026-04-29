function SectionTabs({ activeSection, permissions, onChange }) {
  return (
    <div className="main-section-button-container">
      <button
        className={`main-section-button ${activeSection === 'escuela_cafe' ? 'active' : ''}`}
        onClick={() => onChange('escuela_cafe')}
      >
        <span>Escuela del Cafe</span>
      </button>

      {permissions.puedeVerTodera && (
        <button
          className={`main-section-button ${activeSection === 'evaluacion_todera' ? 'active' : ''}`}
          onClick={() => onChange('evaluacion_todera')}
        >
          <span>Evaluacion Todera</span>
        </button>
      )}

      {permissions.puedeGestionarInstructoras && (
        <button
          className={`main-section-button ${activeSection === 'gestion_instructoras' ? 'active' : ''}`}
          onClick={() => onChange('gestion_instructoras')}
        >
          <span>Gestion Instructoras</span>
        </button>
      )}
    </div>
  );
}

export default SectionTabs;
