import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  buildProgramacionFromApi,
  createEmptyProgramacionSemanal,
  createProgramacionStoragePayload,
  getFechasSemana,
  getInfoSemana,
} from '../components/programacionHorarios.helpers';
import { useHorariosQuery, usePdvIpsQuery } from './useHorariosInstructorasQueries';

const buildUser = (userData) => ({
  documento: userData?.document_number || '',
  nombre: userData?.nombre || '',
  correo: userData?.correo || '',
  telefono: userData?.Celular || '',
  cargo: userData?.cargo || '',
  foto: userData?.foto || '',
});

const mapPdvIps = (items) => items
  .map((pdv) => ({
    id: pdv.id,
    nombre: pdv.attributes?.nombre || pdv.nombre || '',
  }))
  .filter((pdv) => pdv.nombre)
  .sort((a, b) => a.nombre.localeCompare(b.nombre));

export function useProgramacionHorariosData(semanaOffset) {
  const { userData, logout } = useAuth();
  const user = useMemo(() => (userData ? buildUser(userData) : null), [userData]);
  const fechasSemana = useMemo(() => getFechasSemana(semanaOffset), [semanaOffset]);
  const infoSemana = useMemo(() => getInfoSemana(fechasSemana), [fechasSemana]);
  const storageKey = useMemo(() => {
    if (!user?.documento || fechasSemana.length === 0) return null;
    return `programacion_${user.documento}_${fechasSemana[0].toISOString().slice(0, 10)}`;
  }, [fechasSemana, user?.documento]);

  const puntosVentaQuery = usePdvIpsQuery('pagination[pageSize]=1000');
  const puntosVenta = useMemo(() => mapPdvIps(puntosVentaQuery.data || []), [puntosVentaQuery.data]);

  const fechaInicio = fechasSemana[0].toISOString().slice(0, 10);
  const fechaFin = fechasSemana[6].toISOString().slice(0, 10);
  const horariosQueryString = user?.documento
    ? `filters[documento][$eq]=${user.documento}&filters[fecha][$gte]=${fechaInicio}&filters[fecha][$lte]=${fechaFin}&pagination[pageSize]=40000`
    : '';

  const horariosQuery = useHorariosQuery(
    horariosQueryString,
    Boolean(user?.documento),
    (response) => (Array.isArray(response?.data) ? response.data : [])
  );

  const [programacionSemanal, setProgramacionSemanal] = useState(createEmptyProgramacionSemanal);

  useEffect(() => {
    if (!userData) {
      logout();
      return;
    }

    if (horariosQuery.isLoading) return;

    if (horariosQuery.data?.length > 0) {
      setProgramacionSemanal(buildProgramacionFromApi(horariosQuery.data, fechasSemana));
      return;
    }

    if (storageKey) {
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const payload = JSON.parse(localData);
          setProgramacionSemanal(payload?.programacion || createEmptyProgramacionSemanal());
          return;
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
    }

    setProgramacionSemanal(createEmptyProgramacionSemanal());
  }, [fechasSemana, horariosQuery.data, horariosQuery.isLoading, logout, storageKey, userData]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(createProgramacionStoragePayload(programacionSemanal, fechasSemana))
    );
  }, [fechasSemana, programacionSemanal, storageKey]);

  return {
    user,
    fechasSemana,
    infoSemana,
    puntosVenta,
    programacionSemanal,
    setProgramacionSemanal,
    loadingPuntos: puntosVentaQuery.isFetching,
    loadingProgramacion: horariosQuery.isFetching,
    logout,
  };
}
