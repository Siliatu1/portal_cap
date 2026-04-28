export const ADMIN_ROLES = [
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO'
];

const MOTIVO_LABEL_PAIRS = [
  ['Retroalimentación', 'retroalimentacion'],
  ['Acompañamiento', 'acompañamiento'],
  ['Capacitación', 'capacitacion'],
  ['Día de Descanso', 'dia_descanso'],
  ['Visita', 'visita'],
  ['Inducción', 'induccion'],
  ['Cubrir Puesto', 'cubrir_puesto'],
  ['Disponible', 'disponible'],
  ['Fotos', 'fotos'],
  ['Escuela del Café', 'escuela_cafe'],
  ['Sintonizarte', 'sintonizarte'],
  ['Viaje', 'viaje'],
  ['P&G', 'pg'],
  ['Apoyo', 'apoyo'],
  ['Reunión', 'reunion'],
  ['Cambio de Turno', 'cambio_turno'],
  ['Apertura', 'apertura'],
  ['Lanzamiento', 'lanzamiento'],
  ['Vacaciones', 'vacaciones'],
  ['Incapacidad', 'incapacidad'],
  ['Día de la Familia', 'dia_familia'],
  ['Permiso No Remunerado', 'permiso_no_remunerado'],
  ['Licencia No Remunerada', 'licencia_no_remunerada'],
  ['Licencia Remunerada', 'licencia_remunerada'],
  ['Licencia por Luto', 'licencia_luto']
];

const BASE_MOTIVO_VALUES = new Set([
  'retroalimentacion',
  'acompañamiento',
  'capacitacion',
  'dia_descanso'
]);

export const INITIAL_MODAL_FORM = {
  puntoVenta: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
  detalleCubrir: '',
  detalleOtro: ''
};

export const MOTIVOS_LABELS = Object.fromEntries(MOTIVO_LABEL_PAIRS);
export const MOTIVOS_LABELS_REVERSE = Object.fromEntries(
  MOTIVO_LABEL_PAIRS.map(([label, value]) => [value, label])
);

export const EXPANDABLE_MOTIVOS = new Set([
  ...MOTIVO_LABEL_PAIRS.map(([, value]) => value).filter((value) => !BASE_MOTIVO_VALUES.has(value)),
  'otro'
]);

export const ROW_COLORS = [
  '#FFE4E4', '#FFF5CC', '#E4F5D4', '#D4EEF7', '#EDE4F5',
  '#FFE8D6', '#D4F0E8', '#F5D4E8', '#D4DEFF', '#FFF0D4',
  '#E8FFD4', '#D4FFE8', '#FFE0CC', '#CCE8FF', '#F0FFD4',
];

export const DIAS_NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const LINEA_OPTIONS = [
  { value: 'todas', label: 'Todas las Líneas' },
  { value: 'sal', label: 'Sal' },
  { value: 'dulce', label: 'Dulce' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'Brunch', label: 'Brunch' },
];

export const MOTIVO_OPTIONS_BASE = [
  { value: '', label: 'Selecciona un motivo' },
  ...MOTIVO_LABEL_PAIRS
    .filter(([, value]) => BASE_MOTIVO_VALUES.has(value))
    .map(([label, value]) => ({ value, label }))
];

export const MOTIVO_OPTIONS_EXTRA = [
  ...MOTIVO_LABEL_PAIRS
    .filter(([, value]) => !BASE_MOTIVO_VALUES.has(value))
    .map(([label, value]) => ({ value, label })),
  { value: 'otro', label: 'Otro' },
];

export function getDefaultLunes() {
  const hoy = new Date();
  const dow = hoy.getDay();
  const daysToMonday = dow === 0 ? 1 : dow === 1 ? 7 : 8 - dow;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + daysToMonday);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export function shiftWeek(date, offsetDays) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate;
}

export function toMonday(date) {
  const nextDate = new Date(date);
  const dow = nextDate.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  nextDate.setDate(nextDate.getDate() + diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

export function getWeekDates(semanaLunes) {
  return Array.from({ length: 7 }, (_, index) => shiftWeek(semanaLunes, index));
}

export function getWeekRangeLabel(semanaLunes) {
  return `${semanaLunes.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} - ${shiftWeek(semanaLunes, 6).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

export function getInitials(name) {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
}

export function calculateHours(horaInicio, horaFin, actividad) {
  if (!horaInicio || !horaFin || actividad === 'Día de Descanso') {
    return 0;
  }

  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFinValue, minFin] = horaFin.split(':').map(Number);
  return (horaFinValue * 60 + minFin - (horaIni * 60 + minIni)) / 60;
}

export function createHorarioRecord(item) {
  const fechaStr = item.attributes.fecha;
  const [year, month, day] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  const horaInicio = item.attributes.hora_inicio ? item.attributes.hora_inicio.substring(0, 5) : '';
  const horaFin = item.attributes.hora_fin ? item.attributes.hora_fin.substring(0, 5) : '';

  return {
    id: item.id,
    documento: item.attributes.documento,
    fecha,
    fechaStr: fecha.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'short' }),
    diaSemana: fecha.toLocaleDateString('es-CO', { weekday: 'long' }),
    pdv: item.attributes.pdv_nombre,
    actividad: item.attributes.actividad,
    horaInicio,
    horaFin,
    horas: calculateHours(horaInicio, horaFin, item.attributes.actividad),
    updatedAt: item.attributes.updatedAt
  };
}

export function buildInstructorasList(horarios, instructorasMap) {
  return [...new Set(horarios.map((horario) => horario.documento))]
    .map((documento) => ({
      documento,
      nombre: instructorasMap.get(String(documento).trim()) || `Instructora ${documento}`
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function buildEditFormData(horario, puntosVenta) {
  const motivo = MOTIVOS_LABELS[horario.actividad] || 'otro';
  const pdvEncontrado = puntosVenta.find((puntoVenta) => puntoVenta.nombre === horario.pdv);

  return {
    formData: {
      ...INITIAL_MODAL_FORM,
      puntoVenta: pdvEncontrado ? String(pdvEncontrado.id) : '',
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      motivo,
      detalleOtro: motivo === 'otro' ? horario.actividad : ''
    },
    showMoreMotivos: EXPANDABLE_MOTIVOS.has(motivo)
  };
}

export function validateHorarioForm(formData) {
  if (!formData.puntoVenta) {
    return 'Por favor selecciona un punto de venta';
  }

  if (formData.motivo === 'cubrir_puesto' && !formData.detalleCubrir) {
    return 'Por favor especifica a quién vas a cubrir';
  }

  if (formData.motivo === 'otro' && !formData.detalleOtro) {
    return 'Por favor especifica el detalle de la actividad';
  }

  if (formData.motivo !== 'dia_descanso' && formData.motivo !== 'vacaciones') {
    if (!formData.horaInicio || !formData.horaFin) {
      return 'Por favor ingresa hora de inicio y fin';
    }

    const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
    const fin = new Date(`2000-01-01T${formData.horaFin}`);

    if (fin <= inicio) {
      return 'La hora de fin debe ser mayor a la hora de inicio';
    }
  }

  return null;
}

export function buildHorarioUpdatePayload(formData, horario, puntosVenta) {
  const puntoVentaObj = puntosVenta.find((puntoVenta) => String(puntoVenta.id) === formData.puntoVenta);
  const puntoVentaNombre = puntoVentaObj ? puntoVentaObj.nombre : '';
  const actividad = formData.motivo === 'otro'
    ? formData.detalleOtro
    : MOTIVOS_LABELS_REVERSE[formData.motivo] || formData.motivo;
  const isAllDayActivity = formData.motivo === 'dia_descanso' || formData.motivo === 'vacaciones';

  return {
    actividad,
    puntoVentaNombre,
    horaInicioDisplay: isAllDayActivity ? '' : formData.horaInicio,
    horaFinDisplay: isAllDayActivity ? '' : formData.horaFin,
    datosAPI: {
      data: {
        pdv_nombre: puntoVentaNombre,
        fecha: `${horario.fecha.getFullYear()}-${String(horario.fecha.getMonth() + 1).padStart(2, '0')}-${String(horario.fecha.getDate()).padStart(2, '0')}`,
        hora_inicio: isAllDayActivity ? '00:00:00' : `${formData.horaInicio}:00`,
        hora_fin: isAllDayActivity ? '00:00:00' : `${formData.horaFin}:00`,
        actividad,
        documento: String(horario.documento)
      }
    }
  };
}

export function buildWeeklyRows(fechasSemana, horarios, instructoras) {
  const instructorasByDocumento = new Map(
    instructoras.map((instructora) => [instructora.documento, instructora.nombre])
  );

  const docsEnFiltrado = [...new Set(horarios.map((horario) => horario.documento))].sort((a, b) => {
    const nombreA = instructorasByDocumento.get(a) || a;
    const nombreB = instructorasByDocumento.get(b) || b;
    return nombreA.localeCompare(nombreB);
  });

  return docsEnFiltrado.map((documento, index) => {
    const row = {
      key: documento,
      numero: index + 1,
      nombre: instructorasByDocumento.get(documento) || documento,
      documento,
      rowIndex: index,
    };

    fechasSemana.forEach((fecha) => {
      const ts = fecha.getTime();
      const dayKey = `day_${ts}`;
      const horario = horarios.find((item) => item.documento === documento && item.fecha.getTime() === ts);

      row[`${dayKey}_pdv`] = horario ? horario.pdv : '';
      row[`${dayKey}_motivo`] = horario ? horario.actividad : '';
      row[`${dayKey}_horario`] = horario || null;
      row[`${dayKey}_horario_text`] = horario && horario.horaInicio && horario.horaFin
        ? `${horario.horaInicio} - ${horario.horaFin}`
        : '';
    });

    return row;
  });
}