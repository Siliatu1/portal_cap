export const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MESES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const MOTIVOS_LABELS = {
  retroalimentacion: 'Retroalimentación',
  acompañamiento: 'Acompañamiento',
  capacitacion: 'Capacitación',
  dia_descanso: 'Día de Descanso',
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
};

export const ACTIVIDAD_A_MOTIVO = Object.fromEntries(
  Object.entries(MOTIVOS_LABELS).map(([key, value]) => [value, key])
);

export const MOTIVOS_BASICOS = ['retroalimentacion', 'acompañamiento', 'capacitacion'];
export const MOTIVOS_SIN_HORA = ['dia_descanso', 'vacaciones'];
export const INITIAL_MODAL_FORM = {
  puntoVenta: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
  detalleCubrir: '',
  detalleOtro: '',
};

const pad = (value) => String(value).padStart(2, '0');

export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

export function formatearFecha(fecha) {
  return fecha ? `${fecha.getDate()} ${MESES_CORTO[fecha.getMonth()]}` : '';
}

export function getDiaSemana(fecha) {
  return DIAS_SEMANA[fecha.getDay()];
}

export function formatearFechaCompleta(fecha) {
  return `${fecha.getDate()} de ${MESES_LARGO[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function formatearRangoFechas(inicio, fin) {
  return inicio && fin ? `${inicio.getDate()} - ${fin.getDate()} ${MESES_CORTO[inicio.getMonth()]}` : '';
}

export function calcularRangoSemana(offset = 0) {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasHasta = diaSemana === 0 ? 1 : diaSemana === 1 ? 7 : 8 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diasHasta + offset * 7);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { lunes, domingo };
}

export function buildBaseUser(userData) {
  return {
    documento: userData?.document_number || '',
    nombre: userData?.nombre || '',
    correo: userData?.correo || '',
    telefono: userData?.Celular || '',
    foto: userData?.foto || '',
  };
}

export function extractPuntosVenta(instructoras, documento) {
  if (!Array.isArray(instructoras)) {
    return [];
  }

  const instructora = instructoras.find(
    (item) => String(item.attributes.documento).trim() === String(documento).trim()
  );

  const pdvs = instructora?.attributes?.cap_pdvs?.data;
  if (!Array.isArray(pdvs)) {
    return [];
  }

  return pdvs
    .filter((pdv) => pdv.attributes?.activo === true)
    .map((pdv) => ({ id: pdv.id, nombre: pdv.attributes.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function buildSemanaQuery(offset) {
  const { lunes, domingo } = calcularRangoSemana(offset);
  const primerDia = new Date(lunes.getFullYear(), lunes.getMonth(), 1);
  const diasHastaLunes = (8 - primerDia.getDay()) % 7;
  const numeroSemana = Math.ceil((lunes.getDate() - diasHastaLunes) / 7) + 1;

  return {
    lunes,
    domingo,
    numeroSemana,
    fechaInicioStr: `${lunes.getFullYear()}-${pad(lunes.getMonth() + 1)}-${pad(lunes.getDate())}`,
    fechaFinStr: `${domingo.getFullYear()}-${pad(domingo.getMonth() + 1)}-${pad(domingo.getDate())}`,
  };
}

export function buildHorariosState(items, semana) {
  const detalles = Array.isArray(items)
    ? items
      .map((item) => {
        const [year, month, day] = item.attributes.fecha.split('-').map(Number);
        return {
          apiId: item.id,
          fecha: new Date(year, month - 1, day),
          pdv: item.attributes.pdv_nombre,
          actividad: item.attributes.actividad,
          horaInicio: item.attributes.hora_inicio,
          horaFin: item.attributes.hora_fin,
        };
      })
      .sort((a, b) => a.fecha - b.fecha)
    : [];

  const totalHoras = detalles.reduce((sum, detalle) => {
    if (!detalle.horaInicio || !detalle.horaFin || detalle.horaInicio === '00:00:00') {
      return sum;
    }

    const [horaInicio, minutoInicio] = detalle.horaInicio.split(':').map(Number);
    const [horaFin, minutoFin] = detalle.horaFin.split(':').map(Number);
    return sum + (horaFin * 60 + minutoFin - horaInicio * 60 - minutoInicio) / 60;
  }, 0);

  return {
    detalles,
    filas: detalles.length > 0 ? [{
      key: 'semana-actual',
      numeroSemana: semana.numeroSemana,
      fechaInicio: semana.lunes,
      fechaFin: semana.domingo,
      totalHoras,
    }] : [],
    infoSemana: {
      numero: semana.numeroSemana,
      fechaInicio: semana.lunes,
      fechaFin: semana.domingo,
    },
  };
}

export function buildEditFormData(detalle, puntosVenta) {
  const pdvEncontrado = puntosVenta.find((pdv) => pdv.nombre === detalle.pdv);
  const motivo = ACTIVIDAD_A_MOTIVO[detalle.actividad] || 'otro';

  return {
    formData: {
      puntoVenta: pdvEncontrado ? String(pdvEncontrado.id) : '',
      horaInicio: detalle.horaInicio?.substring(0, 5) ?? '',
      horaFin: detalle.horaFin?.substring(0, 5) ?? '',
      motivo,
      detalleCubrir: '',
      detalleOtro: ACTIVIDAD_A_MOTIVO[detalle.actividad] ? '' : detalle.actividad,
    },
    showMoreMotivos: !MOTIVOS_BASICOS.includes(motivo),
  };
}

export function validateEditForm(formData) {
  if (!formData.puntoVenta) {
    return 'Por favor selecciona un punto de venta';
  }

  if (formData.motivo === 'cubrir_puesto' && !formData.detalleCubrir) {
    return 'Por favor especifica a quién vas a cubrir';
  }

  if (formData.motivo === 'otro' && !formData.detalleOtro) {
    return 'Por favor especifica el detalle de la actividad';
  }

  if (!MOTIVOS_SIN_HORA.includes(formData.motivo)) {
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

export function buildHorarioPayload(formData, eventoEditar, documento, puntosVenta) {
  const pdvObj = puntosVenta.find((pdv) => String(pdv.id) === formData.puntoVenta);
  const pdvNombre = pdvObj?.nombre ?? '';
  const actividad = formData.motivo === 'otro'
    ? formData.detalleOtro
    : (MOTIVOS_LABELS[formData.motivo] ?? formData.motivo);
  const horaInicio = MOTIVOS_SIN_HORA.includes(formData.motivo) ? '00:00:00' : `${formData.horaInicio}:00`;
  const horaFin = MOTIVOS_SIN_HORA.includes(formData.motivo) ? '00:00:00' : `${formData.horaFin}:00`;
  const fecha = eventoEditar.fecha;
  const fechaStr = `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

  return {
    pdvNombre,
    actividad,
    horaInicio,
    horaFin,
    payload: {
      data: {
        pdv_nombre: pdvNombre,
        fecha: fechaStr,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        actividad,
        documento: String(documento),
      },
    },
  };
}

export function getActividadTagColor(actividad) {
  if (actividad.includes('Retroalimentación')) return 'geekblue';
  if (actividad.includes('Capacitación')) return 'purple';
  if (actividad.includes('Descanso')) return 'volcano';
  return 'blue';
}