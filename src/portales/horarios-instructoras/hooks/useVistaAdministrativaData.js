import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  ADMIN_ROLES,
  buildInstructorasList,
  createHorarioRecord,
  shiftWeek,
} from '../components/vistaAdministrativa.helpers';
import {
  useCapPdvsQuery,
  useHorariosQuery,
  useInstructorasQuery,
} from './useHorariosInstructorasQueries';

const buildUser = (userData) => {
  const cargo = userData?.cargo || '';
  return {
    documento: userData?.document_number || '',
    nombre: userData?.nombre || '',
    correo: userData?.correo || '',
    cargo,
    foto: userData?.foto || '',
    isAdmin: ADMIN_ROLES.includes(cargo),
  };
};

export function useVistaAdministrativaData({ semanaLunes, lineaSeleccionada }) {
  const { userData, logout } = useAuth();
  const user = useMemo(() => (userData ? buildUser(userData) : null), [userData]);
  const fechaInicioStr = dayjs(semanaLunes).format('YYYY-MM-DD');
  const fechaFinStr = dayjs(shiftWeek(semanaLunes, 6)).format('YYYY-MM-DD');
  const queryInstructoras = lineaSeleccionada !== 'todas'
    ? `filters[${lineaSeleccionada}][$eq]=true&pagination[pageSize]=1000`
    : 'pagination[pageSize]=1000';

  const pdvsQuery = useCapPdvsQuery('pagination[pageSize]=1000&filters[activo][$eq]=true');
  const instructorasQuery = useInstructorasQuery(queryInstructoras, Boolean(user?.isAdmin));
  const horariosQuery = useHorariosQuery(
    `filters[fecha][$gte]=${fechaInicioStr}&filters[fecha][$lte]=${fechaFinStr}&pagination[pageSize]=40000`,
    Boolean(user?.isAdmin),
    (response) => (Array.isArray(response?.data) ? response.data : [])
  );

  const puntosVenta = useMemo(() => (pdvsQuery.data || [])
    .map((pdv) => ({ id: pdv.id, nombre: pdv.attributes.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre)), [pdvsQuery.data]);

  const instructorasData = instructorasQuery.data || [];
  const documentosInstructoras = useMemo(() => instructorasData
    .map((inst) => String(inst.attributes.documento || '').trim())
    .filter(Boolean), [instructorasData]);
  const instructorasMap = useMemo(() => new Map(
    instructorasData.map((inst) => {
      const documento = String(inst.attributes.documento || '').trim();
      const nombre = inst.attributes.Nombre || inst.attributes.nombre || `Instructora ${documento}`;
      return [documento, nombre];
    })
  ), [instructorasData]);

  const horariosTodos = useMemo(() => {
    let horarios = (horariosQuery.data || []).map(createHorarioRecord);

    if (lineaSeleccionada !== 'todas') {
      horarios = horarios.filter((horario) => documentosInstructoras.includes(String(horario.documento).trim()));
    }

    return horarios.sort((a, b) => {
      if (a.fecha.getTime() !== b.fecha.getTime()) return a.fecha - b.fecha;
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }, [documentosInstructoras, horariosQuery.data, lineaSeleccionada]);

  const instructoras = useMemo(
    () => buildInstructorasList(horariosTodos, instructorasMap),
    [horariosTodos, instructorasMap]
  );

  return {
    user,
    logout,
    puntosVenta,
    instructoras,
    horariosTodos,
    loading: pdvsQuery.isFetching || instructorasQuery.isFetching || horariosQuery.isFetching,
    refetch: () => {
      pdvsQuery.refetch();
      instructorasQuery.refetch();
      horariosQuery.refetch();
    },
  };
}
