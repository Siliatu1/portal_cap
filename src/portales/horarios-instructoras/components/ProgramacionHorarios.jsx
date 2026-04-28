import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'antd';
import 'antd/dist/reset.css';
import '../styles/ProgramacionHorarios.css';
import {
  createHorarioInstructora,
  getHorariosInstructoras,
  getPdvIps,
  updateHorarioInstructora
} from '../../../services/apiService';
import { useAuth } from '../../../shared/context/AuthContext';
import ProgramacionHorariosModal from './ProgramacionHorariosModal';
import {
  buildDescansoEvent,
  buildDescansoPayload,
  buildEventoLocal,
  buildHorarioApiPayload,
  buildModalFormFromEvento,
  buildProgramacionFromApi,
  calculateHorasDia,
  calculateTotalHorasSemana,
  createEmptyProgramacionSemanal,
  createProgramacionStoragePayload,
  DIAS_SEMANA,
  DIAS_SEMANA_LABEL,
  EXPANDABLE_MOTIVOS,
  filterPdvs,
  formatFecha,
  formatFechaCompleta,
  getActividadLabel,
  getFechasSemana,
  getInfoSemana,
  getInitials,
  INITIAL_MODAL_FORM,
  validateEventoForm,
} from './programacionHorarios.helpers';

function ProgramacionHorarios() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [puntosVenta, setPuntosVenta] = useState([]);
    const [loadingPuntos, setLoadingPuntos] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [eventoEditarModal, setEventoEditarModal] = useState(null);
    const [formDataModal, setFormDataModal] = useState(INITIAL_MODAL_FORM);
    const [showMoreMotivosModal, setShowMoreMotivosModal] = useState(false);
    const [guardandoDia, setGuardandoDia] = useState(false);
    const [semanaOffset, setSemanaOffset] = useState(0);
    const [programacionSemanal, setProgramacionSemanal] = useState(createEmptyProgramacionSemanal);
    const [pdvSearchText, setPdvSearchText] = useState('');
    const [showPdvDropdown, setShowPdvDropdown] = useState(false);

    const fechasSemana = useMemo(() => getFechasSemana(semanaOffset), [semanaOffset]);
    const infoSemana = useMemo(() => getInfoSemana(fechasSemana), [fechasSemana]);
    const totalHorasSemana = useMemo(
      () => calculateTotalHorasSemana(programacionSemanal),
      [programacionSemanal]
    );
    const pdvsFiltrados = useMemo(
      () => filterPdvs(pdvSearchText, puntosVenta),
      [pdvSearchText, puntosVenta]
    );
    const storageKey = useMemo(() => {
      if (!user?.documento || fechasSemana.length === 0) {
        return null;
      }

      return `programacion_${user.documento}_${fechasSemana[0].toISOString().slice(0, 10)}`;
    }, [fechasSemana, user?.documento]);

    useEffect(() => {
      if (!userData) {
        logout();
        return;
      }

      setUser({
        documento: userData?.document_number || '',
        nombre: userData?.nombre || '',
        correo: userData?.correo || '',
        telefono: userData?.Celular || '',
        cargo: userData?.cargo || '',
        foto: userData?.foto || ''
      });
    }, [logout, userData]);

    useEffect(() => {
      const cargarPuntosVenta = async () => {
        try {
          const response = await getPdvIps('pagination[pageSize]=1000');
          const items = Array.isArray(response?.data) ? response.data : [];

          setPuntosVenta(
            items
              .map((pdv) => ({
                id: pdv.id,
                nombre: pdv.attributes?.nombre || pdv.nombre || ''
              }))
              .filter((pdv) => pdv.nombre)
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
        } catch (error) {
          console.error('Error al cargar puntos de venta:', error);
          setPuntosVenta([]);
        } finally {
          setLoadingPuntos(false);
        }
      };

      cargarPuntosVenta();
    }, []);

    useEffect(() => {
      if (!user?.documento || fechasSemana.length === 0) {
        return;
      }

      const cargarProgramacion = async () => {
        try {
          const fechaInicio = fechasSemana[0].toISOString().slice(0, 10);
          const fechaFin = fechasSemana[6].toISOString().slice(0, 10);
          const response = await getHorariosInstructoras(
            `filters[documento][$eq]=${user.documento}&filters[fecha][$gte]=${fechaInicio}&filters[fecha][$lte]=${fechaFin}&pagination[pageSize]=40000`
          );

          if (Array.isArray(response?.data) && response.data.length > 0) {
            setProgramacionSemanal(buildProgramacionFromApi(response.data, fechasSemana));
            return;
          }

          if (storageKey) {
            const localData = localStorage.getItem(storageKey);
            if (localData) {
              const payload = JSON.parse(localData);
              setProgramacionSemanal(payload?.programacion || createEmptyProgramacionSemanal());
              return;
            }
          }

          setProgramacionSemanal(createEmptyProgramacionSemanal());
        } catch (error) {
          console.error('Error al cargar programación:', error);

          if (storageKey) {
            const localData = localStorage.getItem(storageKey);
            if (localData) {
              try {
                const payload = JSON.parse(localData);
                setProgramacionSemanal(payload?.programacion || createEmptyProgramacionSemanal());
                return;
              } catch (parseError) {
                console.error('Error al leer respaldo local:', parseError);
              }
            }
          }

          setProgramacionSemanal(createEmptyProgramacionSemanal());
        }
      };

      cargarProgramacion();
    }, [fechasSemana, storageKey, user?.documento]);

    useEffect(() => {
      if (!storageKey) {
        return;
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify(createProgramacionStoragePayload(programacionSemanal, fechasSemana))
      );
    }, [fechasSemana, programacionSemanal, storageKey]);

    const resetModalState = () => {
      setModalEditar(false);
      setDiaSeleccionado(null);
      setEventoEditarModal(null);
      setFormDataModal(INITIAL_MODAL_FORM);
      setPdvSearchText('');
      setShowPdvDropdown(false);
      setShowMoreMotivosModal(false);
    };

    const handleCerrarModal = () => {
      if (guardandoDia) {
        return;
      }

      resetModalState();
    };

    const abrirModalDia = (dia, index, evento = null, eventoIndex = null) => {
      const formData = evento ? buildModalFormFromEvento(evento) : INITIAL_MODAL_FORM;

      setDiaSeleccionado({ dia, index });
      setEventoEditarModal(
        evento && eventoIndex !== null
          ? { ...evento, index: eventoIndex }
          : null
      );
      setFormDataModal(formData);
      setPdvSearchText(formData.puntoVenta);
      setShowPdvDropdown(false);
      setShowMoreMotivosModal(Boolean(evento?.motivo && EXPANDABLE_MOTIVOS.has(evento.motivo)));
      setModalEditar(true);
    };

    const handleSearchChange = (value) => {
      setPdvSearchText(value);
      setShowPdvDropdown(true);
      setFormDataModal((prev) => ({
        ...prev,
        puntoVenta: prev.puntoVenta === value ? prev.puntoVenta : ''
      }));
    };

    const handleSelectPdv = (nombre) => {
      setPdvSearchText(nombre);
      setShowPdvDropdown(false);
      setFormDataModal((prev) => ({
        ...prev,
        puntoVenta: nombre
      }));
    };

    const handleSelectMotivo = (motivo) => {
      setFormDataModal((prev) => ({
        ...prev,
        motivo,
        puntoVenta: motivo === 'vacaciones' ? '' : prev.puntoVenta,
        horaInicio: motivo === 'vacaciones' ? '' : prev.horaInicio,
        horaFin: motivo === 'vacaciones' ? '' : prev.horaFin,
        detalleCubrir: motivo === 'cubrir_puesto' ? prev.detalleCubrir : '',
        detalleOtro: motivo === 'otro' ? prev.detalleOtro : ''
      }));

      if (motivo === 'vacaciones') {
        setPdvSearchText('');
        setShowPdvDropdown(false);
      }
    };

    const handleGuardarEdicionModal = async () => {
      if (!diaSeleccionado || !user?.documento) {
        return;
      }

      const error = validateEventoForm(
        formDataModal,
        programacionSemanal,
        diaSeleccionado.dia,
        eventoEditarModal
      );

      if (error) {
        alert(error);
        return;
      }

      setGuardandoDia(true);

      try {
        const fecha = fechasSemana[diaSeleccionado.index];
        const { datosAPI } = buildHorarioApiPayload(formDataModal, fecha, user.documento);

        let idAPI = eventoEditarModal?.idAPI || null;

        if (idAPI) {
          await updateHorarioInstructora(idAPI, datosAPI);
        } else {
          const response = await createHorarioInstructora(datosAPI);
          idAPI = response?.data?.id || response?.id || Date.now();
        }

        const eventoLocal = buildEventoLocal(formDataModal, idAPI);

        setProgramacionSemanal((prev) => {
          const eventosDia = [...prev[diaSeleccionado.dia]];

          if (eventoEditarModal) {
            eventosDia[eventoEditarModal.index] = eventoLocal;
          } else {
            eventosDia.push(eventoLocal);
          }

          return {
            ...prev,
            [diaSeleccionado.dia]: eventosDia
          };
        });

        resetModalState();
        alert(eventoEditarModal ? 'Actividad actualizada correctamente' : 'Actividad guardada correctamente');
      } catch (saveError) {
        console.error('Error al guardar actividad:', saveError);
        alert('No fue posible guardar la actividad. Intenta nuevamente.');
      } finally {
        setGuardandoDia(false);
      }
    };

    const handleDiaDescanso = async (dia, index) => {
      if (!user?.documento) {
        return;
      }

      if (!window.confirm(`¿Marcar ${DIAS_SEMANA_LABEL[index]} como día de descanso?`)) {
        return;
      }

      setGuardandoDia(true);

      try {
        const fecha = fechasSemana[index];
        const payload = buildDescansoPayload(fecha, user.documento);
        const response = await createHorarioInstructora(payload);
        const eventoDescanso = buildDescansoEvent(response?.data?.id || response?.id || Date.now());

        setProgramacionSemanal((prev) => ({
          ...prev,
          [dia]: [eventoDescanso]
        }));

        alert(`${DIAS_SEMANA_LABEL[index]} marcado como descanso`);
      } catch (error) {
        console.error('Error al guardar día de descanso:', error);
        alert('No fue posible registrar el día de descanso.');
      } finally {
        setGuardandoDia(false);
      }
    };

    const handleQuitarDescanso = (dia) => {
      if (!window.confirm('¿Quitar el día de descanso de esta fecha?')) {
        return;
      }

      setProgramacionSemanal((prev) => ({
        ...prev,
        [dia]: []
      }));
    };

    const handleDescargarPDF = () => {
      const actividades = [];

      DIAS_SEMANA.forEach((dia, index) => {
        programacionSemanal[dia].forEach((evento) => {
          actividades.push({
            dia: DIAS_SEMANA_LABEL[index],
            fecha: formatFechaCompleta(fechasSemana[index]),
            actividad: getActividadLabel(evento),
            hora: evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones'
              ? 'Todo el día'
              : `${evento.horaInicio} - ${evento.horaFin}`,
            puntoVenta: evento.puntoVenta || 'N/A',
            detalleCubrir: evento.detalleCubrir || ''
          });
        });
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return;
      }

      const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Agenda Semanal - ${user?.nombre || 'Instructora'}</title>
            ${documentStyles}
          </head>
          <body class="programacion-print">
            <div class="programacion-print__header">
              <h1 class="programacion-print__title">Agenda Semanal de Capacitaciones</h1>
              <p><strong>Instructora:</strong> ${user?.nombre || 'N/A'}</p>
              <p><strong>Documento:</strong> ${user?.documento || 'N/A'}</p>
            </div>

            <div class="programacion-print__summary">
              <h3 class="programacion-print__summary-title">Programación - Semana #${infoSemana.numeroSemana}</h3>
              <p><strong>Período:</strong> ${formatFechaCompleta(infoSemana.fechaInicio)} - ${formatFechaCompleta(infoSemana.fechaFin)}</p>
              <p><strong>Total de horas programadas:</strong> ${totalHorasSemana.toFixed(1)} horas</p>
            </div>

            <table class="programacion-print__table">
              <thead>
                <tr>
                  <th class="programacion-print__col-day">Día</th>
                  <th class="programacion-print__col-date">Fecha</th>
                  <th class="programacion-print__col-activity">Actividad</th>
                  <th class="programacion-print__col-time">Hora</th>
                  <th class="programacion-print__col-pdv">Punto de Venta</th>
                </tr>
              </thead>
              <tbody>
                ${actividades.length > 0 ? actividades.map((actividad) => `
                  <tr>
                    <td><strong>${actividad.dia}</strong></td>
                    <td>${actividad.fecha}</td>
                    <td>${actividad.actividad}</td>
                    <td>${actividad.hora}</td>
                    <td>
                      <div class="programacion-print__pdv">${actividad.puntoVenta}</div>
                      ${actividad.detalleCubrir ? `<div class="programacion-print__detail">Cubrir en: ${actividad.detalleCubrir}</div>` : ''}
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="5" class="programacion-print__empty"><em>No hay programación registrada</em></td></tr>'}
              </tbody>
            </table>

            <div class="programacion-print__footer">
              <p>Generado el ${new Date().toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    };

    const handleLogoutClick = () => {
      if (!window.confirm('¿Estás segura de que deseas cerrar sesión?')) {
        return;
      }

      setShowProfileModal(false);
      logout();
      navigate('/cap/cafe', { replace: true });
    };

    return (
      <div className="programacion-container">
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <button
                className="profile-button-avatar"
                onClick={() => setShowProfileModal(true)}
                title="Ver perfil"
              >
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt="Perfil"
                    className="profile-avatar"
                    onError={() => setUser((prev) => ({ ...prev, foto: '' }))}
                  />
                ) : (
                  <div className="profile-avatar-initials">{getInitials(user?.nombre)}</div>
                )}
              </button>

              <div className="navbar-titles">
                <h1 className="navbar-title">Programación de Horarios</h1>
                <span className="navbar-subtitle">Gestión semanal de instructora</span>
              </div>
            </div>

            <button
              className="btn-back"
              onClick={() => navigate('/portal/horarios-instructoras/instructor')}
              title="Volver al dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </nav>

        <main className="programacion-main">
          <div className="semana-info-section">
            <div className="semana-info-card">
              <div className="semana-detalle-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  <strong>Período:</strong> {formatFechaCompleta(infoSemana.fechaInicio)} - {formatFechaCompleta(infoSemana.fechaFin)}
                </span>
              </div>
              <div className="semana-detalle-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span>
                  <strong>Total programado:</strong> {totalHorasSemana.toFixed(1)} horas
                </span>
              </div>
            </div>
          </div>

          <div className="agenda-section-simplified">
            <div className="agenda-grid-simplified">
              {DIAS_SEMANA.map((dia, index) => {
                const eventos = programacionSemanal[dia] || [];
                const horasDia = calculateHorasDia(eventos);

                return (
                  <div key={dia} className="dia-card">
                    <div className="dia-card-header">
                      <div className="dia-info">
                        <div className="dia-nombre">{DIAS_SEMANA_LABEL[index]}</div>
                        <div className="dia-fecha">{formatFecha(fechasSemana[index])}</div>
                      </div>
                      <div className="dia-horas">{horasDia.toFixed(1)}h</div>
                    </div>

                    <div className="dia-card-body">
                      {eventos.length === 0 ? (
                        <div className="sin-eventos">
                          <p className="sin-eventos-text">Sin actividades</p>
                        </div>
                      ) : (
                        <div className="eventos-lista">
                          {eventos.map((evento, eventoIndex) => {
                            const esDescanso = evento.motivo === 'dia_descanso';

                            return (
                              <div
                                key={`${dia}-${eventoIndex}`}
                                className={`evento-item ${esDescanso ? 'evento-item-readonly' : ''}`}
                                onClick={() => {
                                  if (esDescanso) {
                                    handleQuitarDescanso(dia);
                                    return;
                                  }

                                  abrirModalDia(dia, index, evento, eventoIndex);
                                }}
                              >
                                <div className="evento-hora">
                                  {esDescanso || evento.motivo === 'vacaciones'
                                    ? 'Todo el día'
                                    : `${evento.horaInicio} - ${evento.horaFin}`}
                                </div>
                                <div className="evento-info">
                                  <div className="evento-pdv">{evento.puntoVenta || 'N/A'}</div>
                                  <div className="evento-motivo">{getActividadLabel(evento)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {eventos.length === 0 && (
                      <div className="dia-card-footer">
                        <button
                          className="btn-agregar-evento"
                          onClick={() => abrirModalDia(dia, index)}
                          disabled={loadingPuntos || guardandoDia}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Agendar
                        </button>

                        <button
                          className="btn-dia-descanso"
                          onClick={() => handleDiaDescanso(dia, index)}
                          disabled={guardandoDia}
                        >
                          Descanso
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <Modal
          title="Perfil"
          open={showProfileModal}
          onCancel={() => setShowProfileModal(false)}
          footer={[
            <Button key="logout" danger onClick={handleLogoutClick}>
              Cerrar Sesión
            </Button>
          ]}
        >
          <div className="profile-modal-content">
            <div className="profile-avatar-modal profile-avatar-modal-centered">
              {getInitials(user?.nombre)}
            </div>
            <h3 className="profile-modal-heading">{user?.nombre || 'Usuario'}</h3>
            <p className="profile-modal-text"><strong>Cargo:</strong> {user?.cargo || 'Instructora'}</p>
            <p className="profile-modal-text"><strong>Documento:</strong> {user?.documento || 'No disponible'}</p>
            <p className="profile-modal-text"><strong>Correo:</strong> {user?.correo || 'No disponible'}</p>
          </div>
        </Modal>

        <ProgramacionHorariosModal
          open={modalEditar}
          editing={Boolean(eventoEditarModal)}
          formData={formDataModal}
          pdvSearchText={pdvSearchText}
          pdvsFiltrados={pdvsFiltrados}
          loadingPuntos={loadingPuntos}
          guardandoDia={guardandoDia}
          showPdvDropdown={showPdvDropdown}
          showMoreMotivos={showMoreMotivosModal}
          onClose={handleCerrarModal}
          onSave={handleGuardarEdicionModal}
          onFieldChange={(field, value) => setFormDataModal((prev) => ({ ...prev, [field]: value }))}
          onSearchChange={handleSearchChange}
          onSearchFocus={() => setShowPdvDropdown(true)}
          onSearchBlur={() => setTimeout(() => setShowPdvDropdown(false), 150)}
          onSelectPdv={handleSelectPdv}
          onSelectMotivo={handleSelectMotivo}
          onToggleMotivos={() => setShowMoreMotivosModal((prev) => !prev)}
        />
      </div>
    );
  }

export default ProgramacionHorarios;

