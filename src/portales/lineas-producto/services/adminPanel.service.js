import {
  createCapInstructora,
  deleteCapCafe,
  deleteCapTodera,
  getCapCafes,
  getCapInstructoras,
  getCapPdvById,
  getCapPdvs,
  getCapToderas,
  updateCapInstructora,
  updateCapCafe,
  updateCapTodera,
  updateCapPdv,
} from '../../../services/apiService';

export const fetchCapCafes = () => getCapCafes();

export const fetchCapToderas = () => getCapToderas();

export const fetchCapPdvsWithInstructoras = () => getCapPdvs('populate=cap_instructoras');

export const fetchCapPdvsPopulated = () => getCapPdvs('populate=*');

export const fetchCapInstructoras = (query = '') => getCapInstructoras(query);

export const fetchCapPdvById = (id, query = '') => getCapPdvById(id, query);

export const saveCapPdv = (id, payload, headers) => updateCapPdv(id, payload, headers);

export const saveCapInstructora = (id, payload, headers) => updateCapInstructora(id, payload, headers);

export const createInstructora = (payload, headers) => createCapInstructora(payload, headers);

export const deleteInscripcionCafe = (id) => deleteCapCafe(id);

export const deleteEvaluacionTodera = (id) => deleteCapTodera(id);

export const updateInscripcionCafe = (id, payload) => updateCapCafe(id, payload);

export const updateEvaluacionTodera = (id, payload) => updateCapTodera(id, payload);
