import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  createInstructora,
  deleteEvaluacionTodera,
  deleteInscripcionCafe,
  fetchCapPdvById,
  saveCapInstructora,
  saveCapPdv,
} from '../services/adminPanel.service';
import {
  ADMIN_PANEL_QUERY_KEYS,
  buildInscripcionesExportRows,
  buildNuevaInstructoraPayload,
  buildToderaExportRows,
  filterDataByRole,
  filterEvaluacionesTodera,
  filterGestionInstructoras,
  filterInscripciones,
  getCategoriaField,
  getCedulasFromRows,
  getPdvOptionsFromGestion,
  getRoleFlags,
  getStrapiJsonHeaders,
  getUniqueDatesDesc,
  getUniqueSortedValues,
  getVistaInicial,
  INITIAL_FILTROS,
  INITIAL_FILTROS_GESTION,
  INITIAL_FILTROS_TODERA,
  INITIAL_FORM_GESTION,
  INITIAL_FORM_NUEVA_INSTRUCTORA,
  mapCapCafeItem,
  mapToderaItem,
  obtenerInstructorasTodera,
  puedeEliminarPorCargo,
  validateNuevaInstructora,
} from '../components/adminPanel.helpers';
import {
  useEvaluacionesToderaQuery,
  useGestionInstructorasQuery,
  useInscripcionesQuery,
  useInstructorasPorCategoriaQuery,
  useInstructorasQuery,
} from './useAdminPanelQueries';
import { useEmpleadoFotos } from './useEmpleadoFotos';

const writeWorkbook = (rows, sheetName, fileName) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
};

export function useAdminPanelController() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData, logout } = useAuth();
  const strapiToken = import.meta.env.VITE_STRAPI_TOKEN;
  const datosUsuario = userData?.data || userData || {};
  const cargoUsuario = datosUsuario.cargo || '';
  const puntoVentaUsuarioActual = datosUsuario.area_nombre || '';
  const nombreUsuario = datosUsuario.nombre || '';
  const roleFlags = useMemo(() => getRoleFlags(cargoUsuario), [cargoUsuario]);
  const vistaInicial = useMemo(() => getVistaInicial(cargoUsuario), [cargoUsuario]);

  const [vistaActual, setVistaActual] = useState(vistaInicial);
  const [seccionActiva, setSeccionActiva] = useState('escuela_cafe');
  const [filtros, setFiltros] = useState(INITIAL_FILTROS);
  const [filtrosTodera, setFiltrosTodera] = useState(INITIAL_FILTROS_TODERA);
  const [filtrosGestionInstructoras, setFiltrosGestionInstructoras] = useState(INITIAL_FILTROS_GESTION);
  const [modalGestionVisible, setModalGestionVisible] = useState(false);
  const [modalNuevaInstructoraVisible, setModalNuevaInstructoraVisible] = useState(false);
  const [formGestion, setFormGestion] = useState(INITIAL_FORM_GESTION);
  const [formNuevaInstructora, setFormNuevaInstructora] = useState(INITIAL_FORM_NUEVA_INSTRUCTORA);

  const panelEnabled = vistaActual === 'panel';
  const roleContext = useMemo(() => ({
    puedeVerTodo: roleFlags.puedeVerTodo,
    esRolHeladeria: roleFlags.esRolHeladeria,
    esRolPuntoVenta: roleFlags.esRolPuntoVenta,
    puntoVentaUsuarioActual,
  }), [puntoVentaUsuarioActual, roleFlags.esRolHeladeria, roleFlags.esRolPuntoVenta, roleFlags.puedeVerTodo]);

  const inscripcionesQuery = useInscripcionesQuery(panelEnabled);
  const evaluacionesToderaQuery = useEvaluacionesToderaQuery(panelEnabled && roleFlags.puedeVerAmbasTablas);
  const gestionInstructorasQuery = useGestionInstructorasQuery(panelEnabled && roleFlags.esAccesoDual);
  const instructorasQuery = useInstructorasQuery(panelEnabled && roleFlags.esAccesoDual);
  const instructorasPorCategoriaQuery = useInstructorasPorCategoriaQuery(
    formGestion.categoria,
    modalGestionVisible && Boolean(formGestion.categoria)
  );

  const inscripciones = useMemo(() => {
    const data = (inscripcionesQuery.data || []).map(mapCapCafeItem);
    return filterDataByRole(data, roleContext);
  }, [inscripcionesQuery.data, roleContext]);

  const inscripcionesTodera = useMemo(() => {
    const data = (evaluacionesToderaQuery.data || []).map(mapToderaItem);
    return filterDataByRole(data, roleContext);
  }, [evaluacionesToderaQuery.data, roleContext]);

  const gestionInstructoras = gestionInstructorasQuery.data || [];
  const instructorasDisponibles = instructorasQuery.data || [];
  const instructorasFiltradas = instructorasPorCategoriaQuery.data || [];

  const dataFiltrada = useMemo(
    () => filterInscripciones(inscripciones, filtros, 'todos'),
    [filtros, inscripciones]
  );

  const dataFiltradaTodera = useMemo(
    () => filterEvaluacionesTodera(inscripcionesTodera, filtrosTodera),
    [filtrosTodera, inscripcionesTodera]
  );

  const dataFiltradaGestionInstructoras = useMemo(
    () => filterGestionInstructoras(gestionInstructoras, filtrosGestionInstructoras),
    [filtrosGestionInstructoras, gestionInstructoras]
  );

  const cedulasVisibles = useMemo(
    () => getCedulasFromRows([...dataFiltrada, ...dataFiltradaTodera]),
    [dataFiltrada, dataFiltradaTodera]
  );
  const fotosCache = useEmpleadoFotos(cedulasVisibles);

  const filterOptions = useMemo(() => ({
    puntosVentaInscripciones: getUniqueSortedValues(inscripciones, 'puntoVenta'),
    fechasInscripciones: getUniqueDatesDesc(inscripciones),
    puntosVentaTodera: getUniqueSortedValues(inscripcionesTodera, 'puntoVenta'),
    fechasTodera: getUniqueDatesDesc(inscripcionesTodera),
    instructorasTodera: obtenerInstructorasTodera(inscripcionesTodera),
    puntosVentaGestion: getPdvOptionsFromGestion(gestionInstructoras),
  }), [gestionInstructoras, inscripciones, inscripcionesTodera]);

  const puedeEliminar = useCallback(() => {
    if (!userData) return false;
    return puedeEliminarPorCargo(cargoUsuario);
  }, [cargoUsuario, userData]);

  const deleteInscripcionMutation = useMutation({
    mutationFn: deleteInscripcionCafe,
    onSuccess: () => {
      message.success('Inscripcion eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.inscripciones });
    },
    onError: () => message.error('Error de conexion al eliminar'),
  });

  const deleteToderaMutation = useMutation({
    mutationFn: deleteEvaluacionTodera,
    onSuccess: () => {
      message.success('Evaluacion eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.evaluacionesTodera });
    },
    onError: () => message.error('Error de conexion al eliminar'),
  });

  const crearInstructoraMutation = useMutation({
    mutationFn: (payload) => createInstructora(payload, getStrapiJsonHeaders(strapiToken)),
    onSuccess: () => {
      message.success('Instructora creada exitosamente');
      setModalNuevaInstructoraVisible(false);
      setFormNuevaInstructora(INITIAL_FORM_NUEVA_INSTRUCTORA);
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.instructoras });
      if (formGestion.categoria) {
        queryClient.invalidateQueries({
          queryKey: ADMIN_PANEL_QUERY_KEYS.instructorasPorCategoria(formGestion.categoria),
        });
      }
    },
    onError: (error) => message.error(error?.message || 'Error al crear instructora'),
  });

  const agregarInstructoraMutation = useMutation({
    mutationFn: async ({ pdvId, instructoraId, categoria }) => {
      const pdvResult = await fetchCapPdvById(pdvId, 'populate=cap_instructoras');
      const instructorasActuales = pdvResult?.data?.attributes?.cap_instructoras?.data || [];
      const idsActuales = instructorasActuales.map((item) => item.id);
      const instructoraIdNumber = Number(instructoraId);
      const idsActualizados = idsActuales.includes(instructoraIdNumber)
        ? idsActuales
        : [...idsActuales, instructoraIdNumber];

      await saveCapPdv(pdvId, { data: { cap_instructoras: idsActualizados } });
      await saveCapInstructora(instructoraIdNumber, {
        data: { [getCategoriaField(categoria)]: true },
      });
    },
    onSuccess: () => {
      message.success('Instructora agregada exitosamente');
      setModalGestionVisible(false);
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.gestionInstructoras });
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.instructoras });
    },
    onError: (error) => message.error(error?.message || 'Error al agregar instructora'),
  });

  const eliminarInstructoraMutation = useMutation({
    mutationFn: async ({ pdvId, instructoraId }) => {
      const pdvData = await fetchCapPdvById(pdvId, 'populate=cap_instructoras');
      const instructorasActuales = pdvData?.data?.attributes?.cap_instructoras?.data || [];
      const instructorasRestantes = instructorasActuales
        .filter((item) => item.id !== instructoraId)
        .map((item) => item.id);

      await saveCapPdv(pdvId, { data: { cap_instructoras: instructorasRestantes } });
    },
    onSuccess: () => {
      message.success('Instructora eliminada del punto de venta');
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.gestionInstructoras });
    },
    onError: (error) => message.error(error?.message || 'Error al eliminar instructora'),
  });

  const abrirFormulario = useCallback((tipo) => {
    navigate(`/portal/lineas-producto/formulario/${tipo}`);
  }, [navigate]);

  const actions = useMemo(() => ({
    navigateBack: () => navigate(-1),
    logout,
    registrarPersona: () => {
      if (roleFlags.esRolHeladeria || roleFlags.esAccesoDual) {
        abrirFormulario('heladeria');
        return;
      }

      if (roleFlags.esRolPuntoVenta) {
        setVistaActual('seleccion_menu');
        return;
      }

      abrirFormulario('heladeria');
    },
    abrirFormularioPuntoVenta: () => abrirFormulario('punto_venta'),
    abrirFormularioEscuelaCafe: () => abrirFormulario('heladeria'),
    abrirFormularioEvaluacionTodera: () => abrirFormulario('evaluacion_todera'),
    volverDesdeSeleccion: () => {
      if (roleFlags.esRolPuntoVenta) {
        logout();
        return;
      }
      setVistaActual('panel');
    },
    verMiPanel: () => setVistaActual('panel'),
    setSeccionActiva,
    refreshInscripciones: () => inscripcionesQuery.refetch(),
    refreshTodera: () => evaluacionesToderaQuery.refetch(),
    refreshGestionInstructoras: () => gestionInstructorasQuery.refetch(),
    limpiarFiltros: () => setFiltros(INITIAL_FILTROS),
    limpiarFiltrosTodera: () => setFiltrosTodera(INITIAL_FILTROS_TODERA),
    limpiarFiltrosGestionInstructoras: () => setFiltrosGestionInstructoras(INITIAL_FILTROS_GESTION),
    updateFiltros: (patch) => setFiltros((prev) => ({ ...prev, ...patch })),
    updateFiltrosTodera: (patch) => setFiltrosTodera((prev) => ({ ...prev, ...patch })),
    updateFiltrosGestion: (patch) => setFiltrosGestionInstructoras((prev) => ({ ...prev, ...patch })),
    abrirModalGestionInstructoras: (pdvId = '', categoria = '') => {
      setFormGestion({ pdvId: String(pdvId), categoria, instructoraId: '' });
      setModalGestionVisible(true);
    },
    cerrarModalGestionInstructoras: () => setModalGestionVisible(false),
    abrirModalNuevaInstructora: () => setModalNuevaInstructoraVisible(true),
    cerrarModalNuevaInstructora: () => {
      setModalNuevaInstructoraVisible(false);
      setFormNuevaInstructora(INITIAL_FORM_NUEVA_INSTRUCTORA);
    },
    updateFormGestion: (patch) => setFormGestion((prev) => ({ ...prev, ...patch })),
    updateFormNuevaInstructora: (patch) => setFormNuevaInstructora((prev) => ({ ...prev, ...patch })),
    crearInstructora: () => {
      const validation = validateNuevaInstructora(formNuevaInstructora);
      if (!validation.valid) {
        message.warning(validation.message);
        return;
      }
      crearInstructoraMutation.mutate(buildNuevaInstructoraPayload(formNuevaInstructora));
    },
    agregarInstructoraAPuntoVenta: () => {
      if (!formGestion.pdvId || !formGestion.instructoraId || !formGestion.categoria) {
        message.warning('Completa punto de venta, categoria e instructora');
        return;
      }
      agregarInstructoraMutation.mutate(formGestion);
    },
    eliminarInstructoraDePuntoVenta: (pdvId, instructoraId) => {
      if (!pdvId || !instructoraId) {
        message.warning('No hay una instructora valida para eliminar');
        return;
      }
      eliminarInstructoraMutation.mutate({ pdvId, instructoraId });
    },
    eliminarInscripcion: (id) => deleteInscripcionMutation.mutate(id),
    eliminarTodera: (id) => deleteToderaMutation.mutate(id),
    exportarInscripciones: () => {
      if (dataFiltrada.length === 0) {
        message.warning('No hay datos para exportar');
        return;
      }
      writeWorkbook(
        buildInscripcionesExportRows(dataFiltrada),
        'Inscripciones',
        `Inscripciones${new Date().toISOString().split('T')[0]}.xlsx`
      );
      message.success('Archivo Excel exportado exitosamente');
    },
    exportarTodera: () => {
      if (dataFiltradaTodera.length === 0) {
        message.warning('No hay datos para exportar');
        return;
      }
      writeWorkbook(
        buildToderaExportRows(dataFiltradaTodera),
        'Evaluaciones Todera',
        `EvaluacionesTodera_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      message.success('Archivo Excel exportado exitosamente');
    },
  }), [
    abrirFormulario,
    agregarInstructoraMutation,
    crearInstructoraMutation,
    dataFiltrada,
    dataFiltradaTodera,
    deleteInscripcionMutation,
    deleteToderaMutation,
    eliminarInstructoraMutation,
    evaluacionesToderaQuery,
    formGestion,
    formNuevaInstructora,
    gestionInstructorasQuery,
    inscripcionesQuery,
    logout,
    navigate,
    queryClient,
    roleFlags.esAccesoDual,
    roleFlags.esRolHeladeria,
    roleFlags.esRolPuntoVenta,
  ]);

  return {
    screen: {
      vistaActual,
      seccionActiva,
    },
    user: {
      userData,
      nombreUsuario,
      cargoUsuario,
    },
    permissions: {
      ...roleFlags,
      puedeEliminar,
      puedeVerTodera: roleFlags.puedeVerAmbasTablas,
      puedeGestionarInstructoras: roleFlags.esAccesoDual,
      puedeVerFiltroInstructora: roleFlags.puedeVerTodo,
    },
    data: {
      inscripciones,
      dataFiltrada,
      inscripcionesTodera,
      dataFiltradaTodera,
      gestionInstructoras,
      dataFiltradaGestionInstructoras,
      instructorasDisponibles,
      instructorasFiltradas,
      fotosCache,
      filterOptions,
    },
    loading: {
      inscripciones: inscripcionesQuery.isFetching,
      todera: evaluacionesToderaQuery.isFetching,
      gestionInstructoras: gestionInstructorasQuery.isFetching,
      instructorasDisponibles: instructorasQuery.isFetching,
      instructorasFiltradas: instructorasPorCategoriaQuery.isFetching,
      nuevaInstructora: crearInstructoraMutation.isPending,
      agregarInstructora: agregarInstructoraMutation.isPending,
    },
    forms: {
      filtros,
      filtrosTodera,
      filtrosGestionInstructoras,
      modalGestionVisible,
      modalNuevaInstructoraVisible,
      formGestion,
      formNuevaInstructora,
    },
    actions,
  };
}
