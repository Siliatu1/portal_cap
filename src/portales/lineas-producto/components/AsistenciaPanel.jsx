import { useMemo } from 'react';
import '../styles/admin_panel.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Input, Select, Space, Switch, Table } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { formatIsoDate } from './adminPanel.helpers';
import { useAsistenciaPanelController } from '../hooks/useAsistenciaPanelController';

const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';

function FotoCell({ cedula, fotosCache }) {
  const foto = fotosCache[cedula];

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
      <i className="bi bi-person-circle" />
    </div>
  );
}

function AsistenciaPanel() {
  const { user, permissions, data, filters, loading, actions } = useAsistenciaPanelController();

  const columns = useMemo(() => [
    {
      title: 'Foto',
      dataIndex: 'cedula',
      key: 'foto',
      width: 80,
      fixed: 'left',
      render: (cedula) => <FotoCell cedula={cedula} fotosCache={data.fotosCache} />,
    },
    { title: 'Cedula', dataIndex: 'cedula', key: 'cedula', width: 120 },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres', width: 200 },
    { title: 'Telefono', dataIndex: 'telefono', key: 'telefono', width: 120 },
    { title: 'Cargo', dataIndex: 'cargo', key: 'cargo', width: 150 },
    { title: 'Punto de Venta', dataIndex: 'puntoVenta', key: 'puntoVenta', width: 150 },
    { title: 'Nombre Lider', dataIndex: 'nombreLider', key: 'nombreLider', width: 180 },
    {
      title: 'Dia',
      dataIndex: 'dia',
      key: 'dia',
      width: 120,
      sorter: (a, b) => {
        if (!a.dia) return 1;
        if (!b.dia) return -1;
        return a.dia.localeCompare(b.dia);
      },
      defaultSortOrder: 'descend',
      render: formatIsoDate,
    },
    {
      title: 'Asistencia',
      key: 'asistencia',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Switch
          checked={record.asistencia === true}
          onChange={(checked) => actions.cambiarAsistencia(record.id, checked)}
          checkedChildren="Asistio"
          unCheckedChildren="No asistio"
          style={{
            backgroundColor: record.asistencia === null ? '#ebe18a' : (record.asistencia ? '#52c41a' : '#ff4d4f'),
          }}
        />
      ),
    },
  ], [actions, data.fotosCache]);

  if (!permissions.tieneAcceso) {
    return (
      <div className="acceso-denegado-container">
        <div className="acceso-denegado-card">
          <i className="bi bi-shield-x" />
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a este panel.</p>
          <p>Solo usuarios autorizados pueden controlar la asistencia de la Escuela del Cafe.</p>
          <button onClick={actions.logout} className="btn-volver">
            <i className="bi bi-arrow-left-circle" /> Volver
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
            <span className="header-subtitle">Control de Asistencia - Escuela del Cafe</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-back" onClick={actions.logout} title="Cerrar sesion">
            <i className="bi bi-box-arrow-right" />
            <span>Cerrar sesion</span>
          </button>
          <button className="btn-back" onClick={actions.volverMenu} title="Volver al inicio">
            <i className="bi bi-arrow-left" />
            <span>Volver</span>
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <h1 className="admin-title">Hola, {user.nombreUsuario}</h1>
          <h2 className="admin-subtitle">Control de Asistencia - Escuela del Cafe</h2>

          <div className="filters-container">
            <h3 className="filters-title">Filtros de Busqueda</h3>
            <Space wrap size="middle" style={{ width: '100%' }}>
              <Input
                placeholder="Buscar por cedula"
                prefix={<SearchOutlined />}
                value={filters.cedula}
                onChange={(event) => actions.updateFiltros({ cedula: event.target.value })}
                style={{ width: 200 }}
              />
              <Select
                placeholder="Punto de venta"
                allowClear
                showSearch
                value={filters.puntoVenta || undefined}
                onChange={(value) => actions.updateFiltros({ puntoVenta: value || '' })}
                style={{ width: 220 }}
                options={data.options.puntosVenta}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
              <Select
                placeholder="Filtrar por fecha"
                allowClear
                showSearch
                value={filters.fecha || undefined}
                onChange={(value) => actions.updateFiltros({ fecha: value || '' })}
                style={{ width: 180 }}
                options={data.options.fechas}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
              <Button onClick={actions.limpiarFiltros}>Limpiar</Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={actions.exportarExcel} style={{ background: '#9cbf8b' }}>
                Exportar a Excel
              </Button>
            </Space>
          </div>

          <div style={{ background: '#fff', borderRadius: 8, padding: 20, overflowX: 'auto' }}>
            <div style={{ marginBottom: 10 }}>
              <strong>Registros cargados:</strong> {data.inscripciones.length}, <strong>Filtrados:</strong> {data.dataFiltrada.length}
            </div>
            <Table
              columns={columns}
              dataSource={data.dataFiltrada}
              loading={loading.inscripciones}
              rowKey={(record, index) => record.id || record.cedula || `row-${index}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} inscripciones`,
              }}
              scroll={{ x: 1500 }}
              locale={{ emptyText: 'No hay inscripciones registradas' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AsistenciaPanel;
