const API_BASES = {
	macfer: 'https://macfer.crepesywaffles.com/api',
	buk: 'https://apialohav2.crepesywaffles.com/buk',
	holidays: 'https://date.nager.at/api/v3',
};

const BUK_EMPLEADOS_CACHE_PREFIX = 'buk_empleados3_v2_';
const BUK_EMPLEADOS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const BUK_EMPLEADOS_AUDIT_KEY = '__bukEmpleados3Audit__';
const bukEmpleadosPendingRequests = new Map();

const getBukEmpleadoCacheKey = (documento) =>
	`${BUK_EMPLEADOS_CACHE_PREFIX}${String(documento || '').trim()}`;

const hasLocalStorage = () => typeof localStorage !== 'undefined';

const getAuditTarget = () => {
	if (typeof window !== 'undefined') {
		return window;
	}

	if (typeof globalThis !== 'undefined') {
		return globalThis;
	}

	return null;
};

const pushBukEmpleadoAudit = (source, documento, extra = {}) => {
	const target = getAuditTarget();
	const entry = {
		source,
		documento,
		timestamp: new Date().toISOString(),
		...extra,
	};

	if (typeof console !== 'undefined' && typeof console.info === 'function') {
		console.info(`[BUK empleados3][${source}] ${documento}`, entry);
	}

	if (!target) {
		return entry;
	}

	const currentEntries = Array.isArray(target[BUK_EMPLEADOS_AUDIT_KEY])
		? target[BUK_EMPLEADOS_AUDIT_KEY]
		: [];

	target[BUK_EMPLEADOS_AUDIT_KEY] = [...currentEntries.slice(-49), entry];

	if (typeof target.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
		target.dispatchEvent(new CustomEvent('buk-empleados3:audit', { detail: entry }));
	}

	return entry;
};

const clearBukEmpleadoAudit = () => {
	const target = getAuditTarget();
	if (!target) {
		return;
	}

	target[BUK_EMPLEADOS_AUDIT_KEY] = [];
};

const readBukEmpleadoCache = (documento) => {
	if (!hasLocalStorage()) {
		return null;
	}

	const cacheKey = getBukEmpleadoCacheKey(documento);
	const rawValue = localStorage.getItem(cacheKey);

	if (!rawValue) {
		return null;
	}

	try {
		const parsedValue = JSON.parse(rawValue);
		if (!parsedValue?.expiresAt || parsedValue.expiresAt <= Date.now()) {
			localStorage.removeItem(cacheKey);
			return null;
		}

		return parsedValue.payload ?? null;
	} catch {
		localStorage.removeItem(cacheKey);
		return null;
	}
};

const writeBukEmpleadoCache = (documento, payload) => {
	if (!hasLocalStorage()) {
		return;
	}

	const cacheKey = getBukEmpleadoCacheKey(documento);
	localStorage.setItem(
		cacheKey,
		JSON.stringify({
			payload,
			expiresAt: Date.now() + BUK_EMPLEADOS_CACHE_TTL_MS,
		})
	);
};

const clearBukEmpleadoCache = (documento) => {
	if (documento) {
		bukEmpleadosPendingRequests.delete(String(documento).trim());
		if (hasLocalStorage()) {
			localStorage.removeItem(getBukEmpleadoCacheKey(documento));
		}
		return;
	}

	bukEmpleadosPendingRequests.clear();

	if (!hasLocalStorage()) {
		return;
	}

	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith(BUK_EMPLEADOS_CACHE_PREFIX)) {
			localStorage.removeItem(key);
		}
	});
};

const buildUrl = (endpoint, api) => {
	if (/^https?:\/\//i.test(endpoint)) {
		return endpoint;
	}

	const base = API_BASES[api] || API_BASES.macfer;
	return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

const parseResponseBody = async (response) => {
	const contentType = response.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		return response.json();
	}

	const text = await response.text();
	return text ? { message: text } : null;
};

export const request = async (endpoint, options = {}) => {
	const {
		api = 'macfer',
		method = 'GET',
		headers = {},
		body,
		...rest
	} = options;

	const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
	const shouldSerializeBody = body !== undefined && body !== null && !isFormData && typeof body !== 'string';

	const requestHeaders = {
		...(shouldSerializeBody ? { 'Content-Type': 'application/json' } : {}),
		...headers,
	};

	const response = await fetch(buildUrl(endpoint, api), {
		method,
		headers: requestHeaders,
		body: body === undefined || body === null
			? undefined
			: shouldSerializeBody
				? JSON.stringify(body)
				: body,
		...rest,
	});

	const responseBody = await parseResponseBody(response);

	if (!response.ok) {
		const error = new Error(
			responseBody?.error?.message ||
			responseBody?.message ||
			`Request failed with status ${response.status}`
		);
		error.status = response.status;
		error.response = responseBody;
		throw error;
	}

	return responseBody;
};

export const loginByDocumento = async (documento) => {
	const response = await request(`/empleados3?documento=${encodeURIComponent(documento)}`, { api: 'buk' });
	const empleados = Array.isArray(response?.data) ? response.data : [];
	const empleado = empleados[0];

	if (!empleado) {
		const error = new Error('Empleado no encontrado');
		error.status = 404;
		error.response = response;
		throw error;
	}

	return empleado;
};

export const getBukEmpleadosByDocumento = async (documento) => {
	const normalizedDocumento = String(documento || '').trim();

	if (!normalizedDocumento) {
		return [];
	}

	const cachedResponse = readBukEmpleadoCache(normalizedDocumento);
	if (cachedResponse) {
		pushBukEmpleadoAudit('cache', normalizedDocumento);
		return cachedResponse;
	}

	const pendingRequest = bukEmpleadosPendingRequests.get(normalizedDocumento);
	if (pendingRequest) {
		pushBukEmpleadoAudit('in-flight', normalizedDocumento);
		return pendingRequest;
	}

	pushBukEmpleadoAudit('network', normalizedDocumento);

	const requestPromise = request(`/empleados3?documento=${encodeURIComponent(normalizedDocumento)}`, { api: 'buk' })
		.then((response) => {
			writeBukEmpleadoCache(normalizedDocumento, response);
			return response;
		})
		.finally(() => {
			bukEmpleadosPendingRequests.delete(normalizedDocumento);
		});

	bukEmpleadosPendingRequests.set(normalizedDocumento, requestPromise);
	return requestPromise;
};

export const __testing__ = {
	getBukEmpleadoCacheKey,
	clearBukEmpleadoCache,
	clearBukEmpleadoAudit,
	writeBukEmpleadoCache,
};

export const getPublicHolidays = (year, countryCode) =>
	request(`/PublicHolidays/${year}/${countryCode}`, { api: 'holidays' });

export const getCapCafes = () => request('/cap-cafes');

export const createCapCafe = (data) =>
	request('/cap-cafes', { method: 'POST', body: data });

export const updateCapCafe = (id, data) =>
	request(`/cap-cafes/${id}`, { method: 'PUT', body: data });

export const deleteCapCafe = (id) =>
	request(`/cap-cafes/${id}`, { method: 'DELETE' });

export const getCapToderas = () => request('/cap-toderas');

export const createCapTodera = (data) =>
	request('/cap-toderas', { method: 'POST', body: data });

export const updateCapTodera = (id, data) =>
	request(`/cap-toderas/${id}`, { method: 'PUT', body: data });

export const deleteCapTodera = (id) =>
	request(`/cap-toderas/${id}`, { method: 'DELETE' });

export const getCapCafeFechas = () => request('/cap-cafe-fechas');

export const createCapCafeFecha = (data) =>
	request('/cap-cafe-fechas', { method: 'POST', body: data });

export const deleteCapCafeFecha = (id) =>
	request(`/cap-cafe-fechas/${id}`, { method: 'DELETE' });

export const getCapPdvs = (query = '') =>
	request(`/cap-pdvs${query ? `?${query}` : ''}`);

export const getCapPdvById = (id, query = '') =>
	request(`/cap-pdvs/${id}${query ? `?${query}` : ''}`);

export const updateCapPdv = (id, data, headers = {}) =>
	request(`/cap-pdvs/${id}`, { method: 'PUT', body: data, headers });

export const getCapInstructoras = (query = '') =>
	request(`/cap-instructoras${query ? `?${query}` : ''}`);

export const createCapInstructora = (data, headers = {}) =>
	request('/cap-instructoras', { method: 'POST', body: data, headers });

export const updateCapInstructora = (id, data, headers = {}) =>
	request(`/cap-instructoras/${id}`, { method: 'PUT', body: data, headers });

export const getHorariosInstructoras = (query = '') =>
	request(`/horarios-instructoras${query ? `?${query}` : ''}`);

export const createHorarioInstructora = (data) =>
	request('/horarios-instructoras', { method: 'POST', body: data });

export const updateHorarioInstructora = (id, data) =>
	request(`/horarios-instructoras/${id}`, { method: 'PUT', body: data });

export const getPdvIps = (query = '') =>
	request(`/pdv-Ips${query ? `?${query}` : ''}`);
