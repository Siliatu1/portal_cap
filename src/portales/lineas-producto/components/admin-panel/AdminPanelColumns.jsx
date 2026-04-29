import { Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ROLES_VER_ESTADO_OBS, formatIsoDate } from '../adminPanel.helpers';

const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';

function FotoCell({ cedula, fotosCache }) {
  const foto = fotosCache[cedula];

  if (foto) {
    return (
      <img
        src={foto}
        alt="Foto"
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #3d2817',
        }}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = placeholderSvg;
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        color: '#999',
      }}
    >
      <i className="bi bi-person-circle" />
    </div>
  );
}

function FechaToderaCell({ text, record }) {
  if (!text) return '';

  const fechaInscripcion = new Date(text);
  const hoy = new Date();
  const diasTranscurridos = Number.isNaN(fechaInscripcion.getTime())
    ? 0
    : Math.floor((hoy - fechaInscripcion) / (1000 * 60 * 60 * 24));
  const esAlerta = diasTranscurridos >= 15 && record.evaluado !== true;

  return (
    <span
      className={esAlerta ? 'fecha-alerta-admin' : ''}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        display: 'inline-block',
        fontWeight: esAlerta ? 600 : 400,
        backgroundColor: esAlerta ? '#ff4d4f' : 'transparent',
        color: esAlerta ? '#ffffff' : '#333',
        border: esAlerta ? '2px solid #ff1f1f' : 'none',
      }}
      title={esAlerta ? `Han pasado ${diasTranscurridos} dias sin evaluar` : ''}
    >
      {formatIsoDate(text)}
      {esAlerta && (
        <i className="bi bi-exclamation-triangle-fill" style={{ marginLeft: 6, fontSize: 12 }} />
      )}
    </span>
  );
}

function AsistenciaCell({ asistencia }) {
  if (asistencia === null) return <span style={{ color: '#a8a26a' }}>Pendiente</span>;
  if (asistencia === true) return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Asistio</span>;
  return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>No asistio</span>;
}

function EstadoCell({ evaluado }) {
  if (evaluado === null) return <span style={{ color: '#a8a26a' }}>Pendiente</span>;
  if (evaluado === true) return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Evaluado</span>;
  return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>No evaluado</span>;
}

function CategoriaCell({ text }) {
  const categorias = {
    sal: { text: 'SAL', color: '#8B4513' },
    dulce: { text: 'DULCE', color: '#B83280' },
    bebidas: { text: 'BEBIDAS', color: '#2563EB' },
    brunch: { text: 'BRUNCH', color: '#5A3E2B' },
  };
  const categoria = categorias[String(text || '').toLowerCase()] || { text, color: '#666' };
  return <span style={{ color: categoria.color, fontWeight: 'bold' }}>{categoria.text}</span>;
}

function InstructoraCell({ text }) {
  return (
    <span
      style={{
        backgroundColor: '#fff7e6',
        color: '#d46b08',
        padding: '4px 12px',
        borderRadius: 12,
        fontWeight: 500,
        fontSize: 12,
        display: 'inline-block',
      }}
    >
      {text || 'Sin asignar'}
    </span>
  );
}

function CategoriaGestionCell({ asignacion, pdvId, categoria, onAgregar, onEliminar }) {
  if (!asignacion) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => onAgregar(pdvId, categoria)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 500, color: '#2c3e50', fontSize: 13 }}>{asignacion.instructoraNombre}</span>
      <Popconfirm
        title="Eliminar?"
        description="Se quitara de este PDV."
        onConfirm={() => onEliminar(pdvId, asignacion.instructoraId)}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <Button danger size="small" icon={<DeleteOutlined />} style={{ padding: '4px 8px', minWidth: 'auto' }} />
      </Popconfirm>
    </div>
  );
}

export function buildColumnsInscripciones({ fotosCache, puedeEliminar, onEliminar }) {
  return [
    {
      title: 'Foto',
      dataIndex: 'cedula',
      key: 'foto',
      width: 80,
      fixed: 'left',
      render: (cedula) => <FotoCell cedula={cedula} fotosCache={fotosCache} />,
    },
    { title: 'Cedula', dataIndex: 'cedula', key: 'cedula', width: 120 },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres', width: 200 },
    { title: 'Telefono', dataIndex: 'telefono', key: 'telefono', width: 120 },
    {
      title: 'Cargo a Evaluar',
      dataIndex: 'cargoEvaluar',
      key: 'cargoEvaluar',
      width: 200,
      render: (_, record) => record.cargoEvaluar || record.cargo || 'Sin definir',
    },
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
      dataIndex: 'asistencia',
      key: 'asistencia',
      width: 120,
      render: (asistencia) => <AsistenciaCell asistencia={asistencia} />,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {puedeEliminar() && (
            <Popconfirm
              title="Esta seguro de eliminar esta inscripcion?"
              description="Esta accion no se puede deshacer."
              onConfirm={() => onEliminar(record.id)}
              okText="Si, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small" title="Eliminar" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
}

export function buildColumnsTodera({ fotosCache, puedeEliminar, onEliminar, cargoUsuarioActual }) {
  const columnsBase = [
    {
      title: 'Foto',
      dataIndex: 'cedula',
      key: 'foto',
      width: 80,
      fixed: 'left',
      render: (cedula) => <FotoCell cedula={cedula} fotosCache={fotosCache} />,
    },
    { title: 'Cedula', dataIndex: 'cedula', key: 'cedula', width: 120 },
    { title: 'Nombres', dataIndex: 'nombres', key: 'nombres', width: 200 },
    { title: 'Telefono', dataIndex: 'telefono', key: 'telefono', width: 120 },
    {
      title: 'Cargo a Evaluar',
      dataIndex: 'cargoEvaluar',
      key: 'cargoEvaluar',
      width: 180,
      render: (_, record) => record.cargoEvaluar || record.cargo || 'Sin definir',
    },
    { title: 'Punto de Venta', dataIndex: 'puntoVenta', key: 'puntoVenta', width: 150 },
    {
      title: 'Instructora',
      dataIndex: 'nombreLider',
      key: 'nombreLider',
      width: 180,
      render: (text) => <InstructoraCell text={text} />,
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 120,
      render: (text) => <CategoriaCell text={text} />,
    },
    {
      title: 'Dia Inscripcion',
      dataIndex: 'dia',
      key: 'dia',
      width: 140,
      sorter: (a, b) => {
        if (!a.dia) return 1;
        if (!b.dia) return -1;
        return a.dia.localeCompare(b.dia);
      },
      defaultSortOrder: 'descend',
      render: (text, record) => <FechaToderaCell text={text} record={record} />,
    },
  ];

  const columnasAdicionales = ROLES_VER_ESTADO_OBS.includes(cargoUsuarioActual)
    ? [
        {
          title: 'Estado',
          dataIndex: 'evaluado',
          key: 'estado',
          width: 120,
          render: (evaluado) => <EstadoCell evaluado={evaluado} />,
        },
        {
          title: 'Observacion',
          dataIndex: 'observacion',
          key: 'observacion',
          width: 180,
          render: (obs) => (obs ? <span style={{ color: '#3d2817' }}>{obs}</span> : <span style={{ color: '#bbb' }}>Sin observacion</span>),
        },
      ]
    : [];

  return [
    ...columnsBase,
    ...columnasAdicionales,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {puedeEliminar() && (
            <Popconfirm
              title="Esta seguro de eliminar esta evaluacion?"
              description="Esta accion no se puede deshacer."
              onConfirm={() => onEliminar(record.id)}
              okText="Si, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small" title="Eliminar" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
}

export function buildColumnsGestionInstructoras({ onAgregar, onEliminar }) {
  return [
    {
      title: 'Punto de Venta',
      dataIndex: 'puntoVenta',
      key: 'puntoVenta',
      width: 200,
      sorter: (a, b) => (a.puntoVenta || '').localeCompare(b.puntoVenta || ''),
    },
    {
      title: <span style={{ color: '#2f6b17', fontWeight: 'bold' }}>SAL</span>,
      dataIndex: 'sal',
      key: 'sal',
      width: 200,
      render: (sal, record) => (
        <CategoriaGestionCell asignacion={sal} pdvId={record.pdvId} categoria="SAL" onAgregar={onAgregar} onEliminar={onEliminar} />
      ),
    },
    {
      title: <span style={{ color: '#2b627a', fontWeight: 'bold' }}>DULCE</span>,
      dataIndex: 'dulce',
      key: 'dulce',
      width: 200,
      render: (dulce, record) => (
        <CategoriaGestionCell asignacion={dulce} pdvId={record.pdvId} categoria="DULCE" onAgregar={onAgregar} onEliminar={onEliminar} />
      ),
    },
    {
      title: <span style={{ color: '#6b5600', fontWeight: 'bold' }}>BEBIDAS</span>,
      dataIndex: 'bebidas',
      key: 'bebidas',
      width: 200,
      render: (bebidas, record) => (
        <CategoriaGestionCell asignacion={bebidas} pdvId={record.pdvId} categoria="BEBIDAS" onAgregar={onAgregar} onEliminar={onEliminar} />
      ),
    },
    {
      title: <span style={{ color: '#6b4d3a', fontWeight: 'bold' }}>BRUNCH</span>,
      dataIndex: 'brunch',
      key: 'brunch',
      width: 200,
      render: (brunch, record) => (
        <CategoriaGestionCell asignacion={brunch} pdvId={record.pdvId} categoria="BRUNCH" onAgregar={onAgregar} onEliminar={onEliminar} />
      ),
    },
  ];
}
