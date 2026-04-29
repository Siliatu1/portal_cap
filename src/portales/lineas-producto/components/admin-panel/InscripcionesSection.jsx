import { useMemo } from 'react';
import { Button, Input, Select, Space } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { formatIsoDate } from '../adminPanel.helpers';
import { buildColumnsInscripciones } from './AdminPanelColumns';
import TableShell from './TableShell';

function InscripcionesSection({
  data,
  filtros,
  options,
  fotosCache,
  loading,
  puedeEliminar,
  onActions,
}) {
  const columns = useMemo(
    () => buildColumnsInscripciones({
      fotosCache,
      puedeEliminar,
      onEliminar: onActions.eliminarInscripcion,
    }),
    [fotosCache, onActions.eliminarInscripcion, puedeEliminar]
  );

  return (
    <>
      <div className="filters-container">
        <h3 className="filters-title">FILTROS DE BUSQUEDA</h3>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Buscar por cedula..."
            prefix={<SearchOutlined />}
            value={filtros.cedula}
            onChange={(event) => onActions.updateFiltros({ cedula: event.target.value })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Punto de venta"
            allowClear
            showSearch
            value={filtros.puntoVenta || undefined}
            onChange={(value) => onActions.updateFiltros({ puntoVenta: value || '' })}
            style={{ width: 220 }}
            filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
          >
            {options.puntosVentaInscripciones.map((pdv) => (
              <Select.Option key={pdv} value={pdv}>{pdv}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por fecha"
            allowClear
            showSearch
            value={filtros.fecha || undefined}
            onChange={(value) => onActions.updateFiltros({ fecha: value || '' })}
            style={{ width: 180 }}
          >
            {options.fechasInscripciones.map((fecha) => (
              <Select.Option key={fecha} value={fecha}>{formatIsoDate(fecha)}</Select.Option>
            ))}
          </Select>
          <Button onClick={onActions.limpiarFiltros}>Limpiar</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={onActions.exportarInscripciones}
            style={{ background: '#52B788', borderColor: '#52B788' }}
          >
            Exportar a Excel
          </Button>
        </Space>
      </div>

      <TableShell
        title="Inscripciones Escuela del Cafe"
        total={data.inscripciones.length}
        filteredTotal={data.dataFiltrada.length}
        onRefresh={onActions.refreshInscripciones}
        columns={columns}
        dataSource={data.dataFiltrada}
        loading={loading}
        rowKey={(record) => record.id || `${record.cedula}-${record.dia}`}
        totalLabel="inscripciones"
        emptyText="No hay inscripciones registradas"
      />
    </>
  );
}

export default InscripcionesSection;
