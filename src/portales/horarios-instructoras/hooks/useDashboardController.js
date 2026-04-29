import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { updateHorario } from '../services/horariosInstructoras.service';
import {
  buildBaseUser,
  buildEditFormData,
  buildHorarioPayload,
  buildHorariosState,
  buildSemanaQuery,
  extractPuntosVenta,
  INITIAL_MODAL_FORM,
  MOTIVOS_BASICOS,
  validateEditForm,
} from '../components/dashboard.helpers';
import {
  HORARIOS_QUERY_KEYS,
  useHorariosQuery,
  useInstructorasQuery,
} from './useHorariosInstructorasQueries';

export function useDashboardController() {
  const queryClient = useQueryClient();
  const { userData, logout } = useAuth();
  const user = useMemo(() => buildBaseUser(userData || {}), [userData]);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [semanaPreview, setSemanaPreview] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [showMoreMotivos, setShowMoreMotivos] = useState(false);
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [formDataModal, setFormDataModal] = useState(INITIAL_MODAL_FORM);

  const semana = useMemo(() => buildSemanaQuery(semanaOffset), [semanaOffset]);
  const pdvQuery = `filters[documento][$eq]=${user.documento}&populate[cap_pdvs]=*`;
  const puntosVentaQuery = useInstructorasQuery(pdvQuery, Boolean(user.documento));
  const puntosVenta = useMemo(
    () => extractPuntosVenta(puntosVentaQuery.data || [], user.documento),
    [puntosVentaQuery.data, user.documento]
  );

  const horariosQueryString = user.documento
    ? `filters[documento][$eq]=${user.documento}&filters[fecha][$gte]=${semana.fechaInicioStr}&filters[fecha][$lte]=${semana.fechaFinStr}&pagination[pageSize]=40000`
    : '';
  const horariosQuery = useHorariosQuery(
    horariosQueryString,
    Boolean(user.documento),
    (response) => buildHorariosState(response?.data, semana)
  );

  const horariosDetalles = horariosQuery.data?.detalles || [];
  const horariosData = horariosQuery.data?.filas || [];
  const infoSemana = horariosQuery.data?.infoSemana || {
    numero: semana.numeroSemana,
    fechaInicio: semana.lunes,
    fechaFin: semana.domingo,
  };
  const totalHoras = useMemo(
    () => horariosData.reduce((sum, item) => sum + item.totalHoras, 0),
    [horariosData]
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateHorario(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HORARIOS_QUERY_KEYS.horarios(horariosQueryString) });
    },
  });

  const cerrarModal = () => {
    setModalEditar(false);
    setEventoEditar(null);
    setFormDataModal(INITIAL_MODAL_FORM);
    setShowMoreMotivos(false);
  };

  const actions = {
    logout,
    setShowProfileModal,
    setShowPreviewModal,
    setFilaExpandida,
    setShowMoreMotivos,
    cambiarSemana: (delta) => {
      setSemanaOffset((prev) => prev + delta);
      setFilaExpandida(null);
    },
    verSemana: (semanaRecord) => {
      setSemanaPreview(semanaRecord);
      setShowPreviewModal(true);
    },
    editarActividad: (detalle) => {
      const { formData, showMoreMotivos: expanded } = buildEditFormData(detalle, puntosVenta);
      setFormDataModal(formData);
      setShowMoreMotivos(expanded);
      setEventoEditar(detalle);
      setModalEditar(true);
    },
    cerrarModal,
    fieldChange: (field, value) => setFormDataModal((prev) => ({ ...prev, [field]: value })),
    selectMotivo: (motivo) => {
      setFormDataModal((prev) => ({
        ...prev,
        motivo,
        detalleCubrir: motivo !== 'cubrir_puesto' ? '' : prev.detalleCubrir,
        detalleOtro: motivo !== 'otro' ? '' : prev.detalleOtro,
      }));

      if (MOTIVOS_BASICOS.includes(motivo)) {
        setShowMoreMotivos(false);
      }
    },
    guardarEdicion: async () => {
      if (!eventoEditar) return;

      const validationError = validateEditForm(formDataModal);
      if (validationError) {
        alert(validationError);
        return;
      }

      const { payload } = buildHorarioPayload(formDataModal, eventoEditar, user.documento, puntosVenta);

      try {
        await updateMutation.mutateAsync({ id: eventoEditar.apiId, payload });
        cerrarModal();
        alert('Actividad actualizada exitosamente');
      } catch {
        alert('Error al guardar los cambios. Por favor intenta nuevamente.');
      }
    },
    setFotoPerfilError: () => {
      queryClient.setQueryData(HORARIOS_QUERY_KEYS.instructoras(pdvQuery), (current) => current);
    },
  };

  return {
    user,
    data: {
      puntosVenta,
      horariosDetalles,
      horariosData,
      infoSemana,
      totalHoras,
    },
    ui: {
      showProfileModal,
      showPreviewModal,
      semanaPreview,
      modalEditar,
      showMoreMotivos,
      filaExpandida,
      formDataModal,
    },
    loading: {
      horarios: horariosQuery.isFetching,
      puntosVenta: puntosVentaQuery.isFetching,
      guardando: updateMutation.isPending,
    },
    actions,
  };
}
