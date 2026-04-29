import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchBukEmpleadoByDocumento } from '../../../services/bukEmpleadosQuery';
import { ADMIN_PANEL_QUERY_KEYS } from '../components/adminPanel.helpers';
import {
  createFechaBloqueada,
  createInscripcionCafe,
  deleteFechaBloqueada,
  fetchCapCafeFechas,
  fetchFestivosColombia,
} from '../services/formularios.service';
import { useInscripcionesQuery } from './useAdminPanelQueries';

const MIN_DOCUMENTO_LENGTH = 6;
const FECHAS_POR_PAGINA = 3;
const ROLES_BLOQUEO_FECHAS = [
  'ANALISTA EVENTOS Y HELADERIAS',
  'JEFE OPERATIVO DE MERCADEO',
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const normalizeDocumento = (value) => String(value || '').replace(/\D/g, '');

const getDatosUsuario = (data) => data?.data || data || {};

const getInitialFormData = (datosCoordinadora) => ({
  fotoBuk: '',
  nombres: '',
  telefono: '',
  cargo: datosCoordinadora.cargo || '',
  puntoVenta: datosCoordinadora.area_nombre || '',
  nombreLider: datosCoordinadora.nombre || '',
});

const getEmployeeFormData = (empleado, datosCoordinadora) => ({
  fotoBuk: empleado?.foto || '',
  nombres: empleado?.nombre || '',
  telefono: empleado?.Celular || '',
  cargo: empleado?.custom_attributes?.['Cargo General'] || empleado?.cargo || '',
  puntoVenta: empleado?.area_nombre || datosCoordinadora.area_nombre || '',
  nombreLider: datosCoordinadora.nombre || '',
});

const getLockedFields = (empleado) => ({
  nombres: Boolean(empleado?.nombre),
  cargo: Boolean(empleado?.custom_attributes?.['Cargo General'] || empleado?.cargo),
  puntoVenta: Boolean(empleado?.area_nombre),
});

const getYearsForHolidays = () => {
  const now = new Date();
  const years = new Set([now.getFullYear()]);

  if (now.getMonth() === 11 && now.getDate() >= 15) {
    years.add(now.getFullYear() + 1);
  }

  return [...years];
};

const getPeriodosAMostrar = () => {
  const hoy = new Date();
  const diaActual = hoy.getDate();
  const mesActual = hoy.getMonth();
  const yearActual = hoy.getFullYear();

  if (diaActual < 15) {
    return [{ year: yearActual, month: mesActual }];
  }

  return [
    { year: yearActual, month: mesActual },
    mesActual === 11
      ? { year: yearActual + 1, month: 0 }
      : { year: yearActual, month: mesActual + 1 },
  ];
};

const buildFechasDisponibles = ({ allowedWeekdays, maxInscripciones, festivos, fechasBloqueadas, inscripcionesPorFecha }) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return getPeriodosAMostrar().flatMap(({ year, month }) => {
    const ultimoDia = new Date(year, month + 1, 0).getDate();
    const fechas = [];

    for (let dia = 1; dia <= ultimoDia; dia += 1) {
      const fecha = new Date(year, month, dia);
      const diaSemana = fecha.getDay();

      if (!allowedWeekdays.includes(diaSemana)) {
        continue;
      }

      const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const fechaObj = new Date(`${fechaStr}T00:00:00`);

      if (fechaObj < hoy) {
        continue;
      }

      const esFestivo = festivos.includes(fechaStr);
      const estaBloqueada = fechasBloqueadas.includes(fechaStr);
      const inscripciones = inscripcionesPorFecha[fechaStr] || 0;

      fechas.push({
        fecha: fechaStr,
        texto: `${DIAS_SEMANA[diaSemana]} ${dia} de ${MESES[month]}`,
        disponible: inscripciones < maxInscripciones && !esFestivo && !estaBloqueada,
        inscripciones,
        esFestivo,
        estaBloqueada,
      });
    }

    return fechas;
  });
};

const getMensajeFechaNoDisponible = (fecha, maxInscripciones) => {
  if (fecha.esFestivo) return 'Esta fecha es un dia festivo y no esta disponible';
  if (fecha.estaBloqueada) return 'Esta fecha esta bloqueada por el administrador';
  return `Esta fecha ya tiene el maximo de inscripciones (${maxInscripciones})`;
};

export function useCafeInscripcionForm({ tipoFormulario, allowedWeekdays, maxInscripciones, coordinadoraData, onSubmit }) {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const datosCoordinadora = useMemo(
    () => getDatosUsuario(coordinadoraData || userData),
    [coordinadoraData, userData]
  );
  const [documento, setDocumento] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [formData, setFormData] = useState(() => getInitialFormData(datosCoordinadora));
  const [camposBloqueados, setCamposBloqueados] = useState({ nombres: false, cargo: false, puntoVenta: false });
  const [fechaInscripcion, setFechaInscripcion] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  const [mostrarInfoEmpleado, setMostrarInfoEmpleado] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPuntosVenta, setMostrarModalPuntosVenta] = useState(false);

  const inscripcionesQuery = useInscripcionesQuery(true);
  const inscripciones = inscripcionesQuery.data || [];

  const holidaysQuery = useQuery({
    queryKey: ['lineas-producto', 'formularios', 'festivos', getYearsForHolidays()],
    queryFn: async () => {
      const responses = await Promise.all(getYearsForHolidays().map((year) => fetchFestivosColombia(year)));
      return responses.flatMap((items) => items.map((item) => item.date));
    },
    staleTime: 12 * 60 * 60 * 1000,
  });

  const fechasBloqueadasQuery = useQuery({
    queryKey: ['lineas-producto', 'formularios', 'fechas-bloqueadas'],
    queryFn: fetchCapCafeFechas,
    staleTime: 5 * 60 * 1000,
    select: (result) => (Array.isArray(result?.data) ? result.data : []),
  });

  const inscripcionesPorFecha = useMemo(() => {
    return inscripciones.reduce((acc, inscripcion) => {
      const fecha = inscripcion.attributes?.fecha;
      if (fecha) acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});
  }, [inscripciones]);

  const fechasBloqueadasRegistros = fechasBloqueadasQuery.data || [];
  const fechasBloqueadas = useMemo(
    () => fechasBloqueadasRegistros.map((item) => item.attributes?.fecha).filter(Boolean),
    [fechasBloqueadasRegistros]
  );

  const fechasDisponibles = useMemo(() => buildFechasDisponibles({
    allowedWeekdays,
    maxInscripciones,
    festivos: holidaysQuery.data || [],
    fechasBloqueadas,
    inscripcionesPorFecha,
  }), [allowedWeekdays, fechasBloqueadas, holidaysQuery.data, inscripcionesPorFecha, maxInscripciones]);

  const puntosVenta = useMemo(() => {
    return [...new Set(inscripciones.map((item) => item.attributes?.pdv).filter(Boolean))].sort();
  }, [inscripciones]);

  const puedeBloquearFechas = ROLES_BLOQUEO_FECHAS.includes(datosCoordinadora.cargo || '');
  const totalPaginas = Math.max(1, Math.ceil(fechasDisponibles.length / FECHAS_POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas - 1);
  const fechasPagina = fechasDisponibles.slice(
    paginaSegura * FECHAS_POR_PAGINA,
    (paginaSegura + 1) * FECHAS_POR_PAGINA
  );

  const buscarEmpleadoMutation = useMutation({
    mutationFn: (doc) => fetchBukEmpleadoByDocumento(queryClient, doc),
    onSuccess: (empleadoData) => {
      setBusquedaRealizada(true);

      if (empleadoData) {
        setEmpleado(empleadoData);
        setFormData(getEmployeeFormData(empleadoData, datosCoordinadora));
        setCamposBloqueados(getLockedFields(empleadoData));
        setMensaje({ texto: 'Empleado encontrado. Completa los campos faltantes si aplica.', tipo: 'success' });
        return;
      }

      setEmpleado(null);
      setFormData(getInitialFormData(datosCoordinadora));
      setCamposBloqueados({ nombres: false, cargo: false, puntoVenta: false });
      setMensaje({ texto: 'No se encontro empleado. Puedes completar los datos manualmente.', tipo: 'warning' });
    },
    onError: () => {
      setBusquedaRealizada(true);
      setEmpleado(null);
      setCamposBloqueados({ nombres: false, cargo: false, puntoVenta: false });
      setMensaje({ texto: 'No fue posible consultar el documento. Puedes completar los datos manualmente.', tipo: 'warning' });
    },
  });

  const crearInscripcionMutation = useMutation({
    mutationFn: createInscripcionCafe,
    onSuccess: () => {
      message.success('Inscripcion guardada con exito');
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.inscripciones });
      limpiarFormulario();
      onSubmit?.({ documento, ...formData, fechaInscripcion, empleadoCompleto: empleado, success: true });
    },
    onError: (error) => {
      setMensaje({ texto: `Error al guardar la inscripcion: ${error?.message || 'Error desconocido'}`, tipo: 'error' });
    },
  });

  const bloquearFechaMutation = useMutation({
    mutationFn: async ({ fecha, estaBloqueada }) => {
      if (estaBloqueada) {
        const registro = fechasBloqueadasRegistros.find((item) => item.attributes?.fecha === fecha);
        if (!registro) throw new Error('Fecha bloqueada no encontrada');
        return deleteFechaBloqueada(registro.id);
      }

      return createFechaBloqueada({ data: { fecha, bloqueadoPor: datosCoordinadora.nombre || '' } });
    },
    onSuccess: (_, variables) => {
      message.success(variables.estaBloqueada ? 'Fecha desbloqueada exitosamente' : 'Fecha bloqueada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['lineas-producto', 'formularios', 'fechas-bloqueadas'] });
    },
    onError: () => message.error('Error de conexion'),
  });

  function limpiarFormulario() {
    setDocumento('');
    setEmpleado(null);
    setBusquedaRealizada(false);
    setFechaInscripcion('');
    setFormData(getInitialFormData(datosCoordinadora));
    setCamposBloqueados({ nombres: false, cargo: false, puntoVenta: false });
    setMensaje({ texto: '', tipo: '' });
    setMostrarModal(false);
    setMostrarInfoEmpleado(true);
  }

  const actions = {
    setDocumento: (value) => {
      setDocumento(normalizeDocumento(value));
      setEmpleado(null);
      setBusquedaRealizada(false);
      setFechaInscripcion('');
      setFormData(getInitialFormData(datosCoordinadora));
      setCamposBloqueados({ nombres: false, cargo: false, puntoVenta: false });
      setMensaje({ texto: '', tipo: '' });
    },
    buscarEmpleado: () => {
      const doc = normalizeDocumento(documento);
      if (doc.length < MIN_DOCUMENTO_LENGTH) {
        setMensaje({ texto: 'Ingresa el documento completo antes de buscar', tipo: 'error' });
        return;
      }
      buscarEmpleadoMutation.mutate(doc);
    },
    updateFormData: (patch) => setFormData((prev) => ({ ...prev, ...patch })),
    setFechaInscripcion,
    setPaginaActual,
    toggleInfoEmpleado: () => setMostrarInfoEmpleado((prev) => !prev),
    limpiarFormulario,
    submit: (event) => {
      event.preventDefault();

      if (documento.length < MIN_DOCUMENTO_LENGTH) {
        setMensaje({ texto: 'Ingresa el documento completo', tipo: 'error' });
        return;
      }

      if (!busquedaRealizada) {
        setMensaje({ texto: 'Busca el documento antes de inscribir', tipo: 'error' });
        return;
      }

      if (!formData.nombres.trim() || !formData.telefono.trim() || !formData.cargo.trim() || !formData.puntoVenta.trim()) {
        setMensaje({ texto: 'Completa nombres, telefono, cargo y punto de venta', tipo: 'error' });
        return;
      }

      if (!fechaInscripcion) {
        setMensaje({ texto: 'Selecciona una fecha de inscripcion', tipo: 'error' });
        return;
      }

      const yaInscrito = inscripciones.some((inscripcion) => {
        const docInscrito = normalizeDocumento(inscripcion.attributes?.documento);
        const fechaInscrita = inscripcion.attributes?.fecha;
        return docInscrito === documento && fechaInscrita === fechaInscripcion;
      });

      if (yaInscrito) {
        message.warning('Este documento ya esta inscrito para la fecha seleccionada. Elige otra fecha.', 5);
        return;
      }

      setMostrarModal(true);
    },
    confirmarGuardado: () => {
      setMostrarModal(false);
      crearInscripcionMutation.mutate({
        data: {
          documento,
          nombre: formData.nombres.trim(),
          telefono: String(formData.telefono).replace(/\D/g, ''),
          cargo: formData.cargo.trim(),
          pdv: formData.puntoVenta.trim(),
          fecha: fechaInscripcion,
          lider: formData.nombreLider,
          tipo_formulario: tipoFormulario,
          foto: formData.fotoBuk || '',
        },
      });
    },
    seleccionarFecha: (fecha) => {
      if (fecha.disponible) {
        setFechaInscripcion(fecha.fecha);
        return;
      }

      setMensaje({ texto: getMensajeFechaNoDisponible(fecha, maxInscripciones), tipo: 'error' });
    },
    bloquearFecha: (fecha, estaBloqueada) => {
      const confirmar = window.confirm(
        estaBloqueada
          ? `Seguro que quieres desbloquear la fecha ${fecha}?`
          : `Seguro que quieres bloquear la fecha ${fecha}?`
      );

      if (confirmar) {
        bloquearFechaMutation.mutate({ fecha, estaBloqueada });
      }
    },
    abrirModalPuntosVenta: () => setMostrarModalPuntosVenta(true),
    cerrarModalPuntosVenta: () => setMostrarModalPuntosVenta(false),
  };

  return {
    state: {
      documento,
      empleado,
      busquedaRealizada,
      mensaje,
      formData,
      camposBloqueados,
      fechaInscripcion,
      paginaActual: paginaSegura,
      fechasPorPagina: FECHAS_POR_PAGINA,
      fechasDisponibles,
      fechasPagina,
      totalPaginas,
      mostrarInfoEmpleado,
      mostrarModal,
      mostrarModalPuntosVenta,
      puntosVenta,
      puedeBloquearFechas,
      periodosAMostrar: getPeriodosAMostrar(),
    },
    loading: {
      empleado: buscarEmpleadoMutation.isPending,
      formulario: crearInscripcionMutation.isPending,
      fechas: holidaysQuery.isFetching || fechasBloqueadasQuery.isFetching || inscripcionesQuery.isFetching,
      bloqueoFecha: bloquearFechaMutation.isPending,
    },
    actions,
  };
}
