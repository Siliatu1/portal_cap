import { useMemo } from 'react';
import '../styles/panel_toderas.css';
import { Button, Input, Modal, Switch, Table } from 'antd';
import { Download, Search, User, AlertTriangle, ArrowLeftCircle, Info, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { formatIsoDate } from './adminPanel.helpers';
import { usePanelToderasController } from '../hooks/usePanelToderasController';

const { TextArea } = Input;
const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';

function FotoCell({ foto }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt="Foto"
        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3d2817' }}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = placeholderSvg;
        }}
      />
    );
  }

  return (
    <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#999' }}>
      <User size={24} color="#999" />
    </div>
  );
}

function FechaAlertaCell({ dia, record }) {
  const fechaInscripcion = dia ? new Date(dia) : null;
  const hoy = new Date();
  const diasTranscurridos = fechaInscripcion && !Number.isNaN(fechaInscripcion.getTime())
    ? Math.floor((hoy - fechaInscripcion) / (1000 * 60 * 60 * 24))
    : 0;
  const esAlerta = diasTranscurridos >= 15 && record.evaluado !== true;

  return (
    <span
      className={esAlerta ? 'fecha-alerta' : ''}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        display: 'inline-block',
        fontWeight: esAlerta ? 600 : 400,
        backgroundColor: esAlerta ? '#ff4d4f' : 'transparent',
        color: esAlerta ? '#ffffff' : '#333',
        border: esAlerta ? '2px solid #ff1f1f' : 'none',
        animation: esAlerta ? 'pulso-alerta 1.5s infinite' : 'none',
      }}
      title={esAlerta ? `Han pasado ${diasTranscurridos} dias sin evaluar` : ''}
    >
      {formatIsoDate(dia) || 'Sin fecha'}
      {esAlerta && <AlertTriangle size={12} style={{ marginLeft: 6, display: 'inline' }} />}
    </span>
  );
}

function PanelToderas() {
  const { user, permissions, data, filters, modal, loading, actions } = usePanelToderasController();

  const columns = useMemo(() => [
    {
      title: 'Foto',
      dataIndex: 'foto',
      key: 'foto',
      width: 80,
      fixed: 'left',
      render: (foto) => <FotoCell foto={foto} />,
    },
    { title: 'Cedula', dataIndex: 'cedula', key: 'cedula', width: 120 },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres', width: 200 },
    { title: 'Telefono', dataIndex: 'telefono', key: 'telefono', width: 120 },
    {
      title: 'Cargo a Evaluar',
      dataIndex: 'cargoEvaluar',
      key: 'cargoEvaluar',
      width: 170,
      render: (_, record) => record.cargoEvaluar || record.cargo || 'Sin definir',
    },
    { title: 'Punto de Venta', dataIndex: 'puntoVenta', key: 'puntoVenta', width: 150 },
    { title: 'Nombre Lider', dataIndex: 'nombreLider', key: 'nombreLider', width: 180 },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 130,
      render: (categoria) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 15,
            backgroundColor: categoria === 'Novata' ? '#fff7e6' : '#e6f7ff',
            color: categoria === 'Novata' ? '#d46b08' : '#0958d9',
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {categoria || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Fecha Inscripcion',
      dataIndex: 'dia',
      key: 'fechaInscripcion',
      width: 140,
      render: (dia, record) => <FechaAlertaCell dia={dia} record={record} />,
    },
    {
      title: 'Estado',
      key: 'evaluado',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Switch
          checked={record.evaluado === true}
          onChange={(checked) => actions.cambiarEvaluacion(record.id, checked)}
          checkedChildren="Evaluado"
          unCheckedChildren="No evaluado"
          style={{
            backgroundColor: record.evaluado === null ? '#ebe18a' : (record.evaluado ? '#52c41a' : '#ff4d4f'),
          }}
        />
      ),
    },
    {
      title: 'Observacion',
      key: 'observacion',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type={record.observacion ? 'primary' : 'default'}
          icon={record.observacion ? <MessageCircle size={16} /> : <MessageCircle size={16} />}
          onClick={() => actions.abrirModalObservacion(record)}
          style={{
            backgroundColor: record.observacion ? '#3d2817' : undefined,
            borderColor: record.observacion ? '#3d2817' : undefined,
          }}
        >
          {record.observacion ? 'Ver/Editar' : 'Agregar'}
        </Button>
      ),
    },
  ], [actions]);

  if (!permissions.tieneAcceso) {
    return (
      <div className="acceso-denegado-container">
        <div className="acceso-denegado-card">
          <AlertCircle size={48} />
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a este panel.</p>
          <p>Solo instructoras autorizadas pueden controlar la asistencia de la evaluacion todera.</p>
          <button onClick={actions.logout} className="btn-volver">
            <ArrowLeftCircle size={20} /> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <div className="header-titles">
            <span className="header-logo-text">PANEL LINEAS DE PRODUCTO C&W</span>
            <span className="header-subtitle">Control de Evaluaciones - Toderas</span>
          </div>
        </div>

        <div className="header-right">
          <Button onClick={actions.volverMenu} size="large" style={{ backgroundColor: '#ffffff44', borderColor: '#3d2817', color: '#1b1b1b', fontWeight: 600 }}>
            Volver
          </Button>
          <Button onClick={actions.logout} size="large" style={{ backgroundColor: '#ffffff44', borderColor: '#3d2817', color: '#1b1b1b', fontWeight: 600 }}>
            Cerrar sesion
          </Button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <h1 className="admin-title">Hola, {user.nombreUsuario}</h1>
          <h2 className="admin-subtitle">Panel Lineas de Producto C&W</h2>
          <p className="admin-info" style={{ backgroundColor: '#fff7e6', padding: '12px 20px', borderRadius: 8, border: '1px solid #ffd591', marginBottom: 20, color: '#d46b08' }}>
            <Info size={16} style={{ marginRight: 8, display: 'inline' }} />
            Mostrando solo tus estudiantes asignados
          </p>

          <div className="filters-container">
            <h3 className="filters-title">FILTROS DE BUSQUEDA</h3>
            <div className="filters-grid">
              <div className="filter-item">
                <label className="filter-label">Cedula</label>
                <Input
                  placeholder="Buscar por cedula"
                  prefix={<Search size={16} />}
                  value={filters.cedula}
                  onChange={(event) => actions.updateFiltros({ cedula: event.target.value })}
                  allowClear
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">Punto de Venta</label>
                <Input
                  placeholder="Buscar por punto de venta"
                  prefix={<Search size={16} />}
                  value={filters.puntoVenta}
                  onChange={(event) => actions.updateFiltros({ puntoVenta: event.target.value })}
                  allowClear
                />
              </div>
            </div>

            <div className="filters-actions">
              <Button onClick={actions.limpiarFiltros} icon={<XCircle size={16} />}>
                Limpiar Filtros
              </Button>
              <Button type="primary" icon={<Download size={16} />} onClick={actions.exportarExcel} style={{ backgroundColor: '#52B788', borderColor: '#52B788' }}>
                Exportar Excel
              </Button>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <div className="table-title">
                <div className="table-icon">
                  <CheckCircle2 size={20} />
                </div>
                <strong>Evaluacion Todera</strong>
              </div>
              <span className="table-count">
                Total General: {data.estadisticas.totalInscritos} | Tus Estudiantes: {data.dataFiltrada.length}
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={data.dataFiltrada}
              loading={loading.evaluaciones}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
              }}
              scroll={{ x: 1500, y: 500 }}
            />
          </div>
        </div>
      </main>

      <Modal
        title="Observaciones"
        open={modal.modalVisible}
        onOk={actions.guardarObservacion}
        onCancel={actions.cerrarModalObservacion}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        {modal.registroSeleccionado && (
          <div style={{ marginBottom: 15 }}>
            <strong>Estudiante:</strong> {modal.registroSeleccionado.nombres}<br />
            <strong>Cedula:</strong> {modal.registroSeleccionado.cedula}
          </div>
        )}
        <TextArea
          rows={4}
          value={modal.observacionActual}
          onChange={(event) => actions.updateObservacion(event.target.value)}
          placeholder="Escriba sus observaciones aqui..."
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
}

export default PanelToderas;


