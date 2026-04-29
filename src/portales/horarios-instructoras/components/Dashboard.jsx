import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Modal, Space, Card, Tooltip } from 'antd';
import { EyeOutlined, DownloadOutlined, EditOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../styles/Dashboard.css';
import DashboardEditModal from './DashboardEditModal';
import {
  formatearFecha,
  formatearFechaCompleta,
  formatearRangoFechas,
  getActividadTagColor,
  getDiaSemana,
  getInitials,
} from './dashboard.helpers';
import { useDashboardController } from '../hooks/useDashboardController';


function Dashboard() {
  const navigate = useNavigate();
  const { user, data, ui, actions } = useDashboardController();
  const { puntosVenta, horariosDetalles, horariosData, infoSemana, totalHoras } = data;
  const {
    showProfileModal,
    showPreviewModal,
    semanaPreview,
    modalEditar,
    showMoreMotivos,
    filaExpandida,
    formDataModal,
  } = ui;

  const handleDescargarPDF = (semana) => {
    const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    const filas = horariosDetalles.map(h => `
      <tr>
        <td><strong>${getDiaSemana(h.fecha)}</strong></td>
        <td>${formatearFechaCompleta(h.fecha)}</td>
        <td>${h.actividad}</td>
        <td>${h.horaInicio === '00:00:00' ? 'Todo el día' : `${h.horaInicio.substring(0,5)} - ${h.horaFin.substring(0,5)}`}</td>
        <td>${h.pdv}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
      <html><head><title>Programación Semanal</title>
      ${documentStyles}</head>
      <body class="dashboard-print">
        <div class="dashboard-print__header">
          <h1 class="dashboard-print__title">Programación Semanal de Capacitaciones</h1>
          <p><strong>Instructora:</strong> ${user?.nombre || 'N/A'}</p>
        </div>
        <div class="dashboard-print__summary">
          <p><strong>Período:</strong> ${formatearRangoFechas(semana.fechaInicio, semana.fechaFin)}</p>
          <p><strong>Total de horas programadas:</strong> ${semana.totalHoras.toFixed(1)} horas</p>
        </div>
        <table class="dashboard-print__table">
          <thead>
            <tr>
              <th class="dashboard-print__col-day">Día</th><th class="dashboard-print__col-date">Fecha</th>
              <th class="dashboard-print__col-activity">Actividad</th><th class="dashboard-print__col-time">Hora</th>
              <th class="dashboard-print__col-pdv">Punto de Venta</th>
            </tr>
          </thead>
          <tbody>
            ${horariosDetalles.length > 0
              ? filas
              : '<tr><td colspan="5" class="dashboard-print__empty"><em>No hay programación registrada</em></td></tr>'}
          </tbody>
        </table>
        <div class="dashboard-print__footer">
          <p>Generado el ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
        </div>
      </body></html>`;

    const win = window.open('', '', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="profile-button-avatar" onClick={() => actions.setShowProfileModal(true)}>
              {user?.foto
                ? <img src={user.foto} alt="Perfil" className="profile-avatar"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                : <div className="profile-avatar-initials">{getInitials(user?.nombre)}</div>}
            </button>
            <div className="navbar-titles">
              <h1 className="navbar-title">MIS HORARIOS</h1>
              <span className="navbar-subtitle">Gestión de Disponibilidad</span>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="btn-volver" onClick={() => navigate('/menu')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Volver
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-greeting">¡Hola, {user?.nombre?.split(' ')[0]}!</h2>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card"
            onClick={() => navigate('/portal/horarios-instructoras/instructor/programacion')}>
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Programar Horarios</h3>
              <p className="card-description">Programa tu disponibilidad semanal</p>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>

        {/* Tabla de Horarios */}
        <div className="horarios-table-section">
          <div className="table-header">
            <div>
              <h3 className="table-title">Horarios Programados</h3>
              {infoSemana && (
                <p className="table-period-text">
                  {formatearFecha(infoSemana.fechaInicio)} - {formatearFecha(infoSemana.fechaFin)}
                </p>
              )}
            </div>
            <div className="table-nav-group">
              <button className="btn-semana-nav"
                onClick={() => { actions.cambiarSemana(-1); }}>
                ← Anterior
              </button>
              <span className="semana-label-nav">
                {infoSemana
                  ? `${formatearFecha(infoSemana.fechaInicio)} – ${formatearFecha(infoSemana.fechaFin)}`
                  : 'Cargando...'}
              </span>
              <button className="btn-semana-nav"
                onClick={() => { actions.cambiarSemana(1); }}>
                Siguiente →
              </button>
            </div>
            <div className="table-stats">
              <Tag color="green" className="dashboard-total-tag">
                Total: {totalHoras.toFixed(1)}h
              </Tag>
            </div>
          </div>

          <Card className="dashboard-table-card">
            <Table
              dataSource={horariosData}
              columns={[
                {
                  title: 'Fechas', key: 'fechas',
                  render: (_, r) => formatearRangoFechas(r.fechaInicio, r.fechaFin),
                },
                {
                  title: 'Total Horas', dataIndex: 'totalHoras', key: 'totalHoras',
                  render: h => <Tag color="cyan" className="dashboard-hours-tag">{h.toFixed(1)}h</Tag>,
                },
                {
                  title: 'Acciones', key: 'acciones',
                  render: (_, record) => (
                    <Space size="small">
                      <Tooltip title="Ver detalle">
                        <Button type="text" icon={<EyeOutlined />}
                          onClick={() => actions.verSemana(record)} className="dashboard-action-btn dashboard-action-btn--view" />
                      </Tooltip>
                      <Tooltip title="Descargar PDF">
                        <Button type="text" icon={<DownloadOutlined />}
                          onClick={() => handleDescargarPDF(record)} className="dashboard-action-btn dashboard-action-btn--download" />
                      </Tooltip>
                    </Space>
                  ),
                },
              ]}
              expandable={{
                expandedRowRender: () => (
                  <div className="dashboard-expanded-content">
                    <h4 className="dashboard-expanded-title">Actividades de la Semana</h4>
                    {horariosDetalles.length > 0 ? (
                      <Table
                        dataSource={horariosDetalles.map((d, i) => ({ ...d, key: i }))}
                        columns={[
                          { title: 'Día',    dataIndex: 'fecha',     key: 'dia',    render: f => <strong>{getDiaSemana(f)}</strong> },
                          { title: 'Fecha',  dataIndex: 'fecha',     key: 'fecha',  render: f => formatearFechaCompleta(f) },
                          { title: 'PDV',    dataIndex: 'pdv',       key: 'pdv' },
                          {
                            title: 'Actividad', dataIndex: 'actividad', key: 'actividad',
                            render: act => <Tag color={getActividadTagColor(act)}>{act}</Tag>,
                          },
                          {
                            title: 'Horario', key: 'horario',
                            render: (_, d) => d.horaInicio === '00:00:00'
                              ? <Tag color="orange">Todo el día</Tag>
                              : `${d.horaInicio.substring(0,5)} - ${d.horaFin.substring(0,5)}`,
                          },
                          {
                            title: 'Acciones', key: 'acciones',
                            render: (_, detalle) => (
                              <Space size="small">
                                <Tooltip title="Editar">
                                  <Button type="text" size="small" icon={<EditOutlined />}
                                    onClick={() => actions.editarActividad(detalle)}
                                    className="dashboard-action-btn dashboard-action-btn--edit" />
                                </Tooltip>
                              </Space>
                            ),
                          },
                        ]}
                        pagination={false} size="small"
                      />
                    ) : (
                      <p className="dashboard-empty-state">
                        No hay actividades programadas
                      </p>
                    )}
                  </div>
                ),
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded
                    ? <UpOutlined   onClick={e => onExpand(record, e)} className="dashboard-expand-icon" />
                    : <DownOutlined onClick={e => onExpand(record, e)} className="dashboard-expand-icon" />,
                onExpand:        (expanded, record) => actions.setFilaExpandida(expanded ? record.key : null),
                expandedRowKeys: filaExpandida ? [filaExpandida] : [],
              }}
              locale={{ emptyText: 'No hay horarios programados' }}
              pagination={false} bordered
            />
          </Card>
        </div>
      </main>

      {/* Modal de Perfil */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => actions.setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-avatar-modal">
              {user?.foto
                ? <img src={user.foto} alt="Perfil"
                    className="profile-avatar-modal-image" />
                : getInitials(user?.nombre)}
            </div>
            <h2 className="profile-name-modal">{user?.nombre}</h2>
            <div className="profile-info">
              <div className="profile-item">
                <div className="profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                  </svg>
                </div>
                <div className="profile-text">
                  <p className="profile-label-modal">Correo</p>
                  <p className="profile-value-modal">{user?.correo || 'No disponible'}</p>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
                </div>
                <div className="profile-text">
                  <p className="profile-label-modal">Teléfono</p>
                  <p className="profile-value-modal">{user?.telefono || 'No disponible'}</p>
                </div>
              </div>
            </div>
            <button className="logout-button-modal" onClick={() => {
              actions.setShowProfileModal(false);
              //  Limpiar localStorage al cerrar sesión
              actions.logout();
              navigate('/cap/cafe', { replace: true });
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      <Modal
        title="Programación Semanal"
        open={showPreviewModal && !!semanaPreview}
        onCancel={() => actions.setShowPreviewModal(false)}
        footer={null} centered width={900}
      >
        {semanaPreview && (
          <div className="dashboard-preview-content">
            <Card className="dashboard-preview-summary-card">
              <div className="dashboard-preview-summary-grid">
                <div>
                  <div className="dashboard-preview-label">Semana #</div>
                  <div className="dashboard-preview-value dashboard-preview-value--primary">{semanaPreview.numeroSemana}</div>
                </div>
                <div>
                  <div className="dashboard-preview-label">Período</div>
                  <div className="dashboard-preview-value">
                    {formatearRangoFechas(semanaPreview.fechaInicio, semanaPreview.fechaFin)}
                  </div>
                </div>
                <div>
                  <div className="dashboard-preview-label">Total de Horas</div>
                  <div className="dashboard-preview-value dashboard-preview-value--accent">
                    {semanaPreview.totalHoras.toFixed(1)}h
                  </div>
                </div>
              </div>
            </Card>
            {horariosDetalles.length > 0 && (
              <Table
                dataSource={horariosDetalles.map((h, i) => ({ ...h, key: i }))}
                columns={[
                  { title: 'Día',    dataIndex: 'fecha',    key: 'dia',   render: f => <strong>{getDiaSemana(f)}</strong> },
                  { title: 'Fecha',  dataIndex: 'fecha',    key: 'fecha', render: f => formatearFechaCompleta(f) },
                  { title: 'Actividad', dataIndex: 'actividad', key: 'actividad' },
                  {
                    title: 'Hora', key: 'hora',
                    render: (_, h) => h.horaInicio === '00:00:00'
                      ? <Tag color="orange">Todo el día</Tag>
                      : `${h.horaInicio.substring(0,5)} - ${h.horaFin.substring(0,5)}`,
                  },
                  { title: 'Punto de Venta', dataIndex: 'pdv', key: 'pdv' },
                ]}
                pagination={false} size="small" bordered
              />
            )}
            <div className="dashboard-preview-footer">
              Generado el {new Date().toLocaleDateString('es-CO')}
            </div>
          </div>
        )}
      </Modal>

      <DashboardEditModal
        open={modalEditar}
        formData={formDataModal}
        puntosVenta={puntosVenta}
        showMoreMotivos={showMoreMotivos}
        onClose={actions.cerrarModal}
        onSave={actions.guardarEdicion}
        onFieldChange={actions.fieldChange}
        onSelectMotivo={actions.selectMotivo}
        onToggleMotivos={() => actions.setShowMoreMotivos((prev) => !prev)}
      />
    </div>
  );
}

export default Dashboard;

