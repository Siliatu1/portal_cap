import { Table } from 'antd';

const refreshButtonStyle = {
  marginLeft: 12,
  background: '#6f4e3700',
  border: 'none',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 1px 4px #0001',
  transition: 'background 0.2s',
};

function TableShell({
  title,
  iconClass,
  total,
  filteredTotal,
  onRefresh,
  columns,
  dataSource,
  loading,
  rowKey,
  totalLabel,
  emptyText,
  scrollX = 1500,
}) {
  return (
    <div className="table-card">
      <div className="table-header">
        <div className="table-title">
          {iconClass && (
            <div className="table-icon">
              <i className={iconClass} />
            </div>
          )}
          <strong>{title}</strong>
          <button onClick={onRefresh} style={refreshButtonStyle} title="Refrescar">
            <i className="bi bi-arrow-clockwise" style={{ color: '#6F4E37', fontSize: 18 }} />
          </button>
        </div>
        <span className="table-count">
          Registros {total} | Filtrados {filteredTotal}
        </span>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource || []}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (value) => `Total ${value} ${totalLabel}`,
        }}
        scroll={{ x: scrollX }}
        locale={{ emptyText }}
      />
    </div>
  );
}

export default TableShell;
