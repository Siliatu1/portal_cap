import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchBukEmpleadoByDocumento } from '../../../services/bukEmpleadosQuery';
import { ADMIN_PANEL_QUERY_KEYS } from '../components/adminPanel.helpers';
import {
  createEvaluacionTodera,
  fetchPdvInstructorasPorCategoria,
} from '../services/formularios.service';

const MIN_DOCUMENTO_LENGTH = 6;

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

const buildInstructoraQuery = (puntoVenta, categoria) => {
  const pdvEncoded = encodeURIComponent(puntoVenta || '');
  const campoCategoria = String(categoria || '').toLowerCase();
  return `filters[cap_instructoras][${campoCategoria}][$eq]=true&filters[nombre][$eq]=${pdvEncoded}&populate[cap_instructoras][filters][${campoCategoria}][$eq]=true`;
};

const findInstructoraName = (response) => {
  const pdvData = response?.data?.[0];
  const instructora = pdvData?.attributes?.cap_instructoras?.data?.[0];
  return instructora?.attributes?.Nombre || instructora?.attributes?.nombre || '';
};

export function useEvaluacionToderaForm({ coordinadoraData, onSubmit }) {
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
  const [categoria, setCategoria] = useState('');
  const [cargoEvaluar, setCargoEvaluar] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const instructoraQuery = useQuery({
    queryKey: ['lineas-producto', 'formularios', 'instructora-pdv', formData.puntoVenta, categoria],
    queryFn: () => fetchPdvInstructorasPorCategoria(buildInstructoraQuery(formData.puntoVenta, categoria)),
    enabled: Boolean(busquedaRealizada && formData.puntoVenta && categoria),
    staleTime: 5 * 60 * 1000,
    select: findInstructoraName,
  });

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

  const crearEvaluacionMutation = useMutation({
    mutationFn: createEvaluacionTodera,
    onSuccess: (response) => {
      message.success('Evaluacion registrada con exito');
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.evaluacionesTodera });
      limpiarFormulario();
      onSubmit?.({ success: true, data: response?.data });
    },
    onError: (error) => {
      message.error(error?.message || 'Error al guardar la evaluacion');
    },
  });

  function limpiarFormulario() {
    setDocumento('');
    setEmpleado(null);
    setBusquedaRealizada(false);
    setCategoria('');
    setCargoEvaluar('');
    setFormData(getInitialFormData(datosCoordinadora));
    setCamposBloqueados({ nombres: false, cargo: false, puntoVenta: false });
    setMensaje({ texto: '', tipo: '' });
    setMostrarModal(false);
  }

  const instructora = instructoraQuery.data || '';

  const actions = {
    setDocumento: (value) => {
      setDocumento(normalizeDocumento(value));
      setEmpleado(null);
      setBusquedaRealizada(false);
      setCategoria('');
      setCargoEvaluar('');
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
    setCategoria,
    setCargoEvaluar,
    limpiarFormulario,
    submit: (event) => {
      event.preventDefault();

      if (documento.length < MIN_DOCUMENTO_LENGTH) {
        message.error('Ingresa el documento completo');
        return;
      }

      if (!busquedaRealizada) {
        message.error('Busca el documento antes de registrar la evaluacion');
        return;
      }

      if (!formData.nombres.trim() || !formData.telefono.trim() || !formData.cargo.trim() || !formData.puntoVenta.trim()) {
        message.error('Completa nombres, telefono, cargo y punto de venta');
        return;
      }

      if (!categoria) {
        message.error('Selecciona una categoria');
        return;
      }

      if (!cargoEvaluar) {
        message.error('Selecciona el cargo a evaluar');
        return;
      }

      if (!instructora) {
        message.warning('No se encontro instructora asignada automaticamente');
      }

      setMostrarModal(true);
    },
    confirmarGuardado: () => {
      const categoriaEnMayusculas = categoria.toUpperCase();
      setMostrarModal(false);
      crearEvaluacionMutation.mutate({
        data: {
          Nombre: formData.nombres.trim(),
          documento,
          telefono: String(formData.telefono).replace(/\D/g, ''),
          pdv: formData.puntoVenta.trim(),
          lider: instructora || formData.nombreLider || '',
          foto: formData.fotoBuk || '',
          cargo: cargoEvaluar,
          cargo_empleado: formData.cargo.trim(),
          cargo_evaluar: cargoEvaluar,
          cargoEvaluar,
          fecha: new Date().toISOString().split('T')[0],
          categoria: categoriaEnMayusculas,
        },
      });
    },
    cancelarConfirmacion: () => setMostrarModal(false),
  };

  return {
    state: {
      documento,
      empleado,
      busquedaRealizada,
      mensaje,
      formData,
      camposBloqueados,
      categoria,
      cargoEvaluar,
      instructora,
      mostrarModal,
    },
    loading: {
      empleado: buscarEmpleadoMutation.isPending,
      instructora: instructoraQuery.isFetching,
      formulario: crearEvaluacionMutation.isPending,
    },
    actions,
  };
}
