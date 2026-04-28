import { getBukEmpleadosByDocumento } from './apiService';
import { BUK_EMPLEADOS_STALE_TIME_MS } from './queryClient';

const normalizarDocumento = (documento) => String(documento || '').trim();

export const getBukEmpleadoQueryKey = (documento) => [
  'buk',
  'empleados3',
  normalizarDocumento(documento),
];

export const findBukEmpleadoByDocumento = (response, documento) => {
  const documentoNormalizado = normalizarDocumento(documento);
  const empleados = response?.data || response;

  if (!Array.isArray(empleados)) {
    return null;
  }

  return (
    empleados.find(
      (empleado) => String(empleado?.document_number || '').trim() === documentoNormalizado
    ) || null
  );
};

export const createBukEmpleadoQueryOptions = (documento) => {
  const documentoNormalizado = normalizarDocumento(documento);

  return {
    queryKey: getBukEmpleadoQueryKey(documentoNormalizado),
    queryFn: () => getBukEmpleadosByDocumento(documentoNormalizado),
    staleTime: BUK_EMPLEADOS_STALE_TIME_MS,
    enabled: Boolean(documentoNormalizado),
  };
};

export const fetchBukEmpleadoByDocumento = async (queryClient, documento) => {
  const documentoNormalizado = normalizarDocumento(documento);

  if (!documentoNormalizado) {
    return null;
  }

  const response = await queryClient.fetchQuery(createBukEmpleadoQueryOptions(documentoNormalizado));
  return findBukEmpleadoByDocumento(response, documentoNormalizado);
};