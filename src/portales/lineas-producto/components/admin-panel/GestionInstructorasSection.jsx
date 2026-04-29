import { useMemo } from 'react';
import { Button, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { buildColumnsGestionInstructoras } from './AdminPanelColumns';
import TableShell from './TableShell';

function GestionInstructorasSection({
  data,
  filtros,
  loading,
  onActions,
}) {
  const columns = useMemo(
    () => buildColumnsGestionInstructoras({
      onAgregar: onActions.abrirModalGestionInstructoras,
      onEliminar: onActions.eliminarInstructoraDePuntoVenta,
    }),
    [onActions.abrirModalGestionInstructoras, onActions.eliminarInstructoraDePuntoVenta]
  );

  return (
    <>
      <div className="filters-container">
        <h3 className="filters-title">GESTION DE INSTRUCTORAS</h3>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Buscar punto de venta..."
            prefix={<SearchOutlined />}
            value={filtros.puntoVenta}
            onChange={(event) => onActions.updateFiltrosGestion({ puntoVenta: event.target.value })}
            style={{ width: 280 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onActions.abrirModalNuevaInstructora}
            style={{ background: '#52B788', borderColor: '#52B788' }}
          >
            Agregar instructora
          </Button>

          <Button onClick={onActions.limpiarFiltrosGestionInstructoras}>Limpiar</Button>
        </Space>
      </div>

      <TableShell
        title="Gestion Instructoras"
        total={data.gestionInstructoras.length}
        filteredTotal={data.dataFiltradaGestionInstructoras.length}
        onRefresh={onActions.refreshGestionInstructoras}
        columns={columns}
        dataSource={data.dataFiltradaGestionInstructoras}
        loading={loading}
        rowKey={(record) => record.key}
        totalLabel="registros"
        emptyText="No hay asignaciones de instructoras registradas"
        scrollX={1200}
      />
    </>
  );
}

export default GestionInstructorasSection;
