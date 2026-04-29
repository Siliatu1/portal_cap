import { Select } from 'antd';

const opcionesCargoEvaluar = [
  {
    label: <span className="cargo-group-title cargo-group-sal">SAL</span>,
    options: [
      { value: 'Plancha Sal', label: 'Plancha Sal' },
      { value: 'Cocina', label: 'Cocina' },
      { value: 'Pitas y Ensaladas', label: 'Pitas y Ensaladas' },
    ],
  },
  {
    label: <span className="cargo-group-title cargo-group-dulce">DULCE</span>,
    options: [
      { value: 'Postres y Helados', label: 'Postres y Helados' },
    ],
  },
  {
    label: <span className="cargo-group-title cargo-group-bebidas">BEBIDAS</span>,
    options: [
      { value: 'Bebidas Frias y Calientes', label: 'Bebidas Frias y Calientes' },
    ],
  },
  {
    label: <span className="cargo-group-title cargo-group-brunch">BRUNCH (Solo 1 punto)</span>,
    options: [
      { value: 'Plancha Sal Brunch', label: 'Plancha Sal Brunch' },
      { value: 'Cocina Brunch', label: 'Cocina Brunch' },
      { value: 'Postres y Helados Brunch', label: 'Postres y Helados Brunch' },
      { value: 'Bebidas Brunch', label: 'Bebidas Brunch' },
    ],
  },
];

function Field({ label, children }) {
  return (
    <div className="form-section">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function TextField({ label, name, value, placeholder, readOnly, disabled, onChange, required = false }) {
  return (
    <Field label={label}>
      <input
        type={name === 'telefono' ? 'tel' : 'text'}
        name={name}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange({ [name]: event.target.value })}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        style={disabled || readOnly ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : undefined}
      />
    </Field>
  );
}

function ConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-overlay-confirmacion">
      <div className="modal-confirmacion">
        <div className="modal-confirmacion-header">
          <i className="bi bi-exclamation-triangle-fill" />
          <h2>ADVERTENCIA</h2>
        </div>
        <div className="modal-confirmacion-body">
          <p>LA PERSONA INSCRITA DEBE ASISTIR OBLIGATORIAMENTE</p>
        </div>
        <div className="modal-confirmacion-footer">
          <button className="btn-modal-cancelar" onClick={onCancel}>Cancelar</button>
          <button className="btn-modal-guardar" onClick={onConfirm}>Agregar</button>
        </div>
      </div>
    </div>
  );
}

function EvaluacionToderaFormView({ state, loading, actions, onBack }) {
  const canShowForm = state.busquedaRealizada;
  const isBusy = loading.empleado || loading.formulario;

  return (
    <div className="inscripcion-container">
      <div className="decoration-circle circle-1" />
      <div className="decoration-circle circle-2" />
      <div className="decoration-circle circle-3" />

      <button className="back-button-outside" onClick={onBack}>
        <i className="bi bi-arrow-left-circle-fill" />
        <span>Volver</span>
      </button>

      <div className="inscripcion-card">
        <h1 className="inscripcion-subtitle">EVALUACION TODERAS</h1>

        <div className="alerta-evaluacion-box">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>SOLO SE PUEDE INSCRIBIR SI YA ESTA 100% LISTA PARA LA EVALUACION</span>
        </div>

        <form onSubmit={actions.submit} className="inscripcion-form">
          <Field label="NUMERO DE DOCUMENTO *">
            <div className="search-input-container">
              <input
                type="text"
                className="form-input"
                placeholder="Ingrese numero de documento completo"
                value={state.documento}
                onChange={(event) => actions.setDocumento(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    actions.buscarEmpleado();
                  }
                }}
                disabled={isBusy}
              />
              <button
                type="button"
                className="search-button"
                onClick={actions.buscarEmpleado}
                disabled={isBusy || state.documento.trim().length < 6}
              >
                {loading.empleado ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-search" />}
              </button>
            </div>
            {loading.empleado && <span className="loading-indicator">Buscando empleado...</span>}
            {state.mensaje.texto && (
              <div className={`mensaje ${state.mensaje.tipo}`}>{state.mensaje.texto}</div>
            )}
          </Field>

          {canShowForm && (
            <>
              {state.formData.fotoBuk && (
                <div className="form-section photo-section">
                  <label className="form-label">FOTO</label>
                  <div className="photo-preview">
                    <img src={state.formData.fotoBuk} alt="Foto empleado" className="employee-photo" />
                  </div>
                </div>
              )}

              <TextField
                label="NOMBRES COMPLETOS *"
                name="nombres"
                placeholder="Ingrese nombres completos"
                value={state.formData.nombres}
                onChange={actions.updateFormData}
                readOnly={state.camposBloqueados.nombres}
                disabled={state.camposBloqueados.nombres}
                required
              />

              <TextField
                label="TELEFONO *"
                name="telefono"
                placeholder="Ingrese telefono"
                value={state.formData.telefono}
                onChange={actions.updateFormData}
                required
              />

              <TextField
                label="CARGO *"
                name="cargo"
                placeholder="Cargo actual"
                value={state.formData.cargo}
                onChange={actions.updateFormData}
                readOnly={state.camposBloqueados.cargo}
                disabled={state.camposBloqueados.cargo}
                required
              />

              <TextField
                label="PUNTO DE VENTA *"
                name="puntoVenta"
                placeholder="Punto de venta"
                value={state.formData.puntoVenta}
                onChange={actions.updateFormData}
                readOnly={state.camposBloqueados.puntoVenta}
                disabled={state.camposBloqueados.puntoVenta}
                required
              />

              <Field label="CATEGORIA A EVALUAR *">
                <select
                  className="form-input"
                  value={state.categoria}
                  onChange={(event) => actions.setCategoria(event.target.value)}
                  required
                >
                  <option value="">Seleccione la categoria</option>
                  <option value="sal">Sal</option>
                  <option value="dulce">Dulce</option>
                  <option value="bebidas">Bebidas</option>
                </select>
              </Field>

              <Field label="CARGO A EVALUAR *">
                <Select
                  className="cargo-evaluar-select"
                  popupClassName="cargo-evaluar-dropdown"
                  value={state.cargoEvaluar || undefined}
                  onChange={actions.setCargoEvaluar}
                  placeholder="Seleccione un cargo"
                  options={opcionesCargoEvaluar}
                  showSearch
                  optionFilterProp="label"
                />
              </Field>

              {state.categoria && (
                <TextField
                  label={(
                    <>
                      NOMBRE DE LA INSTRUCTORA
                      {loading.instructora && <i className="bi bi-hourglass-split" style={{ marginLeft: 8 }} />}
                    </>
                  )}
                  name="nombreLider"
                  value={loading.instructora ? 'Buscando instructora...' : (state.instructora || 'Sin asignar')}
                  onChange={actions.updateFormData}
                  readOnly
                  disabled
                />
              )}

              <div className="button-container">
                <button type="button" className="button-secondary" onClick={actions.limpiarFormulario} disabled={isBusy}>
                  <i className="bi bi-x-circle" /> Limpiar
                </button>
                <button type="submit" className="button-primary" disabled={isBusy}>
                  {loading.formulario ? (
                    <>
                      <i className="bi bi-hourglass-split" /> Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle" /> Registrar Evaluacion
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <ConfirmModal
        open={state.mostrarModal}
        onCancel={actions.cancelarConfirmacion}
        onConfirm={actions.confirmarGuardado}
      />
    </div>
  );
}

export default EvaluacionToderaFormView;
