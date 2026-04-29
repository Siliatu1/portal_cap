const MESES_LABEL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const CLASS_BY_VARIANT = {
  heladeria: {
    container: 'inscripcion-container',
    decoration: 'decoration-circle',
    circle: ['circle-1', 'circle-2', 'circle-3'],
    back: 'back-button-outside',
    card: 'inscripcion-card',
    subtitle: 'inscripcion-subtitle',
    form: 'inscripcion-form',
    section: 'form-section',
    label: 'form-label',
    input: 'form-input',
    searchContainer: 'search-input-container',
    searchButton: 'search-button',
    loading: 'loading-indicator',
    mensaje: 'mensaje',
    employeeContainer: 'employee-info-container',
    toggleInfo: 'toggle-info-button',
    employeeDetails: 'employee-details',
    photoSection: 'form-section photo-section',
    photoPreview: 'photo-preview',
    employeePhoto: 'employee-photo',
    mesInfo: 'mes-info',
    fechasPagination: 'fechas-pagination-container',
    paginationButton: 'pagination-button',
    fechasGrid: 'fechas-grid',
    fechaCard: 'fecha-card',
    fechaDia: 'fecha-dia',
    fechaMes: 'fecha-mes',
    fechaTexto: 'fecha-texto',
    fechaNoDisponible: 'fecha-no-disponible-label',
    fechaContador: 'fecha-contador',
    fechaBloqueo: 'fecha-bloqueo-btn',
    paginationInfo: 'pagination-info',
    formActions: 'form-actions',
    cancelButton: 'cancel-button',
    submitButton: 'submit-button',
  },
  punto_venta: {
    container: 'inscripcion-pv-container',
    decoration: 'decoration-circle-pv',
    circle: ['circle-1-pv', 'circle-2-pv', 'circle-3-pv'],
    back: 'back-button-outside-pv',
    card: 'inscripcion-card-pv',
    subtitle: 'inscripcion-subtitle-pv',
    form: 'inscripcion-form-pv',
    section: 'form-section-pv',
    label: 'form-label-pv',
    input: 'form-input-pv',
    searchContainer: 'search-input-container-pv',
    searchButton: 'search-button-pv',
    loading: 'loading-indicator-pv',
    mensaje: 'mensaje-pv',
    employeeContainer: 'employee-info-container-pv',
    toggleInfo: 'toggle-info-button-pv',
    employeeDetails: 'employee-details-pv',
    photoSection: 'form-section-pv photo-section-pv',
    photoPreview: 'photo-preview-pv',
    employeePhoto: 'employee-photo-pv',
    mesInfo: 'mes-info-pv',
    fechasPagination: 'fechas-pagination-container-pv',
    paginationButton: 'pagination-button-pv',
    fechasGrid: 'fechas-grid-pv',
    fechaCard: 'fecha-card-pv',
    fechaDia: 'fecha-dia-pv',
    fechaMes: 'fecha-mes-pv',
    fechaTexto: 'fecha-texto-pv',
    fechaNoDisponible: 'fecha-no-disponible-label-pv',
    fechaContador: 'fecha-contador-pv',
    fechaBloqueo: 'fecha-bloqueo-btn-pv',
    paginationInfo: 'pagination-info-pv',
    formActions: 'form-actions-pv',
    cancelButton: 'cancel-button-pv',
    submitButton: 'submit-button-pv',
  },
};

function getPeriodoLabel(periodos) {
  if (!periodos?.length) return '';
  if (periodos.length === 1) return `${MESES_LABEL[periodos[0].month]} ${periodos[0].year}`;
  return `${MESES_LABEL[periodos[0].month]} y ${MESES_LABEL[periodos[1].month]}`;
}

function Field({ classes, label, children }) {
  return (
    <div className={classes.section}>
      <label className={classes.label}>{label}</label>
      {children}
    </div>
  );
}

function TextField({ classes, label, name, value, placeholder, readOnly, disabled, onChange, required = false }) {
  return (
    <Field classes={classes} label={label}>
      <input
        type={name === 'telefono' ? 'tel' : 'text'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange({ [name]: event.target.value })}
        className={classes.input}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        style={disabled || readOnly ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : undefined}
      />
    </Field>
  );
}

function FechaCard({ classes, fecha, selected, maxInscripciones, puedeBloquearFechas, onSelect, onToggleBloqueo }) {
  return (
    <div
      className={`${classes.fechaCard} ${selected ? 'selected' : ''} ${!fecha.disponible ? 'no-disponible' : ''}`}
      onClick={() => onSelect(fecha)}
      title={!fecha.disponible ? (fecha.esFestivo ? 'Dia festivo' : fecha.estaBloqueada ? 'Fecha bloqueada' : `Inscripciones: ${fecha.inscripciones}/${maxInscripciones}`) : `Inscripciones: ${fecha.inscripciones}/${maxInscripciones}`}
    >
      <div className={classes.fechaDia}>{parseInt(fecha.fecha.split('-')[2], 10)}</div>
      <div className={classes.fechaMes}>{fecha.texto.split(' ')[0]}</div>
      <div className={classes.fechaTexto}>{fecha.texto}</div>
      {!fecha.disponible && (
        <div className={classes.fechaNoDisponible}>
          {fecha.esFestivo ? 'FESTIVO' : fecha.estaBloqueada ? 'BLOQUEADA' : 'COMPLETO'}
        </div>
      )}
      {fecha.disponible && fecha.inscripciones > 0 && (
        <div className={classes.fechaContador}>{fecha.inscripciones}/{maxInscripciones}</div>
      )}
      {puedeBloquearFechas && (
        <button
          type="button"
          className={`${classes.fechaBloqueo} ${fecha.estaBloqueada ? 'bloqueada' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleBloqueo(fecha.fecha, fecha.estaBloqueada);
          }}
          title={fecha.estaBloqueada ? 'Desbloquear fecha' : 'Bloquear fecha'}
        >
          <i className={`bi ${fecha.estaBloqueada ? 'bi-unlock-fill' : 'bi-lock-fill'}`} />
        </button>
      )}
    </div>
  );
}

function PuntosVentaModal({ open, puntosVenta, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay-confirmacion" onClick={onClose}>
      <div className="modal-confirmacion" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 600, maxHeight: '70vh' }}>
        <div className="modal-confirmacion-header" style={{ background: '#007bff' }}>
          <i className="bi bi-geo-alt-fill" />
          <h2>PUNTOS DE VENTA</h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 15,
              top: 15,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
            }}
          >
            <i className="bi bi-x-circle-fill" />
          </button>
        </div>
        <div className="modal-confirmacion-body" style={{ maxHeight: '50vh', overflowY: 'auto', padding: 20 }}>
          <div style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 18, color: '#333' }}>
            Total de sedes vinculadas: {puntosVenta.length}
          </div>
          {puntosVenta.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {puntosVenta.map((punto) => (
                <div
                  key={punto}
                  style={{
                    padding: '12px 15px',
                    background: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <i className="bi bi-pin-map-fill" style={{ color: '#007bff', fontSize: 20 }} />
                  <span style={{ fontSize: 15, color: '#495057' }}>{punto}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
              <i className="bi bi-inbox" style={{ fontSize: 48, marginBottom: 15, display: 'block' }} />
              <p>No hay puntos de venta registrados</p>
            </div>
          )}
        </div>
        <div className="modal-confirmacion-footer">
          <button className="btn-modal-guardar" onClick={onClose} style={{ width: '100%' }}>Cerrar</button>
        </div>
      </div>
    </div>
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

function CafeInscripcionFormView({
  variant,
  title,
  dateDescription,
  maxInscripciones,
  showPuntosVentaModal,
  state,
  loading,
  actions,
  onBack,
}) {
  const classes = CLASS_BY_VARIANT[variant];
  const canShowEmployeeForm = state.busquedaRealizada;
  const isBusy = loading.empleado || loading.formulario;

  return (
    <div className={classes.container}>
      {classes.circle.map((circleClass) => (
        <div key={circleClass} className={`${classes.decoration} ${circleClass}`} />
      ))}

      <button className={classes.back} onClick={onBack}>
        <i className="bi bi-arrow-left-circle-fill" />
        <span>Volver</span>
      </button>

      <div className={classes.card}>
        <h1 className={classes.subtitle}>{title}</h1>

        <form className={classes.form} onSubmit={actions.submit}>
          <Field classes={classes} label="NUMERO DE DOCUMENTO *">
            <div className={classes.searchContainer}>
              <input
                type="text"
                placeholder="Ingresa el numero de documento completo"
                value={state.documento}
                onChange={(event) => actions.setDocumento(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    actions.buscarEmpleado();
                  }
                }}
                className={classes.input}
                disabled={isBusy}
              />
              <button
                type="button"
                onClick={actions.buscarEmpleado}
                className={classes.searchButton}
                disabled={isBusy || state.documento.trim().length < 6}
                title="Buscar empleado"
              >
                {loading.empleado ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-search" />}
              </button>
            </div>
            {loading.empleado && <span className={classes.loading}>Buscando empleado...</span>}
          </Field>

          <TextField
            classes={classes}
            label="NOMBRE DEL LIDER"
            name="nombreLider"
            value={state.formData.nombreLider}
            onChange={actions.updateFormData}
            readOnly
            disabled
          />

          {state.mensaje.texto && (
            <div className={`${classes.mensaje} ${state.mensaje.tipo}`}>{state.mensaje.texto}</div>
          )}

          {canShowEmployeeForm && (
            <div className={`${classes.employeeContainer} ${state.mostrarInfoEmpleado ? 'expanded' : ''}`}>
              <button type="button" className={classes.toggleInfo} onClick={actions.toggleInfoEmpleado}>
                <span>{state.mostrarInfoEmpleado ? 'Ocultar informacion' : 'Mostrar informacion'}</span>
                <i className={`bi ${state.mostrarInfoEmpleado ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>

              {state.mostrarInfoEmpleado && (
                <div className={classes.employeeDetails}>
                  {state.formData.fotoBuk && (
                    <div className={classes.photoSection}>
                      <label className={classes.label}>FOTO</label>
                      <div className={classes.photoPreview}>
                        <img src={state.formData.fotoBuk} alt="Foto empleado" className={classes.employeePhoto} />
                      </div>
                    </div>
                  )}

                  <TextField
                    classes={classes}
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
                    classes={classes}
                    label="TELEFONO *"
                    name="telefono"
                    placeholder="Ingrese el numero de telefono"
                    value={state.formData.telefono}
                    onChange={actions.updateFormData}
                    required
                  />

                  <TextField
                    classes={classes}
                    label="CARGO *"
                    name="cargo"
                    placeholder="Cargo actual"
                    value={state.formData.cargo}
                    onChange={actions.updateFormData}
                    readOnly={state.camposBloqueados.cargo}
                    disabled={state.camposBloqueados.cargo}
                    required
                  />

                  <Field classes={classes} label="PUNTO DE VENTA *">
                    <div className="punto-venta-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="puntoVenta"
                        placeholder="Ubicacion o punto de venta"
                        value={state.formData.puntoVenta}
                        onChange={(event) => actions.updateFormData({ puntoVenta: event.target.value })}
                        className={classes.input}
                        readOnly={state.camposBloqueados.puntoVenta}
                        disabled={state.camposBloqueados.puntoVenta}
                        required
                        style={state.camposBloqueados.puntoVenta ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : undefined}
                      />
                      {showPuntosVentaModal && (
                        <button
                          type="button"
                          className="ver-puntos-venta-btn"
                          onClick={actions.abrirModalPuntosVenta}
                          title="Ver todos los puntos de venta"
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                          }}
                        >
                          <i className="bi bi-geo-alt-fill" />
                        </button>
                      )}
                    </div>
                  </Field>
                </div>
              )}
            </div>
          )}

          {state.fechasDisponibles.length > 0 && (
            <div className={classes.section}>
              <label className={classes.label}>FECHA DE INSCRIPCION *</label>
              <div className={classes.mesInfo}>
                Fechas disponibles de {getPeriodoLabel(state.periodosAMostrar)}{dateDescription ? ` - ${dateDescription}` : ''}
              </div>

              <div className={classes.fechasPagination}>
                <button
                  type="button"
                  className={`${classes.paginationButton} prev`}
                  onClick={() => actions.setPaginaActual((prev) => Math.max(0, prev - 1))}
                  disabled={state.paginaActual === 0}
                >
                  <i className="bi bi-chevron-left" />
                </button>

                <div className={classes.fechasGrid}>
                  {state.fechasPagina.map((fecha) => (
                    <FechaCard
                      key={fecha.fecha}
                      classes={classes}
                      fecha={fecha}
                      selected={state.fechaInscripcion === fecha.fecha}
                      maxInscripciones={maxInscripciones}
                      puedeBloquearFechas={state.puedeBloquearFechas}
                      onSelect={actions.seleccionarFecha}
                      onToggleBloqueo={actions.bloquearFecha}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className={`${classes.paginationButton} next`}
                  onClick={() => actions.setPaginaActual((prev) => Math.min(state.totalPaginas - 1, prev + 1))}
                  disabled={state.paginaActual >= state.totalPaginas - 1}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>

              <div className={classes.paginationInfo}>
                Pagina {state.paginaActual + 1} de {state.totalPaginas}
              </div>
            </div>
          )}

          <div className={classes.formActions}>
            <button type="button" className={classes.cancelButton} onClick={actions.limpiarFormulario} disabled={isBusy}>
              Limpiar
            </button>
            <button type="submit" className={classes.submitButton} disabled={isBusy || !canShowEmployeeForm}>
              {loading.formulario ? 'Guardando...' : 'Inscribir'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={state.mostrarModal}
        onCancel={actions.limpiarFormulario}
        onConfirm={actions.confirmarGuardado}
      />

      <PuntosVentaModal
        open={state.mostrarModalPuntosVenta}
        puntosVenta={state.puntosVenta}
        onClose={actions.cerrarModalPuntosVenta}
      />
    </div>
  );
}

export default CafeInscripcionFormView;
