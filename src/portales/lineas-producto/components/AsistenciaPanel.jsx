import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import "../styles/admin_panel.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Table, Input, Button, Space, message, Select, Switch } from "antd";
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { getCapCafes, updateCapCafe } from '../../../services/apiService';
import { fetchBukEmpleadoByDocumento } from '../../../services/bukEmpleadosQuery';
import { useAuth } from '../../../shared/context/AuthContext';

const AsistenciaPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData, logout } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    cedula: '',
    puntoVenta: '',
    fecha: ''
  });
  const [dataFiltrada, setDataFiltrada] = useState([]);
  const [fotosCache, setFotosCache] = useState({});

  // Documento autorizado para este panel
  const documentoAutorizado = '35512822';
  const normalizarDocumento = (valor) => String(valor || '').replace(/\D/g, '');
  const datosUsuario = userData?.data || userData || {};

  const nombreUsuario = datosUsuario?.nombre || '';

  const documentoUsuario = datosUsuario?.document_number || '';

  // Verificar si el usuario tiene acceso
  const tieneAcceso = normalizarDocumento(documentoUsuario) === normalizarDocumento(documentoAutorizado);

  const cargarInscripciones = async () => {
    setLoading(true);
    try {
      const result = await getCapCafes();

      let dataArray = [];
      if (result && Array.isArray(result.data)) {
        dataArray = result.data.map(item => {
          const mapped = {
            id: item.id,
            cedula: item.attributes?.documento || '',
            nombres: item.attributes?.nombre || '',
            telefono: item.attributes?.telefono || '',
            cargo: item.attributes?.cargo || '',
            puntoVenta: item.attributes?.pdv || '',
            dia: item.attributes?.fecha || '',
            coordinadora: item.attributes?.coordinadora || '',
            nombreLider: item.attributes?.lider || '',
            tipoFormulario: item.attributes?.tipo_formulario || '',
            asistencia: item.attributes?.confirmado ?? null
          };
          return mapped;
        });
      }

      setInscripciones(dataArray);
      setDataFiltrada(dataArray);
    } catch (error) {
      setInscripciones([]);
      setDataFiltrada([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tieneAcceso) {
      cargarInscripciones();
    }
  }, [tieneAcceso]);

  // Función para cargar foto de empleado desde API de BUK
  const cargarFotoEmpleado = async (cedula) => {
    if (!cedula || fotosCache[cedula]) return fotosCache[cedula];
    
    try {
      const empleado = await fetchBukEmpleadoByDocumento(queryClient, cedula);
      const foto = empleado?.foto || '';
      setFotosCache(prev => ({ ...prev, [cedula]: foto }));
      return foto;
    } catch (error) {
      console.error('Error al cargar foto:', error);
    }
    return '';
  };

  
  const handleCambiarAsistencia = async (id, nuevoEstado) => {
    try {
      await updateCapCafe(id, {
        data: {
          confirmado: nuevoEstado
        }
      });

      message.success(`Asistencia actualizada: ${nuevoEstado ? 'Asistió' : 'No asistió'}`);
      cargarInscripciones();
    } catch (error) {
      message.error('Error al actualizar la asistencia');
    }
  };

  const aplicarFiltros = () => {
    let dataTemp = [...inscripciones];

    if (filtros.cedula) {
      dataTemp = dataTemp.filter(item => 
        item.cedula && item.cedula.toString().includes(filtros.cedula)
      );
    }

    if (filtros.puntoVenta) {
      dataTemp = dataTemp.filter(item => 
        item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtros.puntoVenta.toLowerCase())
      );
    }

    if (filtros.fecha) {
      dataTemp = dataTemp.filter(item => 
        item.dia && item.dia === filtros.fecha
      );
    }

    setDataFiltrada(dataTemp);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, inscripciones]);

  const limpiarFiltros = () => {
    setFiltros({ cedula: '', puntoVenta: '', fecha: '' });
  };

  const exportarExcel = () => {
    if (dataFiltrada.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const datosExportar = dataFiltrada.map((item, index) => ({
      'No.': index + 1,
      'Cédula': item.cedula || '',
      'Nombres': item.nombres || '',
      'Teléfono': item.telefono || '',
      'Cargo': item.cargo || '',
      'Punto de Venta': item.puntoVenta || '',
      'Nombre Líder': item.nombreLider || '',
      'Día': item.dia || '',
      'Asistencia': item.asistencia === null ? 'Pendiente' : (item.asistencia ? 'Asistió' : 'No asistió')
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');
    XLSX.writeFile(wb, `Inscripciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Archivo Excel exportado exitosamente');
  };

  const opcionesPuntoVenta = [...new Set(inscripciones.map(item => item.puntoVenta).filter(Boolean))]
    .sort()
    .map((pdv) => ({
      label: pdv,
      value: pdv,
    }));

  const opcionesFecha = [...new Set(inscripciones.map(item => item.dia).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .map((fecha) => {
      const [year, month, day] = fecha.split('-');
      return {
        label: `${day}/${month}/${year}`,
        value: fecha,
      };
    });

  const columns = [
    {
      title: 'Foto',
      dataIndex: 'cedula',
      key: 'foto',
      width: 80,
      fixed: 'left',
      render: (cedula) => {
        const foto = fotosCache[cedula];
        return foto ? (
          <img 
            src={foto} 
            alt="Foto" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid #3d2817'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';
            }}
          />
        ) : (
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#999'
          }}>
            <i className="bi bi-person-circle"></i>
          </div>
        );
      }
    },
    {
      title: 'Cédula',
      dataIndex: 'cedula',
      key: 'cedula',
      width: 120,
    },
    {
      title: 'Nombres',
      dataIndex: 'nombres',
      key: 'nombres',
      width: 200,
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 120,
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      width: 150,
    },
    {
      title: 'Punto de Venta',
      dataIndex: 'puntoVenta',
      key: 'puntoVenta',
      width: 150,
    },
    {
      title: 'Nombre Líder',
      dataIndex: 'nombreLider',
      key: 'nombreLider',
      width: 180,
    },
    {
      title: 'Día',
      dataIndex: 'dia',
      key: 'dia',
      width: 120,
      sorter: (a, b) => {
        if (!a.dia) return 1;
        if (!b.dia) return -1;
        return a.dia.localeCompare(b.dia);
      },
      defaultSortOrder: 'descend',
      render: (text) => {
        if (!text) return '';
        const [year, month, day] = text.split('-');
        return `${day}/${month}/${year}`;
      }
    },
    {
      title: 'Asistencia',
      key: 'asistencia',
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        const estadoAsistencia = record.asistencia;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={estadoAsistencia === true}
              onChange={(checked) => handleCambiarAsistencia(record.id, checked)}
              checkedChildren="Asistió"
              unCheckedChildren="No asistió"
              style={{
                backgroundColor: estadoAsistencia === null ? '#ebe18a' : (estadoAsistencia ? '#52c41a' : '#ff4d4f')
              }}
            />
          </div>
        );
      },
    }
  ];

  if (!tieneAcceso) {
    return (
      <div className="acceso-denegado-container">
        <div className="acceso-denegado-card">
          <i className="bi bi-shield-x"></i>
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a este panel.</p>
          <p>Solo usuarios autorizados pueden controlar la asistencia de la Escuela del Café.</p>
          <button onClick={logout} className="btn-volver">
            <i className="bi bi-arrow-left-circle"></i> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header Superior */}
      <header className="admin-header">
        <div className="header-left">
          <div className="header-titles">
            <span className="header-logo-text">PANEL LÍNEAS DE PRODUCTO C&W</span>
            <span className="header-subtitle">Control de Asistencia - Escuela del Café</span>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn-back"
            onClick={logout}
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Cerrar sesión</span>
          </button>
          <button 
            className="btn-back"
            onClick={() => navigate('/menu')}
            title="Volver al inicio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Volver</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="admin-main">
        <div className="admin-content">
          <h1 className="admin-title">Hola, {nombreUsuario}</h1>
          <h2 className="admin-subtitle">Control de Asistencia - Escuela del Café</h2>

          {/* Filtros */}
          <div className="filters-container">
            <h3 className="filters-title">Filtros de Búsqueda</h3>
            <Space wrap size="middle" style={{ width: '100%' }}>
              <Input
                placeholder="Buscar por cédula"
                prefix={<SearchOutlined />}
                value={filtros.cedula}
                onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
                style={{ width: 200 }}
              />
              <Select
                placeholder="Punto de venta"
                allowClear
                showSearch
                value={filtros.puntoVenta || undefined}
                onChange={(value) => setFiltros({ ...filtros, puntoVenta: value || '' })}
                style={{ width: 220 }}
                options={opcionesPuntoVenta}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
              <Select
                placeholder="Filtrar por fecha"
                allowClear
                showSearch
                value={filtros.fecha || undefined}
                onChange={(value) => setFiltros({ ...filtros, fecha: value || '' })}
                style={{ width: 180 }}
                options={opcionesFecha}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
              <Button onClick={limpiarFiltros}>
                Limpiar
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={exportarExcel}
                style={{ background: '#9cbf8b' }}
              >
                Exportar a Excel
              </Button>
            </Space>
          </div>

          {/* Tabla de inscripciones */}
          <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', overflowX: 'auto' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Registros cargados:</strong> {inscripciones.length}, <strong>Filtrados:</strong> {dataFiltrada.length}
            </div>
            <Table
              columns={columns}
              dataSource={dataFiltrada || []}
              loading={loading}
              rowKey={(record, index) => record.id || record.cedula || `row-${index}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} inscripciones`
              }}
              scroll={{ x: 1500 }}
              locale={{
                emptyText: 'No hay inscripciones registradas'
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AsistenciaPanel;
