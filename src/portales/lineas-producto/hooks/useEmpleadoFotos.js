import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  createBukEmpleadoQueryOptions,
  findBukEmpleadoByDocumento,
} from '../../../services/bukEmpleadosQuery';

export function useEmpleadoFotos(cedulas) {
  const documentos = useMemo(
    () => [...new Set(cedulas.map((cedula) => String(cedula || '').trim()).filter(Boolean))],
    [cedulas]
  );

  const queries = useQueries({
    queries: documentos.map((documento) => ({
      ...createBukEmpleadoQueryOptions(documento),
      select: (response) => findBukEmpleadoByDocumento(response, documento)?.foto || '',
    })),
  });

  return useMemo(() => {
    return documentos.reduce((acc, documento, index) => {
      const foto = queries[index]?.data;
      if (foto) {
        acc[documento] = foto;
      }
      return acc;
    }, {});
  }, [documentos, queries]);
}
