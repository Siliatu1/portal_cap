export const ADMIN_PANEL_QUERY_KEYS = {
  inscripciones: ['lineas-producto', 'admin-panel', 'inscripciones'],
  evaluacionesTodera: ['lineas-producto', 'admin-panel', 'evaluaciones-todera'],
  gestionInstructoras: ['lineas-producto', 'admin-panel', 'gestion-instructoras'],
  instructoras: ['lineas-producto', 'admin-panel', 'instructoras'],
  instructorasPorCategoria: (categoria) => [
    'lineas-producto',
    'admin-panel',
    'instructoras',
    String(categoria || '').toLowerCase(),
  ],
};

export const ROLES_PUNTO_VENTA_CHECK = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA',
];

export const ROLES_HELADERIA = [
  'COORDINADORA HELADERIA',
  'COORDINADOR DE ZONA',
  'COORDINADOR (A) HELADERIA PRINCIPAL',
];

export const ROLES_PUNTO_VENTA = [...ROLES_PUNTO_VENTA_CHECK];

export const ROLES_VER_TODO = [
  'ANALISTA EVENTOS Y HELADERIAS',
  'JEFE OPERATIVO DE MERCADEO',
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
];

export const ROLES_VER_AMBAS_TABLAS = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA',
  'JEFE OPERATIVO DE MERCADEO',
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
  'INSTRUCTOR',
];

export const ROLES_ACCESO_DUAL = [
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
];

export const CARGOS_RESTRINGIDOS = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR (A) HELADERIA PRINCIPAL',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA',
  'COORDINADORA HELADERIA',
  'COORDINADOR DE ZONA',
];

export const ROLES_VER_ESTADO_OBS = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA',
  'JEFE DESARROLLO DE PRODUCTO',
  'DIRECTORA DE LINEAS DE PRODUCTO',
  'ANALISTA DE PRODUCTO',
];

export const CATEGORIAS_INSTRUCTORAS = ['SAL', 'DULCE', 'BEBIDAS', 'BRUNCH'];

export const INITIAL_FILTROS = {
  cedula: '',
  puntoVenta: '',
  fecha: '',
};

export const INITIAL_FILTROS_TODERA = {
  cedula: '',
  puntoVenta: '',
  fecha: '',
  instructora: '',
};

export const INITIAL_FORM_GESTION = {
  pdvId: '',
  categoria: '',
  instructoraId: '',
};

export const INITIAL_FORM_NUEVA_INSTRUCTORA = {
  documento: '',
  nombre: '',
  telefono: '',
  correo: '',
  sal: false,
  dulce: false,
  bebidas: false,
  brunch: false,
  habilitado: true,
};

export const INITIAL_FILTROS_GESTION = {
  puntoVenta: '',
  categoria: '',
};

export function getVistaInicial(cargoUsuario) {
  return ROLES_PUNTO_VENTA_CHECK.includes(cargoUsuario) ? 'seleccion_menu' : 'panel';
}

export function getRoleFlags(cargoUsuario) {
  return {
    esRolPuntoVenta: ROLES_PUNTO_VENTA.includes(cargoUsuario),
    esRolHeladeria: ROLES_HELADERIA.includes(cargoUsuario),
    esAccesoDual: ROLES_ACCESO_DUAL.includes(cargoUsuario),
    puedeVerTodo: ROLES_VER_TODO.includes(cargoUsuario),
    puedeVerAmbasTablas: ROLES_VER_AMBAS_TABLAS.includes(cargoUsuario),
  };
}

export function puedeEliminarPorCargo(cargoUsuario) {
  return !CARGOS_RESTRINGIDOS.includes(cargoUsuario);
}

export function mapCapCafeItem(item) {
  return {
    id: item.id,
    cedula: item.attributes?.documento || '',
    nombres: item.attributes?.nombre || '',
    telefono: item.attributes?.telefono || '',
    cargo: item.attributes?.cargo || '',
    cargoEvaluar: item.attributes?.cargo_evaluar || item.attributes?.cargoEvaluar || '',
    puntoVenta: item.attributes?.pdv || '',
    dia: item.attributes?.fecha || '',
    coordinadora: item.attributes?.coordinadora || '',
    nombreLider: item.attributes?.lider || '',
    tipoFormulario: item.attributes?.tipo_formulario || '',
    asistencia: item.attributes?.confirmado ?? null,
  };
}

export function mapToderaItem(item) {
  return {
    id: item.id,
    cedula: item.attributes?.documento || '',
    nombres: item.attributes?.nombre || item.attributes?.Nombre || '',
    telefono: item.attributes?.telefono || '',
    cargo: item.attributes?.cargo || '',
    cargoEvaluar: item.attributes?.cargo_evaluar || item.attributes?.cargoEvaluar || '',
    puntoVenta: item.attributes?.pdv || '',
    dia: item.attributes?.fecha || '',
    nombreLider: item.attributes?.lider || '',
    foto: item.attributes?.foto || '',
    categoria: item.attributes?.categoria || '',
    evaluado: item.attributes?.estado ?? null,
    observacion: item.attributes?.observacion || '',
  };
}

export function filterDataByRole(data, roleContext) {
  const { puedeVerTodo, esRolHeladeria, esRolPuntoVenta, puntoVentaUsuarioActual } = roleContext;

  if (puedeVerTodo) {
    return data;
  }

  if (esRolHeladeria || esRolPuntoVenta) {
    return data.filter((item) => (item.puntoVenta || '') === puntoVentaUsuarioActual);
  }

  return data;
}

export function filterInscripciones(items, filtros, tabActivo = 'todos') {
  let dataTemp = [...items];

  if (tabActivo === 'hel') {
    dataTemp = dataTemp.filter((item) => item.tipoFormulario === 'heladeria');
  } else if (tabActivo === 'pdv') {
    dataTemp = dataTemp.filter((item) => item.tipoFormulario === 'punto_venta');
  }

  if (filtros.cedula) {
    dataTemp = dataTemp.filter((item) => item.cedula && item.cedula.toString().includes(filtros.cedula));
  }

  if (filtros.puntoVenta) {
    const filtroPdv = filtros.puntoVenta.toLowerCase();
    dataTemp = dataTemp.filter((item) => item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtroPdv));
  }

  if (filtros.fecha) {
    dataTemp = dataTemp.filter((item) => item.dia && item.dia === filtros.fecha);
  }

  return dataTemp;
}

export function filterEvaluacionesTodera(items, filtros) {
  let dataTemp = [...items];

  if (filtros.cedula) {
    dataTemp = dataTemp.filter((item) => item.cedula && item.cedula.toString().includes(filtros.cedula));
  }

  if (filtros.puntoVenta) {
    const filtroPdv = filtros.puntoVenta.toLowerCase();
    dataTemp = dataTemp.filter((item) => item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtroPdv));
  }

  if (filtros.fecha) {
    dataTemp = dataTemp.filter((item) => item.dia && item.dia === filtros.fecha);
  }

  if (filtros.instructora) {
    const filtroInstructora = filtros.instructora.toLowerCase();
    dataTemp = dataTemp.filter((item) => item.nombreLider && item.nombreLider.toLowerCase().includes(filtroInstructora));
  }

  return dataTemp;
}

export function filterGestionInstructoras(items, filtros) {
  if (!filtros.puntoVenta) {
    return [...items];
  }

  const filtroPdv = filtros.puntoVenta.toLowerCase();
  return items.filter((item) => item.puntoVenta.toLowerCase().includes(filtroPdv));
}

export function buildGestionInstructorasRows(pdvs) {
  const filas = [];

  pdvs.forEach((pdvItem) => {
    const pdvId = pdvItem?.id;
    const pdvNombre = pdvItem?.attributes?.nombre || '';
    const instructoras = pdvItem?.attributes?.cap_instructoras?.data || [];
    const categoriaMap = {
      sal: null,
      dulce: null,
      bebidas: null,
      brunch: null,
    };

    instructoras.forEach((insItem) => {
      const attrs = insItem?.attributes || {};
      const nombreInstructora = attrs?.Nombre || attrs?.nombre || `Instructora ${insItem.id}`;
      const instructoraId = insItem.id;

      if (attrs.sal === true) categoriaMap.sal = { instructoraId, instructoraNombre: nombreInstructora };
      if (attrs.dulce === true) categoriaMap.dulce = { instructoraId, instructoraNombre: nombreInstructora };
      if (attrs.bebidas === true) categoriaMap.bebidas = { instructoraId, instructoraNombre: nombreInstructora };
      if (attrs.brunch === true || attrs.Brunch === true) categoriaMap.brunch = { instructoraId, instructoraNombre: nombreInstructora };
    });

    filas.push({
      key: `${pdvId}`,
      pdvId,
      puntoVenta: pdvNombre,
      sal: categoriaMap.sal,
      dulce: categoriaMap.dulce,
      bebidas: categoriaMap.bebidas,
      brunch: categoriaMap.brunch,
      instructorasIds: instructoras.map((item) => item.id),
    });
  });

  return filas;
}

export function mapInstructoraDisponible(item) {
  return {
    id: item.id,
    nombre: item?.attributes?.Nombre || item?.attributes?.nombre || `Instructora ${item.id}`,
    habilitado: item?.attributes?.habilitado !== false,
  };
}

export function getCategoriaField(categoria) {
  return String(categoria || '').toLowerCase();
}

export function obtenerInstructorasTodera(inscripcionesTodera) {
  return [...new Set(inscripcionesTodera.map((item) => item.nombreLider).filter(Boolean))].sort();
}

export function getUniqueSortedValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort();
}

export function getUniqueDatesDesc(items) {
  return getUniqueSortedValues(items, 'dia').sort((a, b) => b.localeCompare(a));
}

export function formatIsoDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const [year, month, day] = dateValue.split('-');
  return day && month && year ? `${day}/${month}/${year}` : dateValue;
}

export function getPdvOptionsFromGestion(gestionInstructoras) {
  return [...new Map(
    gestionInstructoras
      .filter((item) => item.pdvId && item.puntoVenta)
      .map((item) => [item.pdvId, item])
  ).values()].sort((a, b) => (a.puntoVenta || '').localeCompare(b.puntoVenta || ''));
}

export function getCedulasFromRows(rows) {
  return [...new Set(
    rows
      .map((item) => String(item?.cedula || '').trim())
      .filter(Boolean)
  )];
}

export function getStrapiJsonHeaders(strapiToken) {
  return {
    'Content-Type': 'application/json',
    ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
  };
}

export function validateNuevaInstructora(formNuevaInstructora) {
  const documento = formNuevaInstructora.documento.trim();
  const nombre = formNuevaInstructora.nombre.trim();
  const telefono = formNuevaInstructora.telefono.trim();
  const correo = formNuevaInstructora.correo.trim();
  const tieneCategoria = CATEGORIAS_INSTRUCTORAS.some((categoria) => formNuevaInstructora[getCategoriaField(categoria)]);

  if (!documento) return { valid: false, message: 'Ingresa el documento de la instructora' };
  if (!nombre) return { valid: false, message: 'Ingresa el nombre de la instructora' };
  if (!telefono) return { valid: false, message: 'Ingresa el telefono de la instructora' };
  if (!correo) return { valid: false, message: 'Ingresa el correo de la instructora' };
  if (!tieneCategoria) return { valid: false, message: 'Selecciona al menos una categoria' };

  return { valid: true };
}

export function buildNuevaInstructoraPayload(formNuevaInstructora) {
  return {
    data: {
      documento: formNuevaInstructora.documento.trim(),
      Nombre: formNuevaInstructora.nombre.trim(),
      telefono: formNuevaInstructora.telefono.trim(),
      correo: formNuevaInstructora.correo.trim(),
      sal: formNuevaInstructora.sal,
      dulce: formNuevaInstructora.dulce,
      bebidas: formNuevaInstructora.bebidas,
      brunch: formNuevaInstructora.brunch,
      habilitado: formNuevaInstructora.habilitado,
    },
  };
}

export function buildInscripcionesExportRows(dataFiltrada) {
  return dataFiltrada.map((item, index) => ({
    'No.': index + 1,
    Cedula: item.cedula || '',
    Nombres: item.nombres || '',
    Telefono: item.telefono || '',
    Cargo: item.cargo || '',
    'Punto de Venta': item.puntoVenta || '',
    'Nombre Lider': item.nombreLider || '',
    Asistencia: item.asistencia === null ? 'Pendiente' : (item.asistencia ? 'Asistio' : 'No asistio'),
    Dia: item.dia || '',
  }));
}

export function buildToderaExportRows(dataFiltradaTodera) {
  return dataFiltradaTodera.map((item, index) => ({
    'No.': index + 1,
    Cedula: item.cedula || '',
    Nombres: item.nombres || '',
    Telefono: item.telefono || '',
    'Cargo a Evaluar': item.cargoEvaluar || item.cargo || '',
    'Punto de Venta': item.puntoVenta || '',
    'Nombre Lider': item.nombreLider || '',
    Categoria: item.categoria || '',
    'Dia Inscripcion': item.dia || '',
  }));
}
