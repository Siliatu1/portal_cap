import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'antd';
import 'antd/dist/reset.css';
import '../styles/ProgramacionHorarios.css';
import { createHorarioInstructora, getHorariosInstructoras, getPdvIps, updateHorarioInstructora } from '../../../services/apiService';
import { useAuth } from '../../../shared/context/AuthContext';

function ProgramacionHorarios() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [loadingPuntos, setLoadingPuntos] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Estado para el modal de edición/creación
  const [modalEditar, setModalEditar] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null); // { dia: 'lunes', index: 0 }
  const [eventoEditarModal, setEventoEditarModal] = useState(null);
  const [formDataModal, setFormDataModal] = useState({
    puntoVenta: '',
    horaInicio: '',
    horaFin: '',
    motivo: '',
    detalleCubrir: '',
    detalleOtro: ''
  });
  const [showMoreMotivosModal, setShowMoreMotivosModal] = useState(false);
  const [guardandoDia, setGuardandoDia] = useState(false);
  
  // Estados para programación semanal
  const [diaActual, setDiaActual] = useState(0); // 0=Lunes, 6=Domingo
  const [semanaOffset, setSemanaOffset] = useState(0); // Offset de semanas para navegar
  const [programacionSemanal, setProgramacionSemanal] = useState({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  });
  
  const [pdvSearchText, setPdvSearchText] = useState('');
  const [showPdvDropdown, setShowPdvDropdown] = useState(false);
  
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasSemanaLabel = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Función para obtener las fechas de la próxima semana (desde el próximo lunes)
  const getFechasSemana = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes, etc.
    const proximoLunes = new Date(hoy);
    
    // Calcular cuántos días faltan para el próximo lunes
    let diasHastaProximoLunes;
    if (diaSemana === 0) { // Domingo
      diasHastaProximoLunes = 1;
    } else if (diaSemana === 1) { // Lunes
      diasHastaProximoLunes = 7; // Siguiente lunes
    } else { // Martes a Sábado
      diasHastaProximoLunes = 8 - diaSemana;
    }
    
    proximoLunes.setDate(hoy.getDate() + diasHastaProximoLunes + (semanaOffset * 7));
    
    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(proximoLunes);
      fecha.setDate(proximoLunes.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };
  
  const fechasSemana = useMemo(() => getFechasSemana(), [semanaOffset]);

  const pdvsFiltrados = useMemo(() => {
    if (!pdvSearchText) return puntosVenta.slice(0, 20);
    return puntosVenta
      .filter(p => p.nombre.toLowerCase().includes(pdvSearchText.toLowerCase()))
      .slice(0, 20);
  }, [pdvSearchText, puntosVenta]);
  
  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  };
  
  const motivosLabels = {
    'retroalimentacion': 'Retroalimentación',
    'acompañamiento': 'Acompañamiento',
    'capacitacion': 'Capacitación',
    'visita': 'Visita',
    'induccion': 'Inducción',
    'cubrir_puesto': 'Cubrir Puesto',
    'disponible': 'Disponible',
    'fotos': 'Fotos',
    'escuela_cafe': 'Escuela del Café',
    'sintonizarte': 'Sintonizarte',
    'viaje': 'Viaje',
    'pg': 'P&G',
    'apoyo': 'Apoyo',
    'reunion': 'Reunión',
    'cambio_turno': 'Cambio de Turno',
    'apertura': 'Apertura',
    'lanzamiento': 'Lanzamiento',
    'vacaciones': 'Vacaciones',
    'incapacidad': 'Incapacidad',
    'dia_familia': 'Día de la Familia',
    'permiso_no_remunerado': 'Permiso No Remunerado',
    'licencia_no_remunerada': 'Licencia No Remunerada',
    'licencia_remunerada': 'Licencia Remunerada',
    'licencia_luto': 'Licencia por Luto',
    'otro': 'Otro'
  };
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    puntoVenta: '',
    horaInicio: '',
    horaFin: '',
    motivo: '',
    detalleCubrir: '',
    detalleOtro: ''
  });

  // Función para calcular horas entre dos tiempos
  const calcularHoras = (horaInicio, horaFin) => {
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFi, minFi] = horaFin.split(':').map(Number);
    const totalHoras = (horaFi * 60 + minFi - (horaIni * 60 + minIni)) / 60;
    return totalHoras;
  };

  // Función para calcular total de horas de un día
  const calcularHorasDia = (dia) => {
    const eventos = programacionSemanal[dia];
    return eventos.reduce((total, evento) => {
      // Si no tiene horas (día de descanso), retornar 0
      if (!evento.horaInicio || !evento.horaFin || evento.motivo === 'dia_descanso') {
        return total;
      }
      return total + calcularHoras(evento.horaInicio, evento.horaFin);
    }, 0);
  };

  // Función para calcular total de horas de la semana
  const calcularTotalHorasSemana = () => {
    return diasSemana.reduce((total, dia) => {
      return total + calcularHorasDia(dia);
    }, 0);
  };

  // Función para abrir modal para agregar evento en un día específico
  const handleAgregarEventoDia = (diaKey, diaIndex) => {
    setDiaSeleccionado({ dia: diaKey, index: diaIndex });
    setEventoEditarModal(null);
    setFormDataModal({
      puntoVenta: '',
      horaInicio: '',
      horaFin: '',
      motivo: '',
      detalleCubrir: '',
      detalleOtro: ''
    });
    setPdvSearchText('');
    setShowPdvDropdown(false);
    setShowMoreMotivosModal(false);
    setModalEditar(true);
  };

  // Función para obtener información de la semana
  const getInfoSemana = () => {
    const primerDia = fechasSemana[0];
    const ultimoDia = fechasSemana[6];
    const mes = primerDia.getMonth();
    const año = primerDia.getFullYear();
    
    // Obtener número de semana del mes
    const primerDiaMes = new Date(año, mes, 1);
    const diasHastaPrimerLunes = (8 - primerDiaMes.getDay()) % 7;
    const numeroSemana = Math.ceil((primerDia.getDate() - diasHastaPrimerLunes) / 7) + 1;
    
    return {
      numeroSemana,
      fechaInicio: primerDia,
      fechaFin: ultimoDia
    };
  };

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const datosUsuario = userData;
    if (!datosUsuario) {
      logout();
      return;
    }

    const instructoraData = {
      documento: datosUsuario?.document_number || '',
      nombre: datosUsuario?.nombre || '',
      correo: datosUsuario?.correo || '',
      telefono: datosUsuario?.Celular || '',
      foto: datosUsuario?.foto || ''
    };

    setUser(instructoraData);
  }, [logout, navigate, userData]);

  // Guardar programación en localStorage cuando cambie
  useEffect(() => {
    const infoSemana = getInfoSemana();
    const dataParaGuardar = {
      programacion: programacionSemanal,
      semana: {
        numero: infoSemana.numeroSemana,
        fechaInicio: infoSemana.fechaInicio.toISOString(),
        fechaFin: infoSemana.fechaFin.toISOString()
      }
    };
    localStorage.setItem('programacionSemanal', JSON.stringify(dataParaGuardar));
  }, [programacionSemanal]);

  // Cargar horarios desde el API cuando el usuario esté disponible
  useEffect(() => {
    if (!user || fechasSemana.length === 0) return;

    const cargarHorariosAPI = async () => {
      try {
        const documento = user.documento;
        if (!documento) return;

        // Usar las fechas de la semana calculadas
        const fechaInicio = fechasSemana[0];
        const fechaFin = fechasSemana[6];

        const fechaInicioStr = `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}-${String(fechaInicio.getDate()).padStart(2, '0')}`;
        const fechaFinStr = `${fechaFin.getFullYear()}-${String(fechaFin.getMonth() + 1).padStart(2, '0')}-${String(fechaFin.getDate()).padStart(2, '0')}`;

        const response = await getHorariosInstructoras(`filters[documento][$eq]=${documento}&filters[fecha][$gte]=${fechaInicioStr}&filters[fecha][$lte]=${fechaFinStr}&pagination[pageSize]=40000`);
        
        if (response.data?.data && response.data.data.length > 0) {
          // Convertir los datos del API al formato interno
          const nuevaProgramacion = {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
          };

          response.data.data.forEach(item => {
            // Parsear la fecha del API (formato: YYYY-MM-DD)
            const fechaStr = item.attributes.fecha;
            const [year, month, day] = fechaStr.split('-').map(Number);
            const fechaItem = new Date(year, month - 1, day);
            
            // Buscar el día de la semana comparando con fechasSemana
            let diaIndex = -1;
            for (let i = 0; i < fechasSemana.length; i++) {
              const fechaSemana = fechasSemana[i];
              if (
                fechaSemana.getFullYear() === fechaItem.getFullYear() &&
                fechaSemana.getMonth() === fechaItem.getMonth() &&
                fechaSemana.getDate() === fechaItem.getDate()
              ) {
                diaIndex = i;
                break;
              }
            }
            
            // Si no se encuentra el día, saltar este ítem
            if (diaIndex === -1) return;
            
            const diaKey = diasSemana[diaIndex];
            
            // Determinar el motivo basado en la actividad
            const actividad = item.attributes.actividad;
            let motivo = 'otro';
            let detalleOtro = actividad;
            let detalleCubrir = '';
            
            // Mapear actividades a motivos
            const actividadAMotivo = {
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
            
            if (actividadAMotivo[actividad]) {
              motivo = actividadAMotivo[actividad];
              detalleOtro = '';
            }

            nuevaProgramacion[diaKey].push({
              puntoVenta: item.attributes.pdv_nombre,
              puntoVentaId: '', // Se completará después cuando los puntos de venta estén cargados
              horaInicio: item.attributes.hora_inicio ? item.attributes.hora_inicio.substring(0, 5) : '',
              horaFin: item.attributes.hora_fin ? item.attributes.hora_fin.substring(0, 5) : '',
              motivo: motivo,
              detalleCubrir: detalleCubrir,
              detalleOtro: detalleOtro,
              fechaModificacion: item.attributes.updatedAt || item.attributes.createdAt,
              horaModificacion: new Date(item.attributes.updatedAt || item.attributes.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
              idAPI: item.id // Guardar el ID del API para futuras ediciones
            });
          });

          setProgramacionSemanal(nuevaProgramacion);
        }
      } catch (error) {
        console.error('Error al cargar horarios desde API:', error);
      }
    };

    cargarHorariosAPI();
  }, [user, semanaOffset]);

  // Cargar todos los puntos de venta del sistema
  useEffect(() => {
    cargarPuntosVenta();
  }, []);

  // Cargar todos los puntos de venta del sistema
  const cargarPuntosVenta = async () => {
    try {
      setLoadingPuntos(true);

      const pdvCacheKey = 'pdv_ips_all';
      const cachedPDV = localStorage.getItem(pdvCacheKey);
      
      if (cachedPDV) {
        const pdvData = JSON.parse(cachedPDV);
        setPuntosVenta(pdvData);
        setLoadingPuntos(false);
        return;
      }
      
      // Si no hay cache, cargar desde la API
      let allPdvs = [];
      let page = 1;
      const pageSize = 200;
      let hasMore = true;

      while (hasMore) {
        const response = await getPdvIps(`pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=pdv:asc`);
        const raw = response.data || response || [];
        if (!Array.isArray(raw) || raw.length === 0) { hasMore = false; break; }

        const pdvs = raw
          .map(item => ({
            id: item.id,
            nombre: item.attributes?.pdv || item.pdv || ''
          }))
          .filter(p => p.nombre);

        allPdvs = [...allPdvs, ...pdvs];
        const total = response.meta?.pagination?.total;
        if ((total && allPdvs.length >= total) || raw.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      const sortedPdvs = allPdvs.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPuntosVenta(sortedPdvs);
      

      localStorage.setItem(pdvCacheKey, JSON.stringify(sortedPdvs));
      
    } catch (error) {
      console.error('Error al cargar puntos de venta:', error);
      setPuntosVenta([]);
    } finally {
      setLoadingPuntos(false);
    }
  };

  const handleCerrarProgramacion = () => {
    if (window.confirm('¿Estás segura de que deseas cerrar la programación de esta semana y pasar a la siguiente?')) {
      // Limpiar la programación actual
      setProgramacionSemanal({
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
      });
      
      // Avanzar a la siguiente semana
      setSemanaOffset(prev => prev + 1);
      
      alert('✅ Programación cerrada. Ahora puedes programar la siguiente semana.');
    }
  };

  // Función para marcar un día como descanso directamente desde la tarjeta
  const handleDiaDescanso = async (diaKey, diaIndex) => {
    if (!user) return;
    if (!window.confirm(`¿Marcar el ${diasSemanaLabel[diaIndex]} como Día de Descanso?`)) return;
    setGuardandoDia(true);
    try {
      const fecha = fechasSemana[diaIndex];
      const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      const documento = user.documento;
      const datosAPI = {
        data: {
          pdv_nombre: 'N/A',
          fecha: fechaFormateada,
          hora_inicio: '00:00:00',
          hora_fin: '00:00:00',
          actividad: 'Día de Descanso',
          documento: String(documento)
        }
      };
      const response = await createHorarioInstructora(datosAPI);
      const idAPI = response.data.id;
      const eventoDescanso = {
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
      setProgramacionSemanal(prev => ({
        ...prev,
        [diaKey]: [...prev[diaKey], eventoDescanso]
      }));
      alert(`✅ ${diasSemanaLabel[diaIndex]} marcado como Día de Descanso`);
    } catch (error) {
      console.error('Error al guardar día de descanso:', error);
      alert('❌ Error al guardar. Intenta nuevamente.');
    } finally {
      setGuardandoDia(false);
    }
  };

  const handleEditarEvento = (dia, index, evento, diaIndex) => {
    console.log(' Editando evento:', { dia, index, evento });
    
    // Cargar datos en el formulario del modal
    setFormDataModal({
      puntoVenta: evento.puntoVenta && evento.puntoVenta !== 'N/A' ? evento.puntoVenta : '',
      horaInicio: evento.horaInicio || '',
      horaFin: evento.horaFin || '',
      motivo: evento.motivo || '',
      detalleCubrir: evento.detalleCubrir || '',
      detalleOtro: evento.detalleOtro || ''
    });
    
    // Pre-llenar el texto de búsqueda del PDV
    setPdvSearchText(evento.puntoVenta && evento.puntoVenta !== 'N/A' ? evento.puntoVenta : '');
    setShowPdvDropdown(false);
    
    // Verificar si necesita expandir motivos
    const motivosExpandibles = [
      'visita', 'induccion', 'cubrir_puesto', 'disponible',
      'fotos', 'escuela_cafe', 'sintonizarte', 'viaje', 'pg', 'apoyo', 'reunion',
      'cambio_turno', 'apertura', 'lanzamiento', 'vacaciones', 'incapacidad',
      'dia_familia', 'permiso_no_remunerado', 'licencia_no_remunerada',
      'licencia_remunerada', 'licencia_luto', 'otro'
    ];
    
    if (motivosExpandibles.includes(evento.motivo)) {
      setShowMoreMotivosModal(true);
    } else {
      setShowMoreMotivosModal(false);
    }
    
    // Guardar referencia del día y evento que se está editando
    setDiaSeleccionado({ dia, index: diaIndex });
    setEventoEditarModal({ dia, index });
    
    // Abrir modal
    setModalEditar(true);
  };

  const handleInputChangeModal = (e) => {
    const { name, value } = e.target;
    setFormDataModal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarEdicionModal = async () => {
    if (!diaSeleccionado) return;

    const { dia, index: diaIndex } = diaSeleccionado;

    // Validaciones
    if (!formDataModal.motivo) {
      alert('Por favor selecciona un motivo');
      return;
    }

    // Validar punto de venta solo si no es vacaciones
    if (formDataModal.motivo !== 'vacaciones' && !formDataModal.puntoVenta) {
      alert('Por favor selecciona un punto de venta');
      return;
    }
    if (formDataModal.motivo === 'cubrir_puesto' && !formDataModal.detalleCubrir) {
      alert('Por favor especifica a quién vas a cubrir');
      return;
    }

    if (formDataModal.motivo === 'otro' && !formDataModal.detalleOtro) {
      alert('Por favor especifica el detalle de la actividad');
      return;
    }

    // Validar horas solo si no es vacaciones
    if (formDataModal.motivo !== 'vacaciones') {
      if (!formDataModal.horaInicio || !formDataModal.horaFin) {
        alert('Por favor ingresa hora de inicio y fin en formato HH:MM');
        return;
      }

      const inicio = new Date(`2000-01-01T${formDataModal.horaInicio}`);
      const fin = new Date(`2000-01-01T${formDataModal.horaFin}`);

      if (fin <= inicio) {
        alert('La hora de fin debe ser mayor a la hora de inicio');
        return;
      }

      // Calcular horas del día excluyendo el evento que se está editando
      const horasTotales = programacionSemanal[dia].reduce((total, evento, idx) => {
        if (eventoEditarModal && idx === eventoEditarModal.index) return total; // Excluir el evento que se está editando
        if (evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') return total;
        
        const eventoInicio = new Date(`2000-01-01T${evento.horaInicio}`);
        const eventoFin = new Date(`2000-01-01T${evento.horaFin}`);
        const horas = (eventoFin - eventoInicio) / (1000 * 60 * 60);
        return total + horas;
      }, 0);

      const horasNuevas = (fin - inicio) / (1000 * 60 * 60);
      const totalConEdicion = horasTotales + horasNuevas;

      if (totalConEdicion > 7) {
        alert(`No puedes programar más de 7 horas por día. Ya tienes ${horasTotales.toFixed(1)} horas. Solo puedes agregar ${(7 - horasTotales).toFixed(1)} horas más.`);
        return;
      }

      // Validar que no se excedan las 42 horas semanales
      let horasSemanales = 0;
      diasSemana.forEach(diaKey => {
        programacionSemanal[diaKey].forEach((evento, idx) => {
          // Excluir el evento que se está editando
          if (diaKey === dia && eventoEditarModal && idx === eventoEditarModal.index) return;
          
          if (evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') return;
          
          if (evento.horaInicio && evento.horaFin) {
            const eventoInicio = new Date(`2000-01-01T${evento.horaInicio}`);
            const eventoFin = new Date(`2000-01-01T${evento.horaFin}`);
            const horas = (eventoFin - eventoInicio) / (1000 * 60 * 60);
            horasSemanales += horas;
          }
        });
      });

      const totalSemanalConNuevo = horasSemanales + horasNuevas;

      if (totalSemanalConNuevo > 42) {
        alert(`No puedes programar más de 42 horas por semana. Ya tienes ${horasSemanales.toFixed(1)} horas programadas. Solo puedes agregar ${(42 - horasSemanales).toFixed(1)} horas más.`);
        return;
      }
    }

    setGuardandoDia(true);

    try {
      // Obtener nombre del punto de venta directamente
      const puntoVentaNombre = formDataModal.puntoVenta || (formDataModal.motivo === 'vacaciones' ? 'N/A' : '');

      // Determinar la actividad según el motivo
      let actividad = motivosLabels[formDataModal.motivo] || formDataModal.motivo;
      if (formDataModal.motivo === 'cubrir_puesto') {
        actividad = `Cubrir Puesto - ${formDataModal.detalleCubrir}`;
      } else if (formDataModal.motivo === 'otro') {
        actividad = formDataModal.detalleOtro;
      }

      // Calcular la fecha del día
      const fecha = fechasSemana[diaIndex];
      const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

      // Preparar datos para el API
      const horaInicio = formDataModal.motivo === 'vacaciones' ? '00:00:00' : `${formDataModal.horaInicio}:00`;
      const horaFin = formDataModal.motivo === 'vacaciones' ? '00:00:00' : `${formDataModal.horaFin}:00`;
      
      const documento = user.documento;

      const datosAPI = {
        data: {
          pdv_nombre: puntoVentaNombre,
          fecha: fechaFormateada,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          actividad: actividad,
          documento: String(documento)
        }
      };

      let idAPI = null;

      // Si estamos editando, obtener el ID del API
      if (eventoEditarModal) {
        const eventoActual = programacionSemanal[dia][eventoEditarModal.index];
        idAPI = eventoActual?.idAPI;
      }

      // Actualizar en el API si tiene ID, sino crear nuevo
      if (idAPI) {
        await updateHorarioInstructora(idAPI, datosAPI);
      } else {
        const response = await createHorarioInstructora(datosAPI);
        idAPI = response.data.id;
      }

      // Crear evento actualizado para el estado local
      const eventoActualizado = {
        puntoVenta: puntoVentaNombre || 'N/A',
        puntoVentaId: '',
        horaInicio: formDataModal.motivo === 'vacaciones' ? '' : formDataModal.horaInicio,
        horaFin: formDataModal.motivo === 'vacaciones' ? '' : formDataModal.horaFin,
        motivo: formDataModal.motivo,
        detalleCubrir: formDataModal.detalleCubrir,
        detalleOtro: formDataModal.detalleOtro,
        fechaModificacion: new Date().toISOString(),
        horaModificacion: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        idAPI: idAPI
      };

      // Actualizar o agregar el evento en la programación local
      if (eventoEditarModal) {
        // Actualizar evento existente
        setProgramacionSemanal(prev => ({
          ...prev,
          [dia]: prev[dia].map((evt, i) => i === eventoEditarModal.index ? eventoActualizado : evt)
        }));
      } else {
        // Agregar nuevo evento
        setProgramacionSemanal(prev => ({
          ...prev,
          [dia]: [...prev[dia], eventoActualizado]
        }));
      }

      // Cerrar modal
      setModalEditar(false);
      setEventoEditarModal(null);
      setDiaSeleccionado(null);
      setGuardandoDia(false);
      
      alert(`✅ Día ${diasSemanaLabel[diaIndex]} guardado exitosamente`);
    } catch (error) {
      console.error('Error al guardar en el API:', error);
      setGuardandoDia(false);
      alert('❌ Error al guardar. Por favor intenta nuevamente.');
    }
  };

  const handleCerrarModal = () => {
    if (guardandoDia) return; // No cerrar si se está guardando
    setModalEditar(false);
    setEventoEditarModal(null);
    setDiaSeleccionado(null);
    setFormDataModal({
      puntoVenta: '',
      horaInicio: '',
      horaFin: '',
      motivo: '',
      detalleCubrir: '',
      detalleOtro: ''
    });
    setPdvSearchText('');
    setShowPdvDropdown(false);
    setShowMoreMotivosModal(false);
  };

  const handleDescargarPDF = () => {
    const infoSemana = getInfoSemana();
    const totalHoras = calcularTotalHorasSemana();
    
    // Crear array de todas las actividades de la semana
    const todasActividades = [];
    diasSemana.forEach((dia, index) => {
      const eventos = programacionSemanal[dia];
      eventos.forEach(evento => {
        todasActividades.push({
          dia: diasSemanaLabel[index],
          fecha: formatearFechaCompleta(fechasSemana[index]),
          actividad: evento.motivo === 'otro' ? evento.detalleOtro : (motivosLabels[evento.motivo] || evento.motivo),
          hora: (evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') ? 'Todo el día' : `${evento.horaInicio} - ${evento.horaFin}`,
          puntoVenta: evento.puntoVenta,
          detalleCubrir: evento.detalleCubrir,
          fechaMod: evento.fechaModificacion
        });
      });
    });

    const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Agenda Semanal - ${user?.nombre}</title>
          ${documentStyles}
        </head>
        <body class="programacion-print">
          <div class="programacion-print__header">
            <h1 class="programacion-print__title">Agenda Semanal de Capacitaciones</h1>
            <p><strong>Instructora:</strong> ${user?.nombre}</p>
            <p><strong>Documento:</strong> ${user?.documento || 'N/A'}</p>
          </div>
          
          <div class="programacion-print__summary">
            <h3 class="programacion-print__summary-title">Programación - Próxima Semana #${infoSemana.numeroSemana}</h3>
            <p><strong>Período:</strong> ${formatearFechaCompleta(infoSemana.fechaInicio)} - ${formatearFechaCompleta(infoSemana.fechaFin)}</p>
            <p><strong>Total de horas programadas:</strong> ${totalHoras.toFixed(1)} horas</p>
          </div>
          
          <table class="programacion-print__table">
            <thead>
              <tr>
                <th class="programacion-print__col-day">Día</th>
                <th class="programacion-print__col-date">Fecha</th>
                <th class="programacion-print__col-activity">Actividad</th>
                <th class="programacion-print__col-time">Hora</th>
                <th class="programacion-print__col-pdv">Punto de Venta</th>
              </tr>
            </thead>
            <tbody>
              ${todasActividades.length > 0 ? todasActividades.map(act => `
                <tr>
                  <td><strong>${act.dia}</strong></td>
                  <td>${act.fecha}</td>
                  <td>${act.actividad}</td>
                  <td>${act.hora}</td>
                  <td>
                    <div class="programacion-print__pdv">${act.puntoVenta}</div>
                    ${act.detalleCubrir ? `<div class="programacion-print__detail">Cubrir en: ${act.detalleCubrir}</div>` : ''}
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="programacion-print__empty"><em>No hay programación registrada</em></td></tr>'}
            </tbody>
          </table>
          
          <div class="programacion-print__footer">
            <p>Generado el ${new Date().toLocaleDateString('es-CO', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Función helper para formatear fecha completa
  const formatearFechaCompleta = (fecha) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
  };

  const handleLogoutClick = () => {
    if (window.confirm('¿Estás segura de que deseas cerrar sesión?')) {
      logout();
      navigate('/cap/cafe', { replace: true });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="programacion-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button 
              className="profile-button-avatar"
              onClick={toggleProfileModal}
              title="Ver perfil"
            >
              {user?.foto ? (
                <img src={user.foto} alt="Perfil" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-initials">
                  {getInitials(user?.nombre)}
                </div>
              )}
            </button>
            <div className="navbar-titles">
              <h1 className="navbar-title">Programación de Horarios</h1>
              <span className="navbar-subtitle">Gestión Semanal</span>
            </div>
          </div>
          
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
            title="Volver al inicio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Volver</span>
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="programacion-main">
        {/* Contador de horas y controles */}
        <div className="semana-info-section">
          <div className="semana-info-card">
            <div className="semana-detalle-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span><strong>Total programado:</strong> {calcularTotalHorasSemana().toFixed(1)} horas de la semana</span>
            </div>
          </div>
        </div>

        {/* Agenda Semanal Simplificada */}
        <div className="agenda-section-simplified">
          <div className="agenda-header-section">
            <button 
              className="btn-cerrar-programacion"
              onClick={handleCerrarProgramacion}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Cerrar programación
            </button>
          </div>
          
          <div className="agenda-grid-simplified">
            {diasSemana.map((dia, diaIndex) => {
              const eventos = programacionSemanal[dia];
              const horasDia = calcularHorasDia(dia);

              return (
                <div key={dia} className="dia-card">
                  <div className="dia-card-header">
                    <div className="dia-info">
                      <div className="dia-nombre">{diasSemanaLabel[diaIndex]}</div>
                      <div className="dia-fecha">{formatearFecha(fechasSemana[diaIndex])}</div>
                    </div>
                    <div className="dia-horas">{horasDia.toFixed(1)}h</div>
                  </div>

                  <div className="dia-card-body">
                    {eventos.length === 0 ? (
                      <div className="sin-eventos">
                        <p className="sin-eventos-text">Sin actividades</p>
                      </div>
                    ) : (
                      <div className="eventos-lista">
                        {eventos.map((evento, eventoIndex) => (
                          <div
                            key={eventoIndex}
                            className={`evento-item ${evento.motivo === 'dia_descanso' ? 'evento-item-readonly' : ''}`}
                            onClick={() => handleEditarEvento(dia, eventoIndex, evento, diaIndex)}
                          >
                            <div className="evento-hora">
                              {(evento.motivo === 'dia_descanso' || evento.motivo === 'vacaciones') ?
                                'Todo el día' :
                                `${evento.horaInicio} - ${evento.horaFin}`
                              }
                            </div>
                            <div className="evento-info">
                              <div className="evento-pdv">{evento.puntoVenta}</div>
                              <div className="evento-motivo">
                                {evento.motivo === 'otro' ? evento.detalleOtro :
                                 evento.motivo === 'cubrir_puesto' ? `Cubrir - ${evento.detalleCubrir}` :
                                 (motivosLabels[evento.motivo] || evento.motivo)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {eventos.length === 0 && (
                    <div className="dia-card-footer">
                      <button
                        className="btn-agregar-evento"
                        onClick={() => handleAgregarEventoDia(dia, diaIndex)}
                        disabled={loadingPuntos || guardandoDia}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agendar
                      </button>
                      <button
                        className="btn-dia-descanso"
                        onClick={() => handleDiaDescanso(dia, diaIndex)}
                        disabled={guardandoDia}
                        title="Marcar como día de descanso"
                      >
                        Descanso
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal de Perfil */}
      <Modal
        title="Perfil"
        open={showProfileModal}
        onCancel={toggleProfileModal}
        footer={[
          <Button
            key="logout"
            danger
            onClick={() => {
              if (window.confirm('¿Estás segura de que deseas cerrar sesión?')) {
                localStorage.removeItem('user');
                navigate('/', { replace: true });
              }
            }}
          >
            Cerrar Sesión
          </Button>,
        ]}
      >
        <div className="profile-modal-content">
          <div className="profile-avatar-modal profile-avatar-modal-centered">
            {getInitials(user?.nombre)}
          </div>
          <h3 className="profile-modal-heading">{user?.nombre}</h3>
          <p className="profile-modal-text"><strong>Cargo:</strong> {user?.cargo}</p>
          <p className="profile-modal-text"><strong>Documento:</strong> {user?.documento}</p>
        </div>
      </Modal>

      {/* Modal de Edición */}
      {modalEditar && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-edicion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{eventoEditarModal ? 'Editar Actividad' : 'Agregar Actividad'}</h3>
              <button className="btn-cerrar-modal" onClick={handleCerrarModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group-modal">
                <label>
                  Punto de Venta {formDataModal.motivo === 'vacaciones' ? '(opcional)' : '*'}
                </label>
                <div className="pdv-search-container">
                  <input
                    type="text"
                    className="form-input-modal"
                    placeholder={loadingPuntos ? 'Cargando puntos de venta...' : 'Escribe para buscar PDV...'}
                    value={pdvSearchText}
                    onChange={(e) => {
                      setPdvSearchText(e.target.value);
                      setShowPdvDropdown(true);
                      if (formDataModal.puntoVenta && e.target.value !== formDataModal.puntoVenta) {
                        setFormDataModal(prev => ({ ...prev, puntoVenta: '' }));
                      }
                    }}
                    onFocus={() => setShowPdvDropdown(true)}
                    onBlur={() => setTimeout(() => setShowPdvDropdown(false), 150)}
                    disabled={formDataModal.motivo === 'vacaciones' || loadingPuntos}
                    autoComplete="off"
                  />
                  {showPdvDropdown && pdvsFiltrados.length > 0 && (
                    <div className="pdv-dropdown">
                      {pdvsFiltrados.map(pdv => (
                        <div
                          key={pdv.id}
                          className="pdv-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormDataModal(prev => ({ ...prev, puntoVenta: pdv.nombre }));
                            setPdvSearchText(pdv.nombre);
                            setShowPdvDropdown(false);
                          }}
                        >
                          {pdv.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formDataModal.puntoVenta && (
                  <span className="pdv-selected-hint">
                    ✓ Seleccionado: {formDataModal.puntoVenta}
                  </span>
                )}
              </div>

              <div className="form-row-modal">
                <div className="form-group-modal">
                  <label htmlFor="horaInicio-modal">Hora Inicio <span className="form-label-helper">(formato 24h)</span></label>
                  <input
                    type="time"
                    id="horaInicio-modal"
                    name="horaInicio"
                    value={formDataModal.horaInicio}
                    onChange={handleInputChangeModal}
                    disabled={formDataModal.motivo === 'vacaciones'}
                    className="form-input-modal"
                  />
                </div>

                <div className="form-group-modal">
                  <label htmlFor="horaFin-modal">Hora Fin <span className="form-label-helper">(formato 24h)</span></label>
                  <input
                    type="time"
                    id="horaFin-modal"
                    name="horaFin"
                    value={formDataModal.horaFin}
                    onChange={handleInputChangeModal}
                    disabled={formDataModal.motivo === 'vacaciones'}
                    className="form-input-modal"
                  />
                </div>
              </div>

              <div className="form-group-modal">
                <label>Motivo / Actividad *</label>
                <div className="motivos-grid-modal">
                  <button
                    type="button"
                    className={`motivo-btn-modal ${formDataModal.motivo === 'retroalimentacion' ? 'active' : ''}`}
                    onClick={() => setFormDataModal({ ...formDataModal, motivo: 'retroalimentacion' })}
                  >
                    Retroalimentación
                  </button>
                  <button
                    type="button"
                    className={`motivo-btn-modal ${formDataModal.motivo === 'acompañamiento' ? 'active' : ''}`}
                    onClick={() => setFormDataModal({ ...formDataModal, motivo: 'acompañamiento' })}
                  >
                    Acompañamiento
                  </button>
                  <button
                    type="button"
                    className={`motivo-btn-modal ${formDataModal.motivo === 'capacitacion' ? 'active' : ''}`}
                    onClick={() => setFormDataModal({ ...formDataModal, motivo: 'capacitacion' })}
                  >
                    Capacitación
                  </button>
                  
                  {showMoreMotivosModal && (
                    <>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'visita' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'visita' })}
                      >
                        Visita
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'induccion' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'induccion' })}
                      >
                        Inducción
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'cubrir_puesto' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'cubrir_puesto' })}
                      >
                        Cubrir Puesto
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'disponible' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'disponible' })}
                      >
                        Disponible
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'fotos' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'fotos' })}
                      >
                        Fotos
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'escuela_cafe' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'escuela_cafe' })}
                      >
                        Escuela del Café
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'sintonizarte' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'sintonizarte' })}
                      >
                        Sintonizarte
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'viaje' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'viaje' })}
                      >
                        Viaje
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'pg' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'pg' })}
                      >
                        P&G
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'apoyo' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'apoyo' })}
                      >
                        Apoyo
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'reunion' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'reunion' })}
                      >
                        Reunión
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'cambio_turno' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'cambio_turno' })}
                      >
                        Cambio de Turno
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'apertura' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'apertura' })}
                      >
                        Apertura
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'lanzamiento' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'lanzamiento' })}
                      >
                        Lanzamiento
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'vacaciones' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'vacaciones' })}
                      >
                        Vacaciones
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'incapacidad' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'incapacidad' })}
                      >
                        Incapacidad
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'dia_familia' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'dia_familia' })}
                      >
                        Día de la Familia
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'permiso_no_remunerado' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'permiso_no_remunerado' })}
                      >
                        Permiso No Remunerado
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'licencia_no_remunerada' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'licencia_no_remunerada' })}
                      >
                        Licencia No Remunerada
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'licencia_remunerada' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'licencia_remunerada' })}
                      >
                        Licencia Remunerada
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'licencia_luto' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'licencia_luto' })}
                      >
                        Licencia por Luto
                      </button>
                      <button
                        type="button"
                        className={`motivo-btn-modal ${formDataModal.motivo === 'otro' ? 'active' : ''}`}
                        onClick={() => setFormDataModal({ ...formDataModal, motivo: 'otro' })}
                      >
                        Otro
                      </button>
                    </>
                  )}
                </div>
                
                {!showMoreMotivosModal ? (
                  <button
                    type="button"
                    className="btn-ver-mas-modal"
                    onClick={() => setShowMoreMotivosModal(true)}
                  >
                    Ver más opciones
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-ver-mas-modal"
                    onClick={() => setShowMoreMotivosModal(false)}
                  >
                    Ver menos opciones
                  </button>
                )}
              </div>

              {formDataModal.motivo === 'cubrir_puesto' && (
                <div className="form-group-modal">
                  <label htmlFor="detalleCubrir-modal">¿A quién vas a cubrir? *</label>
                  <input
                    type="text"
                    id="detalleCubrir-modal"
                    name="detalleCubrir"
                    value={formDataModal.detalleCubrir}
                    onChange={handleInputChangeModal}
                    placeholder="Nombre de la persona"
                    className="form-input-modal"
                  />
                </div>
              )}

              {formDataModal.motivo === 'otro' && (
                <div className="form-group-modal">
                  <label htmlFor="detalleOtro-modal">Especifica la actividad *</label>
                  <input
                    type="text"
                    id="detalleOtro-modal"
                    name="detalleOtro"
                    value={formDataModal.detalleOtro}
                    onChange={handleInputChangeModal}
                    placeholder="Describe la actividad"
                    className="form-input-modal"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar-modal" 
                onClick={handleCerrarModal}
                disabled={guardandoDia}
              >
                Cancelar
              </button>
              <button 
                className="btn-guardar-modal" 
                onClick={handleGuardarEdicionModal}
                disabled={guardandoDia}
              >
                {guardandoDia ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramacionHorarios;

