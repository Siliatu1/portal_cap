import {
  createCapCafe,
  createCapCafeFecha,
  createCapTodera,
  deleteCapCafeFecha,
  getCapCafeFechas,
  getCapPdvs,
  getPublicHolidays,
} from '../../../services/apiService';

export const fetchFestivosColombia = (year) => getPublicHolidays(year, 'CO');

export const fetchCapCafeFechas = () => getCapCafeFechas();

export const createFechaBloqueada = (payload) => createCapCafeFecha(payload);

export const deleteFechaBloqueada = (id) => deleteCapCafeFecha(id);

export const createInscripcionCafe = (payload) => createCapCafe(payload);

export const createEvaluacionTodera = (payload) => createCapTodera(payload);

export const fetchPdvInstructorasPorCategoria = (query) => getCapPdvs(query);
