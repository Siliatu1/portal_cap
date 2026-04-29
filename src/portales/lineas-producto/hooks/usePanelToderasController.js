import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  ADMIN_PANEL_QUERY_KEYS,
  buildToderaExportRows,
  filterEvaluacionesTodera,
  mapToderaItem,
} from '../components/adminPanel.helpers';
import { updateEvaluacionTodera } from '../services/adminPanel.service';
import { useEvaluacionesToderaQuery } from './useAdminPanelQueries';

const DOCUMENTOS_AUTORIZADOS = [
  '30386710', '52395525', '52422155', '52525496', '1020758053',
  '1077845053', '39276283', '35416150', '22797275', '49792488',
  '52701678', '28549413', '1019005012', '49606652', '53075347',
  '1079605138', '21032351', '52439552', '52962339', '1116547316',
  '23876197', '66681589', '52799048', '1075538331', '49776128',
  '37550615', '37339972', '1019073170',
];

const INITIAL_FILTROS_TODERAS = {
  cedula: '',
  puntoVenta: '',
  categoria: '',
  fecha: '',
};

const normalizarTexto = (valor) => String(valor || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const writeWorkbook = (rows) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Evaluacion_Todera');
  XLSX.writeFile(wb, `Evaluacion_Todera_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const filtrarPorLider = (items, nombreUsuario) => {
  const usuarioNormalizado = normalizarTexto(nombreUsuario);

  if (!usuarioNormalizado) {
    return items;
  }

  return items.filter((item) => normalizarTexto(item.nombreLider) === usuarioNormalizado);
};

const calcularEstadisticas = (items) => ({
  totalInscritos: items.length,
  evaluados: items.filter((item) => item.evaluado === true).length,
  pendientes: items.filter((item) => item.evaluado === null).length,
  noEvaluados: items.filter((item) => item.evaluado === false).length,
});

export function usePanelToderasController() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData, logout } = useAuth();
  const datosUsuario = userData?.data || userData || {};
  const nombreUsuario = datosUsuario.nombre || '';
  const documentoUsuario = datosUsuario.document_number || '';
  const tieneAcceso = DOCUMENTOS_AUTORIZADOS.includes(String(documentoUsuario).trim());
  const [filtros, setFiltros] = useState(INITIAL_FILTROS_TODERAS);
  const [modalVisible, setModalVisible] = useState(false);
  const [observacionActual, setObservacionActual] = useState('');
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const evaluacionesQuery = useEvaluacionesToderaQuery(tieneAcceso);
  const inscripciones = useMemo(
    () => (evaluacionesQuery.data || []).map(mapToderaItem),
    [evaluacionesQuery.data]
  );
  const dataFiltrada = useMemo(() => {
    const propias = filtrarPorLider(inscripciones, nombreUsuario);
    return filterEvaluacionesTodera(propias, filtros);
  }, [filtros, inscripciones, nombreUsuario]);
  const estadisticas = useMemo(() => calcularEstadisticas(inscripciones), [inscripciones]);

  const updateToderaMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEvaluacionTodera(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.evaluacionesTodera });
    },
    onError: () => message.error('Error al actualizar la evaluacion'),
  });

  return {
    user: { nombreUsuario },
    permissions: { tieneAcceso },
    data: { inscripciones, dataFiltrada, estadisticas },
    filters: filtros,
    modal: { modalVisible, observacionActual, registroSeleccionado },
    loading: { evaluaciones: evaluacionesQuery.isFetching },
    actions: {
      logout,
      volverMenu: () => navigate('/portal/menu'),
      updateFiltros: (patch) => setFiltros((prev) => ({ ...prev, ...patch })),
      limpiarFiltros: () => setFiltros(INITIAL_FILTROS_TODERAS),
      cambiarEvaluacion: (id, estado) => {
        updateToderaMutation.mutate(
          { id, payload: { data: { estado } } },
          { onSuccess: () => message.success(`Estado actualizado: ${estado ? 'Evaluado' : 'No evaluado'}`) }
        );
      },
      abrirModalObservacion: (registro) => {
        setRegistroSeleccionado(registro);
        setObservacionActual(registro.observacion || '');
        setModalVisible(true);
      },
      cerrarModalObservacion: () => {
        setModalVisible(false);
        setObservacionActual('');
        setRegistroSeleccionado(null);
      },
      updateObservacion: setObservacionActual,
      guardarObservacion: () => {
        if (!registroSeleccionado) return;

        updateToderaMutation.mutate(
          { id: registroSeleccionado.id, payload: { data: { observacion: observacionActual } } },
          {
            onSuccess: () => {
              message.success('Observacion guardada exitosamente');
              setModalVisible(false);
              setObservacionActual('');
              setRegistroSeleccionado(null);
            },
          }
        );
      },
      exportarExcel: () => {
        if (dataFiltrada.length === 0) {
          message.warning('No hay datos para exportar');
          return;
        }
        writeWorkbook(buildToderaExportRows(dataFiltrada));
        message.success('Archivo Excel exportado exitosamente');
      },
    },
  };
}
