import { useMemo } from 'react';
import { Button, Input, Select, Space } from 'antd';
import { Download, Search, Filter, CheckCircle2 } from 'lucide-react';
import { formatIsoDate } from '../adminPanel.helpers';
import { buildColumnsTodera } from './AdminPanelColumns';
import TableShell from './TableShell';

function ToderaSection({
  data,
  filtros,
  options,
  fotosCache,
  loading,
  puedeEliminar,
  puedeVerFiltroInstructora,
  cargoUsuario,
  onActions,
}) {
  const columns = useMemo(
    () => buildColumnsTodera({
      fotosCache,
      puedeEliminar,
      onEliminar: onActions.eliminarTodera,
      cargoUsuarioActual: cargoUsuario,
    }),
    [cargoUsuario, fotosCache, onActions.eliminarTodera, puedeEliminar]
  );

  return (
    <>
      <div className="filters-container">
        <h3 className="filters-title">
          <Filter size={16} /> FILTROS EVALUACIONES TODERA
        </h3>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Buscar por cedula..."
            prefix={<Search size={16} />}
            value={filtros.cedula}
            onChange={(event) => onActions.updateFiltrosTodera({ cedula: event.target.value })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Punto de venta"
            allowClear
            showSearch
            value={filtros.puntoVenta || undefined}
            onChange={(value) => onActions.updateFiltrosTodera({ puntoVenta: value || '' })}
            style={{ width: 220 }}
            filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
          >
            {options.puntosVentaTodera.map((pdv) => (
              <Select.Option key={pdv} value={pdv}>{pdv}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por fecha"
            allowClear
            showSearch
            value={filtros.fecha || undefined}
            onChange={(value) => onActions.updateFiltrosTodera({ fecha: value || '' })}
            style={{ width: 180 }}
          >
            {options.fechasTodera.map((fecha) => (
              <Select.Option key={fecha} value={fecha}>{formatIsoDate(fecha)}</Select.Option>
            ))}
          </Select>
          {puedeVerFiltroInstructora && (
            <Select
              placeholder="Seleccionar instructora"
              allowClear
              showSearch
              value={filtros.instructora || undefined}
              onChange={(value) => onActions.updateFiltrosTodera({ instructora: value || '' })}
              style={{ width: 220 }}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {options.instructorasTodera.map((instructora) => (
                <Select.Option key={instructora} value={instructora}>{instructora}</Select.Option>
              ))}
            </Select>
          )}
          <Button onClick={onActions.limpiarFiltrosTodera}>Limpiar</Button>
          <Button
            type="primary"
            icon={<Download size={16} />}
            onClick={onActions.exportarTodera}
            style={{ background: '#52B788', borderColor: '#52B788' }}
          >
            Exportar a Excel
          </Button>
        </Space>
      </div>

      <TableShell
        title="Evaluaciones Todera"
        icon={<CheckCircle2 size={20} />}
        total={data.inscripcionesTodera.length}
        filteredTotal={data.dataFiltradaTodera.length}
        onRefresh={onActions.refreshTodera}
        columns={columns}
        dataSource={data.dataFiltradaTodera}
        loading={loading}
        rowKey={(record) => record.id || `${record.cedula}-${record.dia}`}
        totalLabel="evaluaciones"
        emptyText="No hay evaluaciones registradas"
      />
    </>
  );
}

export default ToderaSection;


