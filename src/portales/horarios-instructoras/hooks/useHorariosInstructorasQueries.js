import { useQuery } from '@tanstack/react-query';
import {
  fetchCapPdvs,
  fetchHorariosInstructoras,
  fetchInstructoras,
  fetchPdvIps,
} from '../services/horariosInstructoras.service';

export const HORARIOS_QUERY_KEYS = {
  root: ['horarios-instructoras'],
  instructoras: (query = '') => ['horarios-instructoras', 'instructoras', query],
  pdvs: (query = '') => ['horarios-instructoras', 'pdvs', query],
  pdvIps: (query = '') => ['horarios-instructoras', 'pdv-ips', query],
  horarios: (query = '') => ['horarios-instructoras', 'horarios', query],
};

const STALE_TIME = 5 * 60 * 1000;

export function useInstructorasQuery(query, enabled = true) {
  return useQuery({
    queryKey: HORARIOS_QUERY_KEYS.instructoras(query),
    queryFn: () => fetchInstructoras(query),
    enabled,
    staleTime: STALE_TIME,
    select: (response) => (Array.isArray(response?.data) ? response.data : []),
  });
}

export function useCapPdvsQuery(query, enabled = true) {
  return useQuery({
    queryKey: HORARIOS_QUERY_KEYS.pdvs(query),
    queryFn: () => fetchCapPdvs(query),
    enabled,
    staleTime: STALE_TIME,
    select: (response) => (Array.isArray(response?.data) ? response.data : []),
  });
}

export function usePdvIpsQuery(query, enabled = true) {
  return useQuery({
    queryKey: HORARIOS_QUERY_KEYS.pdvIps(query),
    queryFn: () => fetchPdvIps(query),
    enabled,
    staleTime: STALE_TIME,
    select: (response) => (Array.isArray(response?.data) ? response.data : []),
  });
}

export function useHorariosQuery(query, enabled = true, select) {
  return useQuery({
    queryKey: HORARIOS_QUERY_KEYS.horarios(query),
    queryFn: () => fetchHorariosInstructoras(query),
    enabled,
    staleTime: STALE_TIME,
    select,
  });
}
