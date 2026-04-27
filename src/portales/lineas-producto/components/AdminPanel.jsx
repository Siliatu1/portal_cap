import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin_panel.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import FormularioInscripcion from "./FormularioInscripcion";
import FormularioPuntoVenta from "./FormularioPuntoVenta";
import SeleccionMenu from "./SeleccionMenu";
import EvaluacionTodera from "./EvaluacionTodera";
import { Table, Input, Button, Space, message, Popconfirm, Select, Modal, Switch, Tag, Tooltip } from "antd";
import { SearchOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { createCapInstructora, deleteCapCafe, deleteCapTodera, getBukEmpleadosByDocumento, getCapCafes, getCapInstructoras, getCapPdvById, getCapPdvs, getCapToderas, updateCapInstructora, updateCapPdv } from '../../../services/apiService';

const AdminPanel = ({ userData, onLogout }) => {
  const navigate = useNavigate();
  const strapiToken = import.meta.env.VITE_STRAPI_TOKEN;
  const datosUsuario = userData?.data || userData || {};
  const cargoUsuarioInicial = datosUsuario.cargo_general || datosUsuario.cargo || datosUsuario.position || '';
  const puntoVentaUsuarioActual = datosUsuario.area_nombre || datosUsuario.department || '';
  const rolesPuntoVentaCheck = [
    'ADMINISTRADORA PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA (FDS)',
    'GERENTE PUNTO DE VENTA'
  ];
  const vistaInicial = rolesPuntoVentaCheck.includes(cargoUsuarioInicial) ? "seleccion_menu" : "panel";
  
  const [showFormulario, setShowFormulario] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState(""); 
  const [vistaActual, setVistaActual] = useState(vistaInicial); 
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    cedula: '',
    puntoVenta: '',
    fecha: ''
  });
  const [dataFiltrada, setDataFiltrada] = useState([]);
  const [inscripcionesTodera, setInscripcionesTodera] = useState([]);
  const [loadingTodera, setLoadingTodera] = useState(false);
  const [filtrosTodera, setFiltrosTodera] = useState({
    cedula: '',
    puntoVenta: '',
    fecha: '',
    instructora: ''
  });
  const [dataFiltradaTodera, setDataFiltradaTodera] = useState([]);
  const tabActivo = 'todos';
  const [seccionActiva, setSeccionActiva] = useState('escuela_cafe'); // 'escuela_cafe' o 'evaluacion_todera'
  const [gestionInstructoras, setGestionInstructoras] = useState([]);
  const [dataFiltradaGestionInstructoras, setDataFiltradaGestionInstructoras] = useState([]);
  const [loadingGestionInstructoras, setLoadingGestionInstructoras] = useState(false);
  const [instructorasDisponibles, setInstructorasDisponibles] = useState([]);
  const [loadingInstructorasDisponibles, setLoadingInstructorasDisponibles] = useState(false);
  const [instructorasFiltradas, setInstructorasFiltradas] = useState([]);
  const [loadingInstructorasFiltradas, setLoadingInstructorasFiltradas] = useState(false);
  const [modalGestionVisible, setModalGestionVisible] = useState(false);
  const [modalNuevaInstructoraVisible, setModalNuevaInstructoraVisible] = useState(false);
  const [loadingNuevaInstructora, setLoadingNuevaInstructora] = useState(false);
  const [formGestion, setFormGestion] = useState({
    pdvId: '',
    categoria: '',
    instructoraId: ''
  });
  const [formNuevaInstructora, setFormNuevaInstructora] = useState({
    documento: '',
    nombre: '',
    telefono: '',
    correo: '',
    sal: false,
    dulce: false,
    bebidas: false,
    brunch: false,
    habilitado: true
  });
  const [filtrosGestionInstructoras, setFiltrosGestionInstructoras] = useState({
    puntoVenta: '',
    categoria: ''
  });
  const [fotosCache, setFotosCache] = useState({});
  const fotosCacheRef = useRef({});
  const fotosSolicitadasRef = useRef(new Set());


  const nombreUsuario = datosUsuario.nombre || 
    datosUsuario.name ||
    (datosUsuario.first_name && datosUsuario.last_name 
      ? `${datosUsuario.first_name} ${datosUsuario.last_name}`.trim()
      : datosUsuario.full_name || '');

  const rolesHeladeria = [
    'COORDINADORA HELADERIA',
    'COORDINADOR DE ZONA',
    'COORDINADOR (A) HELADERIA PRINCIPAL'
  ];

  const rolesPuntoVenta = [
    'ADMINISTRADORA PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA (FDS)',
    'GERENTE PUNTO DE VENTA'
  ];

  
  const rolesVerTodo = [
    'ANALISTA EVENTOS Y HELADERIAS',
    'JEFE OPERATIVO DE MERCADEO',
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO',
  ];


  const rolesVerAmbasTablas = [
    'ADMINISTRADORA PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA (FDS)',
    'GERENTE PUNTO DE VENTA',
    'JEFE OPERATIVO DE MERCADEO',
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO',
    'INSTRUCTOR'
  ];

  
  const rolesAccesoDual = [
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO',
  ];


  const cargosRestringidos = [
    'ADMINISTRADORA PUNTO DE VENTA',
    'COORDINADOR (A) HELADERIA PRINCIPAL',
    'COORDINADOR PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA (FDS)',
    'GERENTE PUNTO DE VENTA',
    'COORDINADORA HELADERIA',
    'COORDINADOR DE ZONA'
  ];

  const esRolPuntoVenta = rolesPuntoVenta.includes(cargoUsuarioInicial);
  const esRolHeladeria = rolesHeladeria.includes(cargoUsuarioInicial);
  const esAccesoDual = rolesAccesoDual.includes(cargoUsuarioInicial);
  const puedeVerTodo = rolesVerTodo.includes(cargoUsuarioInicial);
  const puedeVerAmbasTablas = rolesVerAmbasTablas.includes(cargoUsuarioInicial);

 
  const puedeEliminar = () => {
    if (!userData) return false;
    return !cargosRestringidos.includes(cargoUsuarioInicial);
  };

  const getStrapiJsonHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (strapiToken) {
      headers.Authorization = `Bearer ${strapiToken}`;
    }

    return headers;
  };


  /**
   * Carga las inscripciones de Escuela del Café desde la API
   * Filtra los datos según el rol del usuario:
   * - Roles administrativos ven todas las inscripciones
   * - Roles de heladería/punto de venta ven solo su PDV
   */
  const cargarInscripciones = useCallback(async () => {
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
        
      let dataFiltradaPorRol = dataArray;
        

      if (puedeVerTodo) {
        dataFiltradaPorRol = dataArray;
      } 

      else if (esRolHeladeria || esRolPuntoVenta) {
        dataFiltradaPorRol = dataArray.filter(item => {
          const pdvItem = item.puntoVenta || '';
          const coincide = pdvItem === puntoVentaUsuarioActual;
          return coincide;
        });
      }

      else {
        dataFiltradaPorRol = dataArray;
      }
        

      setInscripciones(dataFiltradaPorRol);
      setDataFiltrada(dataFiltradaPorRol);
    } catch {

      setInscripciones([]);
      setDataFiltrada([]);
    } finally {
      setLoading(false);
    }
  }, [esRolHeladeria, esRolPuntoVenta, puedeVerTodo, puntoVentaUsuarioActual]);


  /**
   * Carga las evaluaciones de toderas desde la API
   * Aplica los mismos filtros de permisos que cargarInscripciones
   */
  const cargarInscripcionesTodera = useCallback(async () => {
    setLoadingTodera(true);
    try {
      const result = await getCapToderas();
      let dataArray = [];
      if (result && Array.isArray(result.data)) {
        dataArray = result.data.map(item => ({
          id: item.id,
          cedula: item.attributes?.documento || '',
          nombres: item.attributes?.nombre || item.attributes?.Nombre || '',
          telefono: item.attributes?.telefono || '',
          cargo: item.attributes?.cargo || '',
          cargoEvaluar: item.attributes?.cargo_evaluar || item.attributes?.cargoEvaluar || '',
          puntoVenta: item.attributes?.pdv || '',
          dia: item.attributes?.fecha || '',
          nombreLider: item.attributes?.lider || '',
          categoria: item.attributes?.categoria || '',
          evaluado: item.attributes?.estado ?? null,
          observacion: item.attributes?.observacion || '',
        }));
      }

      let dataFiltradaPorRol = dataArray;

      if (puedeVerTodo) {
        dataFiltradaPorRol = dataArray;
      } else if (esRolHeladeria || esRolPuntoVenta) {
        dataFiltradaPorRol = dataArray.filter(item => {
          const pdvItem = item.puntoVenta || '';
          return pdvItem === puntoVentaUsuarioActual;
        });
      } else {
        dataFiltradaPorRol = dataArray;
      }

      setInscripcionesTodera(dataFiltradaPorRol);
      setDataFiltradaTodera(dataFiltradaPorRol);
    } catch {
      setInscripcionesTodera([]);
      setDataFiltradaTodera([]);
    } finally {
      setLoadingTodera(false);
    }
  }, [esRolHeladeria, esRolPuntoVenta, puedeVerTodo, puntoVentaUsuarioActual]);

  // Función para cargar foto de empleado desde API de BUK
  const cargarFotoEmpleado = useCallback(async (cedula) => {
    if (!cedula || fotosCacheRef.current[cedula]) return fotosCacheRef.current[cedula];
    
    try {
      const data = await getBukEmpleadosByDocumento(cedula);
      const empleados = data?.data || data;
      const empleado = Array.isArray(empleados) 
        ? empleados.find(emp => String(emp.document_number) === String(cedula))
        : null;
      
      const foto = empleado?.foto || '';
      setFotosCache(prev => {
        const nextState = { ...prev, [cedula]: foto };
        fotosCacheRef.current = nextState;
        return nextState;
      });
      return foto;
    } catch (error) {
      console.error('Error al cargar foto:', error);
    }
    return '';
  }, []);

  const cedulasVisiblesSinFoto = useMemo(() => {
    const cedulas = new Set();

    [...dataFiltrada, ...dataFiltradaTodera].forEach((item) => {
      const cedula = String(item?.cedula || '').trim();
      if (cedula && !fotosCache[cedula]) {
        cedulas.add(cedula);
      }
    });

    return Array.from(cedulas);
  }, [dataFiltrada, dataFiltradaTodera, fotosCache]);

  useEffect(() => {
    cedulasVisiblesSinFoto.forEach((cedula) => {
      if (fotosSolicitadasRef.current.has(cedula)) {
        return;
      }

      fotosSolicitadasRef.current.add(cedula);
      cargarFotoEmpleado(cedula).catch(() => {
        fotosSolicitadasRef.current.delete(cedula);
      });
    });
  }, [cedulasVisiblesSinFoto, cargarFotoEmpleado]);

  const handleRegistrarPersona = () => {
    if (esRolHeladeria || esAccesoDual) {

      setTipoFormulario("heladeria");
      setVistaActual("formulario");
      setShowFormulario(true);
    } else if (esRolPuntoVenta) {

      setVistaActual("seleccion_menu");
    } else {


      setTipoFormulario("heladeria");
      setVistaActual("formulario");
      setShowFormulario(true);
    }
  };

  const handleAbrirFormularioPuntoVenta = () => {
    setTipoFormulario("punto_venta");
    setVistaActual("formulario");
    setShowFormulario(true);
  };


  const handleAbrirFormularioEscuelaCafe = () => {
    setTipoFormulario("heladeria");
    setVistaActual("formulario");
    setShowFormulario(true);
  };

  const handleAbrirFormularioEvaluacionTodera = () => {
    setTipoFormulario("evaluacion_todera");
    setVistaActual("formulario");
    setShowFormulario(true);
  };

  const handleVolverDesdeSeleccion = () => {
    if (esRolPuntoVenta) {
      // Para roles de punto de venta, volver al menú de selección es cerrar sesión
      onLogout();
    } else {
      setVistaActual("panel");
    }
  };

  const handleVerMiPanel = () => {
    setVistaActual("panel");
  };


  const tieneAccesoDual = () => {
    return esAccesoDual;
  };

  const handleVolverPanel = () => {
    setShowFormulario(false);
    setTipoFormulario("");
    // Si es un rol de punto de venta, volver al menú de selección
    if (esRolPuntoVenta) {
      setVistaActual("seleccion_menu");
    } else {
      setVistaActual("panel");
    }
  };

  const handleSubmitInscripcion = (data) => {

    
   
    if (data && data.success) {
      setShowFormulario(false);
      // Después de inscribir, mostrar el panel para todos
      setVistaActual("panel");

      setTimeout(() => {
        cargarInscripciones();
      }, 500);
    }
  };


  const aplicarFiltros = useCallback(() => {
    let dataTemp = [...inscripciones];

    // Filtrar por tab activo
    if (tabActivo === 'hel') {
      dataTemp = dataTemp.filter(item => item.tipoFormulario === 'heladeria');
    } else if (tabActivo === 'pdv') {
      dataTemp = dataTemp.filter(item => item.tipoFormulario === 'punto_venta');
    }

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
  }, [filtros, inscripciones, tabActivo]);


  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);


  const limpiarFiltros = () => {
    setFiltros({ cedula: '', puntoVenta: '', fecha: '' });
  };

  // Aplicar filtros todera
  const aplicarFiltrosTodera = useCallback(() => {
    let dataTemp = [...inscripcionesTodera];

    if (filtrosTodera.cedula) {
      dataTemp = dataTemp.filter(item => 
        item.cedula && item.cedula.toString().includes(filtrosTodera.cedula)
      );
    }

    if (filtrosTodera.puntoVenta) {
      dataTemp = dataTemp.filter(item => 
        item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtrosTodera.puntoVenta.toLowerCase())
      );
    }

    if (filtrosTodera.fecha) {
      dataTemp = dataTemp.filter(item => 
        item.dia && item.dia === filtrosTodera.fecha
      );
    }

    if (filtrosTodera.instructora) {
      dataTemp = dataTemp.filter(item => 
        item.nombreLider && item.nombreLider.toLowerCase().includes(filtrosTodera.instructora.toLowerCase())
      );
    }

    setDataFiltradaTodera(dataTemp);
  }, [filtrosTodera, inscripcionesTodera]);

  useEffect(() => {
    aplicarFiltrosTodera();
  }, [aplicarFiltrosTodera]);

  const limpiarFiltrosTodera = () => {
    setFiltrosTodera({ cedula: '', puntoVenta: '', fecha: '', instructora: '' });
  };

  const cargarGestionInstructoras = useCallback(async () => {
    setLoadingGestionInstructoras(true);
    try {
      let result;
      try {
        result = await getCapPdvs('populate=cap_instructoras');
      } catch {
        result = await getCapPdvs('populate=*');
      }
      const data = Array.isArray(result?.data) ? result.data : [];
      const filas = [];

      data.forEach((pdvItem) => {
        const pdvId = pdvItem?.id;
        const pdvNombre = pdvItem?.attributes?.nombre || '';
        const instructoras = pdvItem?.attributes?.cap_instructoras?.data || [];

        const categoriaMap = {
          sal: null,
          dulce: null,
          bebidas: null,
          brunch: null
        };

        instructoras.forEach((insItem) => {
          const attrs = insItem?.attributes || {};
          const nombreInstructora = attrs?.Nombre || attrs?.nombre || 'Sin nombre';
          const instructoraId = insItem.id;

          if (attrs.sal === true) {
            categoriaMap.sal = { instructoraId, instructoraNombre: nombreInstructora };
          }
          if (attrs.dulce === true) {
            categoriaMap.dulce = { instructoraId, instructoraNombre: nombreInstructora };
          }
          if (attrs.bebidas === true) {
            categoriaMap.bebidas = { instructoraId, instructoraNombre: nombreInstructora };
          }
          if (attrs.brunch === true || attrs.Brunch === true) {
            categoriaMap.brunch = { instructoraId, instructoraNombre: nombreInstructora };
          }
        });

        filas.push({
          key: `${pdvId}`,
          pdvId,
          puntoVenta: pdvNombre,
          sal: categoriaMap.sal,
          dulce: categoriaMap.dulce,
          bebidas: categoriaMap.bebidas,
          brunch: categoriaMap.brunch,
          instructorasIds: instructoras.map(i => i.id)
        });
      });

      setGestionInstructoras(filas);
      setDataFiltradaGestionInstructoras(filas);
    } catch {
      message.error('Error al cargar gestión de instructoras');
      setGestionInstructoras([]);
      setDataFiltradaGestionInstructoras([]);
    } finally {
      setLoadingGestionInstructoras(false);
    }
  }, []);

  const cargarInstructorasDisponibles = useCallback(async () => {
    setLoadingInstructorasDisponibles(true);
    try {
      const result = await getCapInstructoras();
      const data = Array.isArray(result?.data) ? result.data : [];
      const instructoras = data.map((item) => ({
        id: item.id,
        nombre: item?.attributes?.Nombre || item?.attributes?.nombre || `Instructora ${item.id}`,
        habilitado: item?.attributes?.habilitado !== false
      }));
      setInstructorasDisponibles(instructoras);
    } catch {
      message.error('Error al cargar la lista de instructoras');
      setInstructorasDisponibles([]);
    } finally {
      setLoadingInstructorasDisponibles(false);
    }
  }, []);

  useEffect(() => {
    if (vistaActual === "panel") {
      cargarInscripciones();
      if (puedeVerAmbasTablas) {
        cargarInscripcionesTodera();
      }
      if (esAccesoDual) {
        cargarGestionInstructoras();
        cargarInstructorasDisponibles();
      }
    }
  }, [vistaActual, puedeVerAmbasTablas, esAccesoDual, cargarGestionInstructoras, cargarInstructorasDisponibles, cargarInscripciones, cargarInscripcionesTodera]);

  const aplicarFiltrosGestionInstructoras = useCallback(() => {
    let dataTemp = [...gestionInstructoras];

    if (filtrosGestionInstructoras.puntoVenta) {
      dataTemp = dataTemp.filter((item) => item.puntoVenta.toLowerCase().includes(filtrosGestionInstructoras.puntoVenta.toLowerCase()));
    }

    setDataFiltradaGestionInstructoras(dataTemp);
  }, [filtrosGestionInstructoras.puntoVenta, gestionInstructoras]);

  useEffect(() => {
    aplicarFiltrosGestionInstructoras();
  }, [aplicarFiltrosGestionInstructoras]);

  const limpiarFiltrosGestionInstructoras = () => {
    setFiltrosGestionInstructoras({ puntoVenta: '', categoria: '' });
  };

  const cargarInstructorasPorCategoria = async (categoria) => {
    if (!categoria) {
      setInstructorasFiltradas([]);
      return;
    }
    setLoadingInstructorasFiltradas(true);
    try {
      const campo = categoria.toLowerCase();
      const result = await getCapInstructoras(`filters[${campo}][$eq]=true`);
      const data = Array.isArray(result?.data) ? result.data : [];
      const instructoras = data.map((item) => ({
        id: item.id,
        nombre: item?.attributes?.Nombre || item?.attributes?.nombre || `Instructora ${item.id}`,
        habilitado: item?.attributes?.habilitado !== false
      }));
      setInstructorasFiltradas(instructoras);
    } catch {
      setInstructorasFiltradas([]);
      message.error('Error al cargar instructoras por categoría');
    } finally {
      setLoadingInstructorasFiltradas(false);
    }
  };

  const abrirModalGestionInstructoras = (pdvId = '', categoria = '') => {
    setFormGestion({ pdvId: String(pdvId), categoria, instructoraId: '' });
    setInstructorasFiltradas([]);
    setModalGestionVisible(true);
    if (categoria) {
      cargarInstructorasPorCategoria(categoria);
    }
  };

  const resetFormNuevaInstructora = () => {
    setFormNuevaInstructora({
      documento: '',
      nombre: '',
      telefono: '',
      correo: '',
      sal: false,
      dulce: false,
      bebidas: false,
      brunch: false,
      habilitado: true
    });
  };

  const crearInstructora = async () => {
    const documento = formNuevaInstructora.documento.trim();
    const nombre = formNuevaInstructora.nombre.trim();
    const telefono = formNuevaInstructora.telefono.trim();
    const correo = formNuevaInstructora.correo.trim();
    const tieneCategoria = formNuevaInstructora.sal || formNuevaInstructora.dulce || formNuevaInstructora.bebidas || formNuevaInstructora.brunch;

    if (!documento) {
      message.warning('Ingresa el documento de la instructora');
      return;
    }

    if (!nombre) {
      message.warning('Ingresa el nombre de la instructora');
      return;
    }

    if (!telefono) {
      message.warning('Ingresa el telefono de la instructora');
      return;
    }

    if (!correo) {
      message.warning('Ingresa el correo de la instructora');
      return;
    }

    if (!tieneCategoria) {
      message.warning('Selecciona al menos una categoría');
      return;
    }

    setLoadingNuevaInstructora(true);
    try {
      const payload = {
        data: {
          documento,
          Nombre: nombre,
          telefono,
          correo,
          sal: formNuevaInstructora.sal,
          dulce: formNuevaInstructora.dulce,
          bebidas: formNuevaInstructora.bebidas,
          brunch: formNuevaInstructora.brunch,
          habilitado: formNuevaInstructora.habilitado
        }
      };

      await createCapInstructora(payload, getStrapiJsonHeaders());

      message.success('Instructora creada exitosamente');
      setModalNuevaInstructoraVisible(false);
      resetFormNuevaInstructora();
      cargarInstructorasDisponibles();

      if (formGestion.categoria) {
        cargarInstructorasPorCategoria(formGestion.categoria);
      }
    } catch (error) {
      message.error(error?.message || 'Error al crear instructora');
    } finally {
      setLoadingNuevaInstructora(false);
    }
  };

  const agregarInstructoraAPuntoVenta = async () => {
    if (!formGestion.pdvId || !formGestion.instructoraId || !formGestion.categoria) {
      message.warning('Completa punto de venta, categoría e instructora');
      return;
    }

    try {
      const pdvResult = await getCapPdvById(formGestion.pdvId, 'populate=cap_instructoras');
      const instructorasActuales = pdvResult?.data?.attributes?.cap_instructoras?.data || [];
      const idsActuales = instructorasActuales.map((item) => item.id);
      const instructoraIdNumber = Number(formGestion.instructoraId);
      const idsActualizados = idsActuales.includes(instructoraIdNumber)
        ? idsActuales
        : [...idsActuales, instructoraIdNumber];

      await updateCapPdv(formGestion.pdvId, {
        data: {
          cap_instructoras: idsActualizados
        }
      });

      await updateCapInstructora(instructoraIdNumber, {
        data: {
          [formGestion.categoria.toLowerCase()]: true
        }
      });

      message.success('Instructora agregada exitosamente');
      setModalGestionVisible(false);
      cargarGestionInstructoras();
      cargarInstructorasDisponibles();
    } catch (error) {
      message.error(error?.message || 'Error al agregar instructora');
    }
  };

  const eliminarInstructoraDePuntoVenta = async (pdvId, instructoraId) => {
    if (!pdvId || !instructoraId) {
      message.warning('No hay una instructora válida para eliminar');
      return;
    }

    try {
      const pdvData = await getCapPdvById(pdvId, 'populate=cap_instructoras');
      const instructorasActuales = pdvData?.data?.attributes?.cap_instructoras?.data || [];
      const instructorasRestantes = instructorasActuales
        .filter((item) => item.id !== instructoraId)
        .map((item) => item.id);

      await updateCapPdv(pdvId, {
        data: {
          cap_instructoras: instructorasRestantes
        }
      });

      message.success('Instructora eliminada del punto de venta');
      cargarGestionInstructoras();
    } catch (error) {
      message.error(error?.message || 'Error al eliminar instructora');
    }
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
      'Asistencia': item.asistencia === null ? 'Pendiente' : (item.asistencia ? 'Asistió' : 'No asistió'),
      'Día': item.dia || '',
      
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');
    XLSX.writeFile(wb, `Inscripciones${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Archivo Excel exportado exitosamente');
  };

  const exportarExcelTodera = () => {
    if (dataFiltradaTodera.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const datosExportar = dataFiltradaTodera.map((item, index) => ({
      'No.': index + 1,
      'Cédula': item.cedula || '',
      'Nombres': item.nombres || '',
      'Teléfono': item.telefono || '',
      'Cargo a Evaluar': item.cargoEvaluar || item.cargo || '',
      'Punto de Venta': item.puntoVenta || '',
      'Nombre Líder': item.nombreLider || '',
      'Categoría': item.categoria || '',
      'Día Inscripción': item.dia || '',
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evaluaciones Todera');
    XLSX.writeFile(wb, `EvaluacionesTodera_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Archivo Excel exportado exitosamente');
  };


  const handleEliminar = async (id) => {
    try {
      await deleteCapCafe(id);
      message.success('Inscripción eliminada exitosamente');
      cargarInscripciones();
    } catch {
      message.error('Error de conexión al eliminar');
    }
  };

  const handleEliminarTodera = async (id) => {
    try {
      await deleteCapTodera(id);
      message.success('Evaluación eliminada exitosamente');
      cargarInscripcionesTodera();
    } catch {
      message.error('Error de conexión al eliminar');
    }
  };


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
      title: 'Cargo a Evaluar',
      dataIndex: 'cargoEvaluar',
      key: 'cargoEvaluar',
      width: 200,
      render: (_, record) => record.cargoEvaluar || record.cargo || 'Sin definir'
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
      dataIndex: 'asistencia',
      key: 'asistencia',
      width: 120,
      render: (asistencia) => {
        if (asistencia === null) {
          return <span style={{ color: '#a8a26a' }}>Pendiente</span>;
        } else if (asistencia === true) {
          return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>✓ Asistió</span>;
        } else {
          return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>✗ No asistió</span>;
        }
      }
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
              title="¿Está seguro de eliminar esta inscripción?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleEliminar(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                title="Eliminar"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  // Columnas para tabla todera
  // Roles que pueden ver estado y observación
  const rolesVerEstadoObs = [
    'ADMINISTRADORA PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA',
    'COORDINADOR PUNTO DE VENTA (FDS)',
    'GERENTE PUNTO DE VENTA',
    'JEFE DESARROLLO DE PRODUCTO',
    'DIRECTORA DE LINEAS DE PRODUCTO',
    'ANALISTA DE PRODUCTO',
  ];

  const cargoUsuarioActual = userData?.data?.cargo_general || userData?.cargo_general || userData?.cargo || '';

  const columnsToderaBase = [
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
      title: 'Cargo a Evaluar',
      dataIndex: 'cargoEvaluar',
      key: 'cargoEvaluar',
      width: 180,
      render: (_, record) => record.cargoEvaluar || record.cargo || 'Sin definir'
    },
    {
      title: 'Punto de Venta',
      dataIndex: 'puntoVenta',
      key: 'puntoVenta',
      width: 150,
    },
    {
      title: 'Instructora',
      dataIndex: 'nombreLider',
      key: 'nombreLider',
      width: 180,
      render: (text) => (
        <span style={{
          backgroundColor: '#fff7e6',
          color: '#d46b08',
          padding: '4px 12px',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '12px',
          display: 'inline-block'
        }}>
          {text || 'Sin asignar'}
        </span>
      )
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      width: 120,
      render: (text) => {
        const categorias = {
          'sal': { text: 'SAL', color: '#8B4513' },
          'dulce': { text: 'DULCE', color: '#FF69B4' },
          'bebidas': { text: 'BEBIDAS', color: '#4169E1' }
        };
        const cat = categorias[text?.toLowerCase()] || { text: text, color: '#666' };
        return <span style={{ color: cat.color, fontWeight: 'bold' }}>{cat.text}</span>;
      }
    },
    {
      title: 'Día Inscripción',
      dataIndex: 'dia',
      key: 'dia',
      width: 140,
      sorter: (a, b) => {
        if (!a.dia) return 1;
        if (!b.dia) return -1;
        return a.dia.localeCompare(b.dia);
      },
      defaultSortOrder: 'descend',
      render: (text, record) => {
        if (!text) return '';
        // Calcular si han pasado 15 días o más y no está evaluado
        const fechaInscripcion = new Date(text);
        const hoy = new Date();
        let diasTranscurridos = 0;
        let esAlerta = false;
        
        if (!isNaN(fechaInscripcion.getTime())) {
          diasTranscurridos = Math.floor((hoy - fechaInscripcion) / (1000 * 60 * 60 * 24));
          esAlerta = diasTranscurridos >= 15 && record.evaluado !== true;
        }
        
        const [year, month, day] = text.split('-');
        const fechaFormateada = `${day}/${month}/${year}`;
        return (
          <span 
            className={esAlerta ? 'fecha-alerta-admin' : ''}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'inline-block',
              fontWeight: esAlerta ? '600' : '400',
              backgroundColor: esAlerta ? '#ff4d4f' : 'transparent',
              color: esAlerta ? '#ffffff' : '#333',
              border: esAlerta ? '2px solid #ff1f1f' : 'none',
              animation: esAlerta ? 'pulso-alerta-admin 1.5s infinite' : 'none'
            }}
            title={esAlerta ? `Han pasado ${diasTranscurridos} días sin evaluar` : ''}
          >
            {fechaFormateada}
            {esAlerta && (
              <i className="bi bi-exclamation-triangle-fill" style={{ marginLeft: '6px', fontSize: '12px' }}></i>
            )}
          </span>
        );
      }
    },
  ];

  // Agregar columnas de Estado y Observación solo para los roles permitidos
  const columnsTodera = [
    ...columnsToderaBase,
    ...(rolesVerEstadoObs.includes(cargoUsuarioActual)
      ? [
          {
            title: 'Estado',
            dataIndex: 'evaluado',
            key: 'estado',
            width: 120,
            render: (evaluado) => {
              if (evaluado === null) return <span style={{ color: '#a8a26a' }}>Pendiente</span>;
              if (evaluado === true) return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Evaluado</span>;
              return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>No evaluado</span>;
            }
          },
          {
            title: 'Observación',
            dataIndex: 'observacion',
            key: 'observacion',
            width: 180,
            render: (obs) => obs ? <span style={{ color: '#3d2817' }}>{obs}</span> : <span style={{ color: '#bbb' }}>Sin observación</span>
          }
        ]
      : []),
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {puedeEliminar() && (
            <Popconfirm
              title="¿Está seguro de eliminar esta evaluación?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleEliminarTodera(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                title="Eliminar"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  const renderCeldaCategoria = (asignacion, pdvId, categoria) => {
    if (!asignacion) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Tooltip title={`Agregar instructora para ${categoria}`}>
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => abrirModalGestionInstructoras(pdvId, categoria)}
            />
          </Tooltip>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500, color: '#2c3e50', fontSize: '13px' }}>{asignacion.instructoraNombre}</span>
        <Popconfirm
          title="¿Eliminar?"
          description="Se quitará de este PDV."
          onConfirm={() => eliminarInstructoraDePuntoVenta(pdvId, asignacion.instructoraId)}
          okText="Eliminar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          />
        </Popconfirm>
      </div>
    );
  };

  const columnsGestionInstructoras = [
    {
      title: 'Punto de Venta',
      dataIndex: 'puntoVenta',
      key: 'puntoVenta',
      width: 200,
      sorter: (a, b) => (a.puntoVenta || '').localeCompare(b.puntoVenta || '')
    },
    {
      title: <span style={{ color: '#2f6b17', fontWeight: 'bold' }}>SAL</span>,
      dataIndex: 'sal',
      key: 'sal',
      width: 200,
      render: (sal, record) => renderCeldaCategoria(sal, record.pdvId, 'SAL')
    },
    {
      title: <span style={{ color: '#2b627a', fontWeight: 'bold' }}>DULCE</span>,
      dataIndex: 'dulce',
      key: 'dulce',
      width: 200,
      render: (dulce, record) => renderCeldaCategoria(dulce, record.pdvId, 'DULCE')
    },
    {
      title: <span style={{ color: '#6b5600', fontWeight: 'bold' }}>BEBIDAS</span>,
      dataIndex: 'bebidas',
      key: 'bebidas',
      width: 200,
      render: (bebidas, record) => renderCeldaCategoria(bebidas, record.pdvId, 'BEBIDAS')
    },
    {
      title: <span style={{ color: '#6b4d3a', fontWeight: 'bold' }}>BRUNCH</span>,
      dataIndex: 'brunch',
      key: 'brunch',
      width: 200,
      render: (brunch, record) => renderCeldaCategoria(brunch, record.pdvId, 'BRUNCH')
    }
  ];


  const puedeVerTodera = () => {
    return puedeVerAmbasTablas;
  };

  const puedeGestionarInstructoras = () => {
    return esAccesoDual;
  };

  // Verificar si el usuario puede ver el filtro de instructora
  const puedeVerFiltroInstructora = () => {
    return puedeVerTodo;
  };

  const obtenerInstructorasTodera = () => {
    return [...new Set(inscripcionesTodera.map(item => item.nombreLider).filter(Boolean))].sort();
  };


  if (vistaActual === "seleccion_menu") {
    return (
      <SeleccionMenu
        onSelectEscuelaCafe={handleAbrirFormularioPuntoVenta}
        onSelectEvaluacionToderas={handleAbrirFormularioEvaluacionTodera}
        onViewPanel={handleVerMiPanel}
        onBack={handleVolverDesdeSeleccion}
        nombreUsuario={nombreUsuario}
      />
    );
  }

  if (vistaActual === "formulario" && showFormulario) {
    if (tipoFormulario === "punto_venta") {
      return (
        <FormularioPuntoVenta 
          onBack={handleVolverPanel}
          onSubmit={handleSubmitInscripcion}
          coordinadoraData={userData}
        />
      );
    } else if (tipoFormulario === "evaluacion_todera") {
      return (
        <EvaluacionTodera 
          onBack={handleVolverPanel}
          onSubmit={handleSubmitInscripcion}
          coordinadoraData={userData}
        />
      );
    } else {
      return (
        <FormularioInscripcion 
          onBack={handleVolverPanel}
          onSubmit={handleSubmitInscripcion}
          coordinadoraData={userData}
        />
      );
    }
  }

  return (
    <div className="admin-container">
      {/* Header Superior */}
      <header className="admin-header">
        <div className="header-left">
          <div className="header-titles">
            <span className="header-logo-text">PANEL  LÍNEAS DE PRODUCTO C&W</span>
            <span className="header-subtitle">Gestión Administrativa</span>
          </div>
        </div>
        
        <div className="header-right">
          {tieneAccesoDual() ? (
            <>
              <button className="header-nav-btn" onClick={handleAbrirFormularioEscuelaCafe}>
                <i className="bi bi-cup-hot"></i>
                <span>Escuela Café HEL</span>
              </button>
              <button className="header-nav-btn" onClick={handleAbrirFormularioPuntoVenta}>
                <i className="bi bi-shop-window"></i>
                <span>Escuela Café PDV</span>
              </button>
            </>
          ) : esRolPuntoVenta ? (
            <>
              <button className="header-nav-btn" onClick={handleAbrirFormularioPuntoVenta}>
                <i className="bi bi-cup-hot"></i>
                <span>Escuela del Café</span>
              </button>
              <button className="header-nav-btn" onClick={handleAbrirFormularioEvaluacionTodera}>
                <i className="bi bi-clipboard-check"></i>
                <span>Evaluación Toderas</span>
              </button>
            </>
          ) : esRolHeladeria ? (
            <button className="header-nav-btn" onClick={handleAbrirFormularioEscuelaCafe}>
              <i className="bi bi-pencil-square"></i>
              <span>Inscripción Aquí</span>
            </button>
          ) : (
            <button className="header-nav-btn" onClick={handleRegistrarPersona}>
              <i className="bi bi-book"></i>
              <span>Registrar Estudiante</span>
            </button>
          )}
          
          {puedeVerTodera() && !esRolPuntoVenta && (
            <button className="header-nav-btn" onClick={handleAbrirFormularioEvaluacionTodera}>
              <i className="bi bi-clipboard-check"></i>
              <span>Evaluación Todera</span>
            </button>
          )}
          
          <button className="btn-nav-header" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
            <span>Volver</span>
          </button>
          <button className="btn-nav-header" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="admin-main">
        <div className="admin-content">

          <h1 className="admin-title">Hola, {nombreUsuario}</h1>
          <h2 className="admin-subtitle">Líneas de Producto C&W</h2>

          {/* Botón de Sección Grande */}
          <div className="main-section-button-container">
            <button 
              className={`main-section-button ${seccionActiva === 'escuela_cafe' ? 'active' : ''}`}
              onClick={() => {
                setSeccionActiva('escuela_cafe');
              }}
            >
              
              <span>Escuela del Café</span>
            </button>
            
            {puedeVerTodera() && (
              <button 
                className={`main-section-button ${seccionActiva === 'evaluacion_todera' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('evaluacion_todera')}
              >
                
                <span>Evaluación Todera</span>
              </button>
            )}

            {puedeGestionarInstructoras() && (
              <button
                className={`main-section-button ${seccionActiva === 'gestion_instructoras' ? 'active' : ''}`}
                onClick={() => {
                  setSeccionActiva('gestion_instructoras');
                  if (!gestionInstructoras.length) {
                    cargarGestionInstructoras();
                  }
                  if (!instructorasDisponibles.length) {
                    cargarInstructorasDisponibles();
                  }
                }}
              >
                <span>Gestión Instructoras</span>
              </button>
            )}
          </div>

          {/* Mostrar contenido según sección activa */}
          {seccionActiva === 'escuela_cafe' ? (
            <>
              {/* Filtros */}
              <div className="filters-container">
                <h3 className="filters-title"> FILTROS DE BÚSQUEDA</h3>
                <Space wrap size="middle" style={{ width: '100%' }}>
                  <Input
                    placeholder="Buscar por cédula..."
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
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {[...new Set(inscripciones.map(item => item.puntoVenta).filter(Boolean))]
                      .sort()
                      .map(pdv => (
                        <Select.Option key={pdv} value={pdv}>{pdv}</Select.Option>
                      ))}
                  </Select>
                  <Select
                    placeholder="Filtrar por fecha"
                    allowClear
                    showSearch
                    value={filtros.fecha || undefined}
                    onChange={(value) => setFiltros({ ...filtros, fecha: value || '' })}
                    style={{ width: 180 }}
                  >
                    {[...new Set(inscripciones.map(item => item.dia).filter(Boolean))]
                      .sort((a, b) => b.localeCompare(a))
                      .map(fecha => {
                        const [year, month, day] = fecha.split('-');
                        const fechaFormateada = `${day}/${month}/${year}`;
                        return (
                          <Select.Option key={fecha} value={fecha}>{fechaFormateada}</Select.Option>
                        );
                      })}
                  </Select>
                  <Button onClick={limpiarFiltros}>
                    Limpiar
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportarExcel}
                    style={{ background: '#52B788', borderColor: '#52B788' }}
                  >
                    Exportar a Excel
                  </Button>
                </Space>
              </div>

              {/* Tabla de inscripciones */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">
                    

                    <strong>Inscripciones Escuela del Café </strong>
                    <button
                      onClick={cargarInscripciones}
                      style={{
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
                      }}
                      title="Refrescar"
                    >
                      <i className="bi bi-arrow-clockwise" style={{ color: '#563C28', fontSize: 18 }}></i>
                    </button>
                  </div>
                  <span className="table-count">
                    Registros {inscripciones.length} | Filtrados {dataFiltrada.length}
                  </span>
                </div>
                <Table
                  columns={columns}
                  dataSource={dataFiltrada || []}
                  loading={loading}
                  rowKey={(record) => record.id || `${record.cedula}-${record.dia}` || Math.random().toString(36)}
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
            </>
          ) : null}
          
          {seccionActiva === 'evaluacion_todera' && puedeVerTodera() && (
            <>
              <div className="filters-container">
                <h3 className="filters-title"><i className="bi bi-funnel-fill"></i> FILTROS EVALUACIONES TODERA</h3>
                <Space wrap size="middle" style={{ width: '100%' }}>
                  <Input
                    placeholder="Buscar por cédula..."
                    prefix={<SearchOutlined />}
                    value={filtrosTodera.cedula}
                    onChange={(e) => setFiltrosTodera({ ...filtrosTodera, cedula: e.target.value })}
                    style={{ width: 200 }}
                  />
                  <Select
                    placeholder="Punto de venta"
                    allowClear
                    showSearch
                    value={filtrosTodera.puntoVenta || undefined}
                    onChange={(value) => setFiltrosTodera({ ...filtrosTodera, puntoVenta: value || '' })}
                    style={{ width: 220 }}
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {[...new Set(inscripcionesTodera.map(item => item.puntoVenta).filter(Boolean))]
                      .sort()
                      .map(pdv => (
                        <Select.Option key={pdv} value={pdv}>{pdv}</Select.Option>
                      ))}
                  </Select>
                  <Select
                    placeholder="Filtrar por fecha"
                    allowClear
                    showSearch
                    value={filtrosTodera.fecha || undefined}
                    onChange={(value) => setFiltrosTodera({ ...filtrosTodera, fecha: value || '' })}
                    style={{ width: 180 }}
                  >
                    {[...new Set(inscripcionesTodera.map(item => item.dia).filter(Boolean))]
                      .sort((a, b) => b.localeCompare(a))
                      .map(fecha => {
                        const [year, month, day] = fecha.split('-');
                        const fechaFormateada = `${day}/${month}/${year}`;
                        return (
                          <Select.Option key={fecha} value={fecha}>{fechaFormateada}</Select.Option>
                        );
                      })}
                  </Select>
                  {puedeVerFiltroInstructora() && (
                    <Select
                      placeholder="Seleccionar instructora"
                      allowClear
                      showSearch
                      value={filtrosTodera.instructora || undefined}
                      onChange={(value) => setFiltrosTodera({ ...filtrosTodera, instructora: value || '' })}
                      style={{ width: 220 }}
                      filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {obtenerInstructorasTodera().map(instructora => (
                        <Select.Option key={instructora} value={instructora}>{instructora}</Select.Option>
                      ))}
                    </Select>
                  )}
                  <Button onClick={limpiarFiltrosTodera}>
                    Limpiar
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportarExcelTodera}
                    style={{ background: '#52B788', borderColor: '#52B788' }}
                  >
                    Exportar a Excel
                  </Button>
                </Space>
              </div>

              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">
                    <div className="table-icon">
                      <i className="bi bi-clipboard-check"></i>
                    </div>
                    <strong>Evaluaciones Todera</strong>
                    <button
                      onClick={cargarInscripcionesTodera}
                      style={{
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
                      }}
                      title="Refrescar"
                    >
                      <i className="bi bi-arrow-clockwise" style={{ color: '#6F4E37', fontSize: 18 }}></i>
                    </button>
                  </div>
                  <span className="table-count">
                    Registros {inscripcionesTodera.length} | Filtrados {dataFiltradaTodera.length}
                  </span>
                </div>
                <Table
                  columns={columnsTodera}
                  dataSource={dataFiltradaTodera || []}
                  loading={loadingTodera}
                  rowKey={(record) => record.id || `${record.cedula}-${record.dia}` || Math.random().toString(36)}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} evaluaciones`
                  }}
                  scroll={{ x: 1500 }}
                  locale={{
                    emptyText: 'No hay evaluaciones registradas'
                  }}
                />
              </div>
            </>
          )}

          {seccionActiva === 'gestion_instructoras' && puedeGestionarInstructoras() && (
            <>
              <div className="filters-container">
                <h3 className="filters-title">GESTIÓN DE INSTRUCTORAS</h3>
                <Space wrap size="middle" style={{ width: '100%' }}>
                  <Input
                    placeholder="Buscar punto de venta..."
                    prefix={<SearchOutlined />}
                    value={filtrosGestionInstructoras.puntoVenta}
                    onChange={(e) => setFiltrosGestionInstructoras({ ...filtrosGestionInstructoras, puntoVenta: e.target.value })}
                    style={{ width: 280 }}
                  />

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalNuevaInstructoraVisible(true)}
                    style={{ background: '#52B788', borderColor: '#52B788' }}
                  >
                    Agregar instructora
                  </Button>

                  <Button onClick={limpiarFiltrosGestionInstructoras}>
                    Limpiar
                  </Button>
                </Space>
              </div>

              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">
                    <strong>Gestión Instructoras</strong>
                    <button
                      onClick={cargarGestionInstructoras}
                      style={{
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
                      }}
                      title="Refrescar"
                    >
                      <i className="bi bi-arrow-clockwise" style={{ color: '#6F4E37', fontSize: 18 }}></i>
                    </button>
                  </div>
                  <span className="table-count">
                    Registros {gestionInstructoras.length} | Filtrados {dataFiltradaGestionInstructoras.length}
                  </span>
                </div>
                <Table
                  columns={columnsGestionInstructoras}
                  dataSource={dataFiltradaGestionInstructoras || []}
                  loading={loadingGestionInstructoras}
                  rowKey={(record) => record.key}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} registros`
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: 'No hay asignaciones de instructoras registradas'
                  }}
                />
              </div>
            </>
          )}

        </div>
      </main>

      <Modal
        title="Agregar instructora"
        open={modalNuevaInstructoraVisible}
        onCancel={() => {
          setModalNuevaInstructoraVisible(false);
          resetFormNuevaInstructora();
        }}
        onOk={crearInstructora}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={loadingNuevaInstructora}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <Input
            placeholder="Documento de la instructora"
            value={formNuevaInstructora.documento}
            onChange={(e) => setFormNuevaInstructora({ ...formNuevaInstructora, documento: e.target.value })}
          />

          <Input
            placeholder="Nombre de la instructora"
            value={formNuevaInstructora.nombre}
            onChange={(e) => setFormNuevaInstructora({ ...formNuevaInstructora, nombre: e.target.value })}
          />

          <Input
            placeholder="Telefono de la instructora"
            value={formNuevaInstructora.telefono}
            onChange={(e) => setFormNuevaInstructora({ ...formNuevaInstructora, telefono: e.target.value })}
          />

          <Input
            placeholder="Correo de la instructora"
            value={formNuevaInstructora.correo}
            onChange={(e) => setFormNuevaInstructora({ ...formNuevaInstructora, correo: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            {[
              { key: 'sal', label: 'SAL' },
              { key: 'dulce', label: 'DULCE' },
              { key: 'bebidas', label: 'BEBIDAS' },
              { key: 'brunch', label: 'BRUNCH' }
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.label}</span>
                <Switch
                  checked={formNuevaInstructora[item.key]}
                  onChange={(checked) => setFormNuevaInstructora({ ...formNuevaInstructora, [item.key]: checked })}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px'
            }}
          >
            <span style={{ fontWeight: 500 }}>Habilitada</span>
            <Switch
              checked={formNuevaInstructora.habilitado}
              onChange={(checked) => setFormNuevaInstructora({ ...formNuevaInstructora, habilitado: checked })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Gestión Instructoras"
        open={modalGestionVisible}
        onCancel={() => setModalGestionVisible(false)}
        onOk={agregarInstructoraAPuntoVenta}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={loadingInstructorasDisponibles || loadingGestionInstructoras}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <Select
            placeholder="Selecciona punto de venta"
            showSearch
            value={formGestion.pdvId || undefined}
            onChange={(value) => {
              const nuevoPdv = value || '';
              setFormGestion({ ...formGestion, pdvId: nuevoPdv, instructoraId: '' });
            }}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {[...new Map(gestionInstructoras.filter((item) => item.pdvId && item.puntoVenta).map((item) => [item.pdvId, item])).values()]
              .sort((a, b) => (a.puntoVenta || '').localeCompare(b.puntoVenta || ''))
              .map((item) => (
                <Select.Option key={item.pdvId} value={String(item.pdvId)}>{item.puntoVenta}</Select.Option>
              ))}
          </Select>

          <Select
            placeholder="Selecciona categoría"
            value={formGestion.categoria || undefined}
            onChange={(value) => {
              const nuevaCategoria = value || '';
              setFormGestion({ ...formGestion, categoria: nuevaCategoria, instructoraId: '' });
              cargarInstructorasPorCategoria(nuevaCategoria);
            }}
          >
            {['SAL', 'DULCE', 'BEBIDAS', 'BRUNCH'].map((cat) => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder={formGestion.categoria ? (loadingInstructorasFiltradas ? 'Cargando...' : (instructorasFiltradas.length === 0 ? 'Sin instructoras para esta categoría' : 'Selecciona instructora')) : 'Primero selecciona una categoría'}
            showSearch
            value={formGestion.instructoraId || undefined}
            onChange={(value) => setFormGestion({ ...formGestion, instructoraId: value || '' })}
            loading={loadingInstructorasFiltradas}
            disabled={!formGestion.categoria || loadingInstructorasFiltradas}
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {instructorasFiltradas
              .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
              .map((item) => (
                <Select.Option key={item.id} value={String(item.id)}>
                  {item.nombre} {item.habilitado ? '' : '(Inactiva)'}
                </Select.Option>
              ))}
          </Select>
          {formGestion.categoria && !loadingInstructorasFiltradas && instructorasFiltradas.length === 0 && (
            <div style={{ color: '#faad14', fontSize: '12px', marginTop: '-8px' }}>
              No hay instructoras con categoría {formGestion.categoria} asignadas a este punto de venta.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;
