import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  ADMIN_PANEL_QUERY_KEYS,
  buildInscripcionesExportRows,
  filterInscripciones,
  formatIsoDate,
  getCedulasFromRows,
  getUniqueDatesDesc,
  getUniqueSortedValues,
  INITIAL_FILTROS,
  mapCapCafeItem,
} from '../components/adminPanel.helpers';
import { updateInscripcionCafe } from '../services/adminPanel.service';
import { useInscripcionesQuery } from './useAdminPanelQueries';
import { useEmpleadoFotos } from './useEmpleadoFotos';

const DOCUMENTO_AUTORIZADO = '35512822';

const normalizarDocumento = (valor) => String(valor || '').replace(/\D/g, '');

const writeWorkbook = (rows) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');
  XLSX.writeFile(wb, `Inscripciones_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export function useAsistenciaPanelController() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData, logout } = useAuth();
  const [filtros, setFiltros] = useState(INITIAL_FILTROS);
  const datosUsuario = userData?.data || userData || {};
  const nombreUsuario = datosUsuario?.nombre || '';
  const documentoUsuario = datosUsuario?.document_number || '';
  const tieneAcceso = normalizarDocumento(documentoUsuario) === normalizarDocumento(DOCUMENTO_AUTORIZADO);

  const inscripcionesQuery = useInscripcionesQuery(tieneAcceso);
  const inscripciones = useMemo(
    () => (inscripcionesQuery.data || []).map(mapCapCafeItem),
    [inscripcionesQuery.data]
  );
  const dataFiltrada = useMemo(
    () => filterInscripciones(inscripciones, filtros, 'todos'),
    [filtros, inscripciones]
  );
  const cedulasVisibles = useMemo(() => getCedulasFromRows(dataFiltrada), [dataFiltrada]);
  const fotosCache = useEmpleadoFotos(cedulasVisibles);

  const cambiarAsistenciaMutation = useMutation({
    mutationFn: ({ id, confirmado }) => updateInscripcionCafe(id, { data: { confirmado } }),
    onSuccess: (_, variables) => {
      message.success(`Asistencia actualizada: ${variables.confirmado ? 'Asistio' : 'No asistio'}`);
      queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.inscripciones });
    },
    onError: () => message.error('Error al actualizar la asistencia'),
  });

  const options = useMemo(() => ({
    puntosVenta: getUniqueSortedValues(inscripciones, 'puntoVenta').map((pdv) => ({ label: pdv, value: pdv })),
    fechas: getUniqueDatesDesc(inscripciones).map((fecha) => ({ label: formatIsoDate(fecha), value: fecha })),
  }), [inscripciones]);

  return {
    user: { nombreUsuario },
    permissions: { tieneAcceso },
    data: { inscripciones, dataFiltrada, fotosCache, options },
    filters: filtros,
    loading: { inscripciones: inscripcionesQuery.isFetching },
    actions: {
      logout,
      volverMenu: () => navigate('/menu'),
      updateFiltros: (patch) => setFiltros((prev) => ({ ...prev, ...patch })),
      limpiarFiltros: () => setFiltros(INITIAL_FILTROS),
      cambiarAsistencia: (id, confirmado) => cambiarAsistenciaMutation.mutate({ id, confirmado }),
      exportarExcel: () => {
        if (dataFiltrada.length === 0) {
          message.warning('No hay datos para exportar');
          return;
        }
        writeWorkbook(buildInscripcionesExportRows(dataFiltrada));
        message.success('Archivo Excel exportado exitosamente');
      },
    },
  };
}
