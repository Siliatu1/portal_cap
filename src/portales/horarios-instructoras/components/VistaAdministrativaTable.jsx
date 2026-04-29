import { Button, Empty, Table } from 'antd';
import { Edit } from 'lucide-react';
import { DIAS_NOMBRES, ROW_COLORS } from './vistaAdministrativa.helpers';

function VistaAdministrativaTable({ dataSource, fechasSemana, onEditHorario }) {
  const columns = [
    {
      title: 'No.',
      dataIndex: 'numero',
      key: 'numero',
      fixed: 'left',
      width: 55,
      align: 'center',
      onHeaderCell: () => ({ style: { background: '#6B4E3D', color: 'white', textAlign: 'center' } }),
    },
    {
      title: 'NOMBRE INSTRUCTORA',
      dataIndex: 'nombre',
      key: 'nombre',
      fixed: 'left',
      width: 230,
      onHeaderCell: () => ({ style: { background: '#6B4E3D', color: 'white' } }),
    },
  ];

  fechasSemana.forEach((fecha) => {
    const ts = fecha.getTime();
    const dayKey = `day_${ts}`;
    const diaNombre = DIAS_NOMBRES[fecha.getDay()];
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yyyy = fecha.getFullYear();

    columns.push({
      title: `${diaNombre} ${dd}/${mm}/${yyyy}`,
      key: dayKey,
      align: 'center',
      onHeaderCell: () => ({ className: 'vista-admin-day-header' }),
      children: [
        {
          title: 'PDV',
          dataIndex: `${dayKey}_pdv`,
          key: `${dayKey}_pdv`,
          width: 130,
          onHeaderCell: () => ({ className: 'vista-admin-subheader' }),
          render: (text) => <span className="vista-admin-cell-text">{text || ''}</span>,
        },
        {
          title: 'Motivo',
          dataIndex: `${dayKey}_motivo`,
          key: `${dayKey}_motivo`,
          width: 150,
          onHeaderCell: () => ({ className: 'vista-admin-subheader' }),
          render: (text, record) => {
            if (!text) return '';

            const horario = record[`${dayKey}_horario`];
            return (
              <div className="vista-admin-motivo-cell">
                <span className="vista-admin-cell-text vista-admin-motivo-text">{text}</span>
                {horario && (
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit size={16} />}
                    onClick={() => onEditHorario(horario)}
                    className="vista-admin-edit-button"
                  />
                )}
              </div>
            );
          },
        },
        {
          title: 'Horario',
          dataIndex: `${dayKey}_horario_text`,
          key: `${dayKey}_horario_text`,
          width: 100,
          onHeaderCell: () => ({ className: 'vista-admin-subheader' }),
          render: (text) => <span className="vista-admin-time-text">{text || ''}</span>,
        },
      ],
    });
  });

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      scroll={{ x: 'max-content', y: 580 }}
      bordered
      size="small"
      onRow={(record) => ({
        className: `vista-admin-row vista-admin-row--${record.rowIndex % ROW_COLORS.length}`
      })}
      locale={{
        emptyText: <Empty description="No hay horarios programados para mostrar" />,
      }}
    />
  );
}

export default VistaAdministrativaTable;

