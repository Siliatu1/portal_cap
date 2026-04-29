import { useQuery } from '@tanstack/react-query';
import {
  ADMIN_PANEL_QUERY_KEYS,
  buildGestionInstructorasRows,
  mapInstructoraDisponible,
} from '../components/adminPanel.helpers';
import {
  fetchCapCafes,
  fetchCapInstructoras,
  fetchCapPdvsPopulated,
  fetchCapPdvsWithInstructoras,
  fetchCapToderas,
} from '../services/adminPanel.service';

const ADMIN_PANEL_STALE_TIME_MS = 5 * 60 * 1000;

export function useInscripcionesQuery(enabled) {
  return useQuery({
    queryKey: ADMIN_PANEL_QUERY_KEYS.inscripciones,
    queryFn: fetchCapCafes,
    enabled,
    staleTime: ADMIN_PANEL_STALE_TIME_MS,
    select: (result) => (Array.isArray(result?.data) ? result.data : []),
  });
}

export function useEvaluacionesToderaQuery(enabled) {
  return useQuery({
    queryKey: ADMIN_PANEL_QUERY_KEYS.evaluacionesTodera,
    queryFn: fetchCapToderas,
    enabled,
    staleTime: ADMIN_PANEL_STALE_TIME_MS,
    select: (result) => (Array.isArray(result?.data) ? result.data : []),
  });
}

export function useGestionInstructorasQuery(enabled) {
  return useQuery({
    queryKey: ADMIN_PANEL_QUERY_KEYS.gestionInstructoras,
    queryFn: async () => {
      try {
        return await fetchCapPdvsWithInstructoras();
      } catch {
        return fetchCapPdvsPopulated();
      }
    },
    enabled,
    staleTime: ADMIN_PANEL_STALE_TIME_MS,
    select: (result) => buildGestionInstructorasRows(Array.isArray(result?.data) ? result.data : []),
  });
}

export function useInstructorasQuery(enabled) {
  return useQuery({
    queryKey: ADMIN_PANEL_QUERY_KEYS.instructoras,
    queryFn: () => fetchCapInstructoras(),
    enabled,
    staleTime: ADMIN_PANEL_STALE_TIME_MS,
    select: (result) => (Array.isArray(result?.data) ? result.data.map(mapInstructoraDisponible) : []),
  });
}

export function useInstructorasPorCategoriaQuery(categoria, enabled) {
  const campo = String(categoria || '').toLowerCase();

  return useQuery({
    queryKey: ADMIN_PANEL_QUERY_KEYS.instructorasPorCategoria(campo),
    queryFn: () => fetchCapInstructoras(`filters[${campo}][$eq]=true`),
    enabled: enabled && Boolean(campo),
    staleTime: ADMIN_PANEL_STALE_TIME_MS,
    select: (result) => (Array.isArray(result?.data) ? result.data.map(mapInstructoraDisponible) : []),
  });
}
