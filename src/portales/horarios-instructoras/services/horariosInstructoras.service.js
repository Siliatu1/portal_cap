import {
  createHorarioInstructora,
  getCapInstructoras,
  getCapPdvs,
  getHorariosInstructoras,
  getPdvIps,
  updateHorarioInstructora,
} from '../../../services/apiService';

export const fetchInstructoras = (query = '') => getCapInstructoras(query);

export const fetchCapPdvs = (query = '') => getCapPdvs(query);

export const fetchPdvIps = (query = '') => getPdvIps(query);

export const fetchHorariosInstructoras = (query = '') => getHorariosInstructoras(query);

export const createHorario = (payload) => createHorarioInstructora(payload);

export const updateHorario = (id, payload) => updateHorarioInstructora(id, payload);
