export const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const DIAS_SEMANA_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const INITIAL_MODAL_FORM = {
  puntoVenta: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
  detalleCubrir: '',
  detalleOtro: ''
};

export const PRIMARY_MOTIVOS = [
  { value: 'retroalimentacion', label: 'Retroalimentación' },
  { value: 'acompañamiento', label: 'Acompañamiento' },
  { value: 'capacitacion', label: 'Capacitación' },
];

export const EXTRA_MOTIVOS = [
  { value: 'visita', label: 'Visita' },
  { value: 'induccion', label: 'Inducción' },
  { value: 'cubrir_puesto', label: 'Cubrir Puesto' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'fotos', label: 'Fotos' },
  { value: 'escuela_cafe', label: 'Escuela del Café' },
  { value: 'sintonizarte', label: 'Sintonizarte' },
  { value: 'viaje', label: 'Viaje' },
  { value: 'pg', label: 'P&G' },
  { value: 'apoyo', label: 'Apoyo' },
  { value: 'reunion', label: 'Reunión' },
  { value: 'cambio_turno', label: 'Cambio de Turno' },
  { value: 'apertura', label: 'Apertura' },
  { value: 'lanzamiento', label: 'Lanzamiento' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'incapacidad', label: 'Incapacidad' },
  { value: 'dia_familia', label: 'Día de la Familia' },
  { value: 'permiso_no_remunerado', label: 'Permiso No Remunerado' },
  { value: 'licencia_no_remunerada', label: 'Licencia No Remunerada' },
  { value: 'licencia_remunerada', label: 'Licencia Remunerada' },
  { value: 'licencia_luto', label: 'Licencia por Luto' },
  { value: 'otro', label: 'Otro' },
];

export const MOTIVOS_LABELS = {
  retroalimentacion: 'Retroalimentación',
  acompañamiento: 'Acompañamiento',
  capacitacion: 'Capacitación',
  visita: 'Visita',
  induccion: 'Inducción',
  cubrir_puesto: 'Cubrir Puesto',
  disponible: 'Disponible',
  fotos: 'Fotos',
  escuela_cafe: 'Escuela del Café',
  sintonizarte: 'Sintonizarte',
  viaje: 'Viaje',
  pg: 'P&G',
  apoyo: 'Apoyo',
  reunion: 'Reunión',
  cambio_turno: 'Cambio de Turno',
  apertura: 'Apertura',
  lanzamiento: 'Lanzamiento',
  vacaciones: 'Vacaciones',
  incapacidad: 'Incapacidad',
  dia_familia: 'Día de la Familia',
  permiso_no_remunerado: 'Permiso No Remunerado',
  licencia_no_remunerada: 'Licencia No Remunerada',
  licencia_remunerada: 'Licencia Remunerada',
  licencia_luto: 'Licencia por Luto',
  otro: 'Otro'
};

const ACTIVIDAD_A_MOTIVO = {
  'Retroalimentación': 'retroalimentacion',
  'Acompañamiento': 'acompañamiento',
  'Capacitación': 'capacitacion',
  'Día de Descanso': 'dia_descanso',
  'Visita': 'visita',
  'Inducción': 'induccion',
  'Cubrir Puesto': 'cubrir_puesto',
  'Disponible': 'disponible',
  'Fotos': 'fotos',
  'Escuela del Café': 'escuela_cafe',
  'Sintonizarte': 'sintonizarte',
  'Viaje': 'viaje',
  'P&G': 'pg',
  'Apoyo': 'apoyo',
  'Reunión': 'reunion',
  'Cambio de Turno': 'cambio_turno',
  'Apertura': 'apertura',
  'Lanzamiento': 'lanzamiento',
  'Vacaciones': 'vacaciones',
  'Incapacidad': 'incapacidad',
  'Día de la Familia': 'dia_familia',
  'Permiso No Remunerado': 'permiso_no_remunerado',
  'Licencia No Remunerada': 'licencia_no_remunerada',
  'Licencia Remunerada': 'licencia_remunerada',
  'Licencia por Luto': 'licencia_luto'
};

export const EXPANDABLE_MOTIVOS = new Set(EXTRA_MOTIVOS.map((motivo) => motivo.value));

export function createEmptyProgramacionSemanal() {
  return {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  };
}

export function getFechasSemana(semanaOffset) {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const proximoLunes = new Date(hoy);
  const diasHastaProximoLunes = diaSemana === 0 ? 1 : diaSemana === 1 ? 7 : 8 - diaSemana;

  proximoLunes.setDate(hoy.getDate() + diasHastaProximoLunes + (semanaOffset * 7));

  return Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(proximoLunes);
    fecha.setDate(proximoLunes.getDate() + index);
    return fecha;
  });
}

export function formatFecha(fecha) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
}

export function formatFechaCompleta(fecha) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function calculateHours(horaInicio, horaFin) {
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFi, minFi] = horaFin.split(':').map(Number);
  return (horaFi * 60 + minFi - (horaIni * 60 + minIni)) / 60;
}

export function calculateHorasDia(eventos) {
  return eventos.reduce((total, evento) => {
    if (!evento.horaInicio || !evento.horaFin || evento.motivo === 'dia_descanso') {
      return total;
    }

    return total + calculateHours(evento.horaInicio, evento.horaFin);
  }, 0);
}

export function calculateTotalHorasSemana(programacionSemanal) {
  return DIAS_SEMANA.reduce((total, dia) => total + calculateHorasDia(programacionSemanal[dia]), 0);
}

export function getInfoSemana(fechasSemana) {
  const primerDia = fechasSemana[0];
  const ultimoDia = fechasSemana[6];
  const mes = primerDia.getMonth();
  const año = primerDia.getFullYear();
  const primerDiaMes = new Date(año, mes, 1);
  const diasHastaPrimerLunes = (8 - primerDiaMes.getDay()) % 7;
  const numeroSemana = Math.ceil((primerDia.getDate() - diasHastaPrimerLunes) / 7) + 1;

  return {
    numeroSemana,
    fechaInicio: primerDia,
    fechaFin: ultimoDia
  };
}

export function getInitials(name) {
  if (!name) return 'U';
  const names = name.split(' ');
  return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : name[0].toUpperCase();
}

export function filterPdvs(searchText, puntosVenta) {
  if (!searchText) {
    return puntosVenta.slice(0, 20);
  }

  return puntosVenta
    .filter((pdv) => pdv.nombre.toLowerCase().includes(searchText.toLowerCase()))
    .slice(0, 20);
}

export function createProgramacionStoragePayload(programacionSemanal, fechasSemana) {
  const infoSemana = getInfoSemana(fechasSemana);
  return {
    programacion: programacionSemanal,
    semana: {
      numero: infoSemana.numeroSemana,
      fechaInicio: infoSemana.fechaInicio.toISOString(),
      fechaFin: infoSemana.fechaFin.toISOString()
    }
  };
}

export function buildProgramacionFromApi(items, fechasSemana) {
  const nuevaProgramacion = createEmptyProgramacionSemanal();

  items.forEach((item) => {
    const fechaStr = item.attributes.fecha;
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaItem = new Date(year, month - 1, day);
    const diaIndex = fechasSemana.findIndex((fechaSemana) => (
      fechaSemana.getFullYear() === fechaItem.getFullYear()
      && fechaSemana.getMonth() === fechaItem.getMonth()
      && fechaSemana.getDate() === fechaItem.getDate()
    ));

    if (diaIndex === -1) {
      return;
    }

    const actividad = item.attributes.actividad;
    const motivo = ACTIVIDAD_A_MOTIVO[actividad] || 'otro';

    nuevaProgramacion[DIAS_SEMANA[diaIndex]].push({
      puntoVenta: item.attributes.pdv_nombre,
      puntoVentaId: '',
      horaInicio: item.attributes.hora_inicio ? item.attributes.hora_inicio.substring(0, 5) : '',
      horaFin: item.attributes.hora_fin ? item.attributes.hora_fin.substring(0, 5) : '',
      motivo,
      detalleCubrir: '',
      detalleOtro: ACTIVIDAD_A_MOTIVO[actividad] ? '' : actividad,
      fechaModificacion: item.attributes.updatedAt || item.attributes.createdAt,
      horaModificacion: new Date(item.attributes.updatedAt || item.attributes.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      idAPI: item.id
    });
  });

  return nuevaProgramacion;
}

export function validateEventoForm(formData, programacionSemanal, dia, eventoEditarModal) {
  if (!formData.motivo) {
    return 'Por favor selecciona un motivo';
  }

  if (formData.motivo !== 'vacaciones' && !formData.puntoVenta) {
    return 'Por favor selecciona un punto de venta';
  }

  if (formData.motivo === 'cubrir_puesto' && !formData.detalleCubrir) {
    return 'Por favor especifica a quién vas a cubrir';
  }

  if (formData.motivo === 'otro' && !formData.detalleOtro) {
    return 'Por favor especifica el detalle de la actividad';
  }

  if (formData.motivo === 'vacaciones') {
    return null;
  }

  if (!formData.horaInicio || !formData.horaFin) {
    return 'Por favor ingresa hora de inicio y fin en formato HH:MM';
  }

  const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
  const fin = new Date(`2000-01-01T${formData.horaFin}`);
  if (fin <= inicio) {
    return 'La hora de fin debe ser mayor a la hora de inicio';
  }

  const horasTotalesDia = programacionSemanal[dia].reduce((total, evento, idx) => {
    if (eventoEditarModal && idx === eventoEditarModal.index) return total;
    if (evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') return total;
    return total + calculateHours(evento.horaInicio, evento.horaFin);
  }, 0);

  const horasNuevas = (fin - inicio) / (1000 * 60 * 60);
  if (horasTotalesDia + horasNuevas > 7) {
    return `No puedes programar más de 7 horas por día. Ya tienes ${horasTotalesDia.toFixed(1)} horas. Solo puedes agregar ${(7 - horasTotalesDia).toFixed(1)} horas más.`;
  }

  let horasSemanales = 0;
  DIAS_SEMANA.forEach((diaKey) => {
    programacionSemanal[diaKey].forEach((evento, idx) => {
      if (diaKey === dia && eventoEditarModal && idx === eventoEditarModal.index) return;
      if (evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') return;
      if (evento.horaInicio && evento.horaFin) {
        horasSemanales += calculateHours(evento.horaInicio, evento.horaFin);
      }
    });
  });

  if (horasSemanales + horasNuevas > 42) {
    return `No puedes programar más de 42 horas por semana. Ya tienes ${horasSemanales.toFixed(1)} horas programadas. Solo puedes agregar ${(42 - horasSemanales).toFixed(1)} horas más.`;
  }

  return null;
}

export function buildHorarioApiPayload(formData, fecha, documento) {
  let actividad = MOTIVOS_LABELS[formData.motivo] || formData.motivo;
  if (formData.motivo === 'cubrir_puesto') {
    actividad = `Cubrir Puesto - ${formData.detalleCubrir}`;
  } else if (formData.motivo === 'otro') {
    actividad = formData.detalleOtro;
  }

  const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  const esVacaciones = formData.motivo === 'vacaciones';
  const puntoVentaNombre = formData.puntoVenta || (esVacaciones ? 'N/A' : '');

  return {
    puntoVentaNombre,
    datosAPI: {
      data: {
        pdv_nombre: puntoVentaNombre,
        fecha: fechaFormateada,
        hora_inicio: esVacaciones ? '00:00:00' : `${formData.horaInicio}:00`,
        hora_fin: esVacaciones ? '00:00:00' : `${formData.horaFin}:00`,
        actividad,
        documento: String(documento)
      }
    }
  };
}

export function buildEventoLocal(formData, idAPI) {
  const esVacaciones = formData.motivo === 'vacaciones';
  return {
    puntoVenta: formData.puntoVenta || 'N/A',
    puntoVentaId: '',
    horaInicio: esVacaciones ? '' : formData.horaInicio,
    horaFin: esVacaciones ? '' : formData.horaFin,
    motivo: formData.motivo,
    detalleCubrir: formData.detalleCubrir,
    detalleOtro: formData.detalleOtro,
    fechaModificacion: new Date().toISOString(),
    horaModificacion: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    idAPI
  };
}

export function buildDescansoPayload(fecha, documento) {
  const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

  return {
    data: {
      pdv_nombre: 'N/A',
      fecha: fechaFormateada,
      hora_inicio: '00:00:00',
      hora_fin: '00:00:00',
      actividad: 'Día de Descanso',
      documento: String(documento)
    }
  };
}

export function buildDescansoEvent(idAPI) {
  return {
    puntoVenta: 'N/A',
    puntoVentaId: '',
    horaInicio: '',
    horaFin: '',
    motivo: 'dia_descanso',
    detalleCubrir: '',
    detalleOtro: '',
    fechaModificacion: new Date().toISOString(),
    horaModificacion: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    idAPI
  };
}

export function buildModalFormFromEvento(evento) {
  return {
    puntoVenta: evento.puntoVenta && evento.puntoVenta !== 'N/A' ? evento.puntoVenta : '',
    horaInicio: evento.horaInicio || '',
    horaFin: evento.horaFin || '',
    motivo: evento.motivo || '',
    detalleCubrir: evento.detalleCubrir || '',
    detalleOtro: evento.detalleOtro || ''
  };
}

export function getActividadLabel(evento) {
  if (evento.motivo === 'otro') {
    return evento.detalleOtro;
  }

  if (evento.motivo === 'cubrir_puesto') {
    return `Cubrir - ${evento.detalleCubrir}`;
  }

  return MOTIVOS_LABELS[evento.motivo] || evento.motivo;
}