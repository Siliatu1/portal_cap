export const ADMIN_PANEL_CACHE_KEY = 'lineasProductoAdminPanel';

export const ROLES_PUNTO_VENTA_CHECK = [
  'ADMINISTRADORA PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA',
  'COORDINADOR PUNTO DE VENTA (FDS)',
  'GERENTE PUNTO DE VENTA'
];

export const ROLES_HELADERIA = [
  'COORDINADORA HELADERIA',
  'COORDINADOR DE ZONA',
  'COORDINADOR (A) HELADERIA PRINCIPAL'
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
  'INSTRUCTOR'
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
  'COORDINADOR DE ZONA'
];

export const INITIAL_FILTROS = {
  cedula: '',
  puntoVenta: '',
  fecha: ''
};

export const INITIAL_FILTROS_TODERA = {
  cedula: '',
  puntoVenta: '',
  fecha: '',
  instructora: ''
};

export const INITIAL_FORM_GESTION = {
  pdvId: '',
  categoria: '',
  instructoraId: ''
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
  habilitado: true
};

export const INITIAL_FILTROS_GESTION = {
  puntoVenta: '',
  categoria: ''
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
    puntoVenta: item.attributes?.pdv || '',
    dia: item.attributes?.fecha || '',
    coordinadora: item.attributes?.coordinadora || '',
    nombreLider: item.attributes?.lider || '',
    tipoFormulario: item.attributes?.tipo_formulario || '',
    asistencia: item.attributes?.confirmado ?? null
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
    categoria: item.attributes?.categoria || '',
    evaluado: item.attributes?.estado ?? null,
    observacion: item.attributes?.observacion || '',
  };
}

export function filterDataByRole(data, { puedeVerTodo, esRolHeladeria, esRolPuntoVenta, puntoVentaUsuarioActual }) {
  if (puedeVerTodo) {
    return data;
  }

  if (esRolHeladeria || esRolPuntoVenta) {
    return data.filter((item) => (item.puntoVenta || '') === puntoVentaUsuarioActual);
  }

  return data;
}

export function filterInscripciones(items, filtros, tabActivo) {
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
    dataTemp = dataTemp.filter((item) => item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtros.puntoVenta.toLowerCase()));
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
    dataTemp = dataTemp.filter((item) => item.puntoVenta && item.puntoVenta.toLowerCase().includes(filtros.puntoVenta.toLowerCase()));
  }

  if (filtros.fecha) {
    dataTemp = dataTemp.filter((item) => item.dia && item.dia === filtros.fecha);
  }

  if (filtros.instructora) {
    dataTemp = dataTemp.filter((item) => item.nombreLider && item.nombreLider.toLowerCase().includes(filtros.instructora.toLowerCase()));
  }

  return dataTemp;
}

export function filterGestionInstructoras(items, filtros) {
  let dataTemp = [...items];

  if (filtros.puntoVenta) {
    dataTemp = dataTemp.filter((item) => item.puntoVenta.toLowerCase().includes(filtros.puntoVenta.toLowerCase()));
  }

  return dataTemp;
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
      brunch: null
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
      instructorasIds: instructoras.map((item) => item.id)
    });
  });

  return filas;
}

export function mapInstructoraDisponible(item) {
  return {
    id: item.id,
    nombre: item?.attributes?.Nombre || item?.attributes?.nombre || `Instructora ${item.id}`,
    habilitado: item?.attributes?.habilitado !== false
  };
}
