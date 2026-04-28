import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, DatePicker, Modal, Select, Space } from 'antd';
import { DownloadOutlined, FileExcelOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css';
import '../styles/VistaAdministrativa.css';
import {
  getCapInstructoras,
  getCapPdvs,
  getHorariosInstructoras,
  updateHorarioInstructora
} from '../../../services/apiService';
import { useAuth } from '../../../shared/context/AuthContext';
import EditHorarioModal from './EditHorarioModal';
import VistaAdministrativaTable from './VistaAdministrativaTable';
import {
  ADMIN_ROLES,
  buildEditFormData,
  buildHorarioUpdatePayload,
  buildInstructorasList,
  buildWeeklyRows,
  createHorarioRecord,
  EXPANDABLE_MOTIVOS,
  getDefaultLunes,
  getInitials,
  getWeekDates,
  getWeekRangeLabel,
  INITIAL_MODAL_FORM,
  LINEA_OPTIONS,
  MOTIVO_OPTIONS_BASE,
  MOTIVO_OPTIONS_EXTRA,
  shiftWeek,
  toMonday,
  validateHorarioForm,
} from './vistaAdministrativa.helpers';

function VistaAdministrativa() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [instructoras, setInstructoras] = useState([]);
  const [instructoraSeleccionada, setInstructoraSeleccionada] = useState('todas');
  const [lineaSeleccionada, setLineaSeleccionada] = useState('todas');
  const [horariosTodos, setHorariosTodos] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [semanaLunes, setSemanaLunes] = useState(getDefaultLunes);
  const [modalEditar, setModalEditar] = useState(false);
  const [horarioEditar, setHorarioEditar] = useState(null);
  const [formDataModal, setFormDataModal] = useState(INITIAL_MODAL_FORM);
  const [showMoreMotivosModal, setShowMoreMotivosModal] = useState(false);

  useEffect(() => {
    if (!userData) {
      logout();
      return;
    }

    const cargoUsuario = userData?.cargo || '';
    if (!ADMIN_ROLES.includes(cargoUsuario)) {
      navigate('/menu', { replace: true });
      return;
    }

    setUser({
      documento: userData?.document_number || '',
      nombre: userData?.nombre || '',
      correo: userData?.correo || '',
      cargo: cargoUsuario,
      foto: userData?.foto || ''
    });
  }, [logout, navigate, userData]);

  useEffect(() => {
    const cargarPuntosVenta = async () => {
      try {
        const response = await getCapPdvs('pagination[pageSize]=1000&filters[activo][$eq]=true');

        if (response.data?.length) {
          setPuntosVenta(
            response.data
              .map((pdv) => ({ id: pdv.id, nombre: pdv.attributes.nombre }))
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
        }
      } catch (error) {
        console.error('Error al cargar puntos de venta:', error);
      }
    };

    cargarPuntosVenta();
  }, []);

  useEffect(() => {
    if (!user) return;

    const cargarDatos = async () => {
      try {
        const fechaInicioStr = dayjs(semanaLunes).format('YYYY-MM-DD');
        const fechaFinStr = dayjs(shiftWeek(semanaLunes, 6)).format('YYYY-MM-DD');
        const queryInstructoras = lineaSeleccionada !== 'todas'
          ? `filters[${lineaSeleccionada}][$eq]=true&pagination[pageSize]=1000`
          : 'pagination[pageSize]=1000';

        const responseInstructoras = await getCapInstructoras(queryInstructoras);
        const instructorasData = Array.isArray(responseInstructoras.data) ? responseInstructoras.data : [];
        const documentosInstructoras = instructorasData
          .map((inst) => String(inst.attributes.documento || '').trim())
          .filter(Boolean);
        const instructorasMap = new Map(
          instructorasData.map((inst) => {
            const documento = String(inst.attributes.documento || '').trim();
            const nombre = inst.attributes.Nombre || inst.attributes.nombre || `Instructora ${documento}`;
            return [documento, nombre];
          })
        );

        const responseHorarios = await getHorariosInstructoras(
          `filters[fecha][$gte]=${fechaInicioStr}&filters[fecha][$lte]=${fechaFinStr}&pagination[pageSize]=40000`
        );

        let horariosConDatos = Array.isArray(responseHorarios.data)
          ? responseHorarios.data.map(createHorarioRecord)
          : [];

        if (lineaSeleccionada !== 'todas') {
          horariosConDatos = horariosConDatos.filter((horario) => (
            documentosInstructoras.includes(String(horario.documento).trim())
          ));
        }

        horariosConDatos.sort((a, b) => {
          if (a.fecha.getTime() !== b.fecha.getTime()) {
            return a.fecha - b.fecha;
          }

          return a.horaInicio.localeCompare(b.horaInicio);
        });

        setHorariosTodos(horariosConDatos);
        setInstructoras(buildInstructorasList(horariosConDatos, instructorasMap));
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos. Por favor intenta nuevamente.');
      }
    };

    cargarDatos();
  }, [lineaSeleccionada, semanaLunes, user]);

  const fechasSemana = useMemo(() => getWeekDates(semanaLunes), [semanaLunes]);
  const weekRangeLabel = useMemo(() => getWeekRangeLabel(semanaLunes), [semanaLunes]);

  const horariosFiltered = useMemo(() => (
    instructoraSeleccionada === 'todas'
      ? horariosTodos
      : horariosTodos.filter((horario) => horario.documento === instructoraSeleccionada)
  ), [horariosTodos, instructoraSeleccionada]);

  const instructoraOptions = useMemo(() => ([
    { value: 'todas', label: 'Todas las Instructoras' },
    ...instructoras.map((inst) => ({ value: inst.documento, label: inst.nombre }))
  ]), [instructoras]);

  const pdvOptions = useMemo(() => puntosVenta.map((pdv) => ({
    value: String(pdv.id),
    label: pdv.nombre,
  })), [puntosVenta]);

  const motivoOptions = useMemo(() => (
    showMoreMotivosModal ? [...MOTIVO_OPTIONS_BASE, ...MOTIVO_OPTIONS_EXTRA] : MOTIVO_OPTIONS_BASE
  ), [showMoreMotivosModal]);

  const datosSemanal = useMemo(
    () => buildWeeklyRows(fechasSemana, horariosFiltered, instructoras),
    [fechasSemana, horariosFiltered, instructoras]
  );

  const handleLogout = () => {
    logout();
    navigate('/cap/cafe', { replace: true });
  };

  const handleCerrarModal = () => {
    setModalEditar(false);
    setHorarioEditar(null);
    setFormDataModal(INITIAL_MODAL_FORM);
    setShowMoreMotivosModal(false);
  };

  const handleEditarHorario = (horario) => {
    const { formData, showMoreMotivos } = buildEditFormData(horario, puntosVenta);
    setFormDataModal(formData);
    setShowMoreMotivosModal(showMoreMotivos);
    setHorarioEditar(horario);
    setModalEditar(true);
  };

  const handleGuardarEdicionModal = async () => {
    if (!horarioEditar) return;

    const validationMessage = validateHorarioForm(formDataModal);
    if (validationMessage) {
      Modal.error({ title: 'Error de validación', content: validationMessage });
      return;
    }

    const { actividad, datosAPI, horaInicioDisplay, horaFinDisplay, puntoVentaNombre } =
      buildHorarioUpdatePayload(formDataModal, horarioEditar, puntosVenta);

    try {
      await updateHorarioInstructora(horarioEditar.id, datosAPI);

      setHorariosTodos((prev) => prev.map((horario) => {
        if (horario.id !== horarioEditar.id) {
          return horario;
        }

        return {
          ...horario,
          pdv: puntoVentaNombre,
          actividad,
          horaInicio: horaInicioDisplay,
          horaFin: horaFinDisplay,
          horas: horaInicioDisplay && horaFinDisplay
            ? (new Date(`2000-01-01T${horaFinDisplay}`) - new Date(`2000-01-01T${horaInicioDisplay}`)) / 3600000
            : 0,
          updatedAt: new Date().toISOString()
        };
      }));

      handleCerrarModal();
      Modal.success({ title: 'Éxito', content: 'Horario actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      Modal.error({
        title: 'Error',
        content: 'Error al guardar los cambios. Por favor intenta nuevamente.',
      });
    }
  };

  const handleDescargarExcel = () => {
    if (horariosTodos.length === 0) {
      Modal.warning({ title: 'Sin datos', content: 'No hay horarios para descargar' });
      return;
    }

    const totalCols = 2 + fechasSemana.length * 3;
    const fila0 = Array(totalCols).fill('');
    fila0[0] = 'HORARIOS SEMANALES';

    const fila1 = ['No.', 'NOMBRE INSTRUCTORA'];
    fechasSemana.forEach((fecha) => {
      fila1.push(
        `${fecha.toLocaleDateString('es-CO', { weekday: 'long' })} ${dayjs(fecha).format('DD/MM/YYYY')}`,
        '',
        ''
      );
    });

    const fila2 = ['', ''];
    fechasSemana.forEach(() => fila2.push('PDV', 'Motivo', 'Horario'));

    const filasData = datosSemanal.map((row) => {
      const dataRow = [row.numero, row.nombre];

      fechasSemana.forEach((fecha) => {
        const dayKey = `day_${fecha.getTime()}`;
        dataRow.push(
          row[`${dayKey}_pdv`] || '',
          row[`${dayKey}_motivo`] || '',
          row[`${dayKey}_horario_text`] || ''
        );
      });

      return dataRow;
    });

    const ws = XLSX.utils.aoa_to_sheet([fila0, fila1, fila2, ...filasData]);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
      { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } },
      ...fechasSemana.map((_, idx) => ({ s: { r: 1, c: 2 + idx * 3 }, e: { r: 1, c: 2 + idx * 3 + 2 } }))
    ];
    ws['!cols'] = [{ wch: 5 }, { wch: 32 }, ...fechasSemana.flatMap(() => [{ wch: 20 }, { wch: 22 }, { wch: 15 }])];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios Semanales');
    XLSX.writeFile(wb, `Horarios_Semanales_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.xlsx`);
    Modal.success({ title: 'Éxito', content: 'Archivo Excel descargado exitosamente' });
  };

  const handleDescargarPDF = () => {
    if (horariosTodos.length === 0) {
      Modal.warning({ title: 'Sin datos', content: 'No hay horarios para descargar' });
      return;
    }

    const thDias = fechasSemana.map((fecha) => (
      `<th colspan="3" class="vista-admin-print__header-day">${fecha.toLocaleDateString('es-CO', { weekday: 'long' })} ${dayjs(fecha).format('DD/MM/YYYY')}</th>`
    )).join('');

    const thSub = [
      '<th class="vista-admin-print__header-instructora-sub">No.</th>',
      '<th class="vista-admin-print__header-instructora-sub">NOMBRE INSTRUCTORA</th>',
      ...fechasSemana.flatMap(() => [
        '<th class="vista-admin-print__header-sub">PDV</th>',
        '<th class="vista-admin-print__header-sub">Motivo</th>',
        '<th class="vista-admin-print__header-sub">Horario</th>'
      ])
    ].join('');

    const tbody = datosSemanal.map((row, idx) => {
      const cells = [
        `<td class="vista-admin-print__cell vista-admin-print__cell--number">${row.numero}</td>`,
        `<td class="vista-admin-print__cell vista-admin-print__cell--name">${row.nombre}</td>`,
        ...fechasSemana.flatMap((fecha) => {
          const dayKey = `day_${fecha.getTime()}`;
          return [
            `<td class="vista-admin-print__cell">${row[`${dayKey}_pdv`] || ''}</td>`,
            `<td class="vista-admin-print__cell">${row[`${dayKey}_motivo`] || ''}</td>`,
            `<td class="vista-admin-print__cell vista-admin-print__cell--time">${row[`${dayKey}_horario_text`] || ''}</td>`
          ];
        })
      ].join('');

      return `<tr class="vista-admin-print__row vista-admin-print__row--${idx % 15}">${cells}</tr>`;
    }).join('');

    const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html>
<head>
  <title>Horarios Semanales Instructoras</title>
  ${documentStyles}
</head>
<body class="vista-admin-print">
  <h1 class="vista-admin-print__title">HORARIOS SEMANALES</h1>
  <div class="vista-admin-print__info">
    <strong>Generado:</strong> ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    &nbsp;|&nbsp; <strong>Instructoras:</strong> ${datosSemanal.length}
  </div>
  <table class="vista-admin-print__table">
    <thead>
      <tr>
        <th colspan="2" class="vista-admin-print__header-instructora">INSTRUCTORA</th>
        ${thDias}
      </tr>
      <tr>${thSub}</tr>
    </thead>
    <tbody>${tbody}</tbody>
  </table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="vista-admin-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="profile-button-avatar"
              onClick={() => setShowProfileModal(true)}
              title="Ver perfil"
            >
              {user?.foto ? (
                <img src={user.foto} alt="Perfil" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-initials">{getInitials(user?.nombre)}</div>
              )}
            </button>
            <div className="navbar-titles">
              <h1 className="navbar-title">Vista Administrativa</h1>
              <span className="navbar-subtitle">Gestión de Horarios de Instructoras</span>
            </div>
          </div>
          <div className="navbar-actions">
            <button
              className="btn-back"
              onClick={() => navigate('/menu')}
              title="Volver al inicio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-greeting">Hola, {user?.nombre || 'Administrador'}</h2>
          <p className="welcome-description">Gestión de Horarios de Instructoras</p>
        </div>

        <Card className="filters-card vista-admin-card-gap">
          <div className="vista-admin-week-nav">
            <Button icon={<LeftOutlined />} onClick={() => setSemanaLunes((prev) => shiftWeek(prev, -7))}>Anterior</Button>
            <DatePicker
              value={dayjs(semanaLunes)}
              onChange={(date) => date && setSemanaLunes(toMonday(date.toDate()))}
              format="DD/MM/YYYY"
              placeholder="Ir a fecha..."
              className="vista-admin-datepicker"
              allowClear={false}
            />
            <span className="vista-admin-week-label">{weekRangeLabel}</span>
            <Button onClick={() => setSemanaLunes((prev) => shiftWeek(prev, 7))}>Siguiente <RightOutlined /></Button>
          </div>

          <Space size="large" wrap className="vista-admin-filters-layout">
            <Space wrap>
              <Space>
                <label className="vista-admin-filter-label">Filtrar por Línea:</label>
                <Select
                  className="vista-admin-select vista-admin-select--linea"
                  value={lineaSeleccionada}
                  onChange={(value) => {
                    setLineaSeleccionada(value);
                    setInstructoraSeleccionada('todas');
                  }}
                  placeholder="Selecciona una línea"
                  options={LINEA_OPTIONS}
                />
              </Space>
              <Space>
                <label className="vista-admin-filter-label">Filtrar por Instructora:</label>
                <Select
                  className="vista-admin-select vista-admin-select--instructora"
                  value={instructoraSeleccionada}
                  onChange={setInstructoraSeleccionada}
                  placeholder="Selecciona una instructora"
                  options={instructoraOptions}
                />
              </Space>
            </Space>

            <Space>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleDescargarExcel}
                className="vista-admin-btn vista-admin-btn--excel"
              >
                Exportar Excel
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDescargarPDF}
                className="vista-admin-btn vista-admin-btn--pdf"
              >
                Descargar PDF
              </Button>
            </Space>
          </Space>
        </Card>

        <Card>
          <VistaAdministrativaTable
            dataSource={datosSemanal}
            fechasSemana={fechasSemana}
            onEditHorario={handleEditarHorario}
          />
        </Card>

        <Modal
          title="Perfil"
          open={showProfileModal}
          onCancel={() => setShowProfileModal(false)}
          footer={[
            <Button key="logout" danger onClick={handleLogout}>
              Cerrar Sesión
            </Button>,
          ]}
        >
          <div className="vista-admin-profile-content">
            <div className="profile-avatar-modal vista-admin-profile-avatar">
              {getInitials(user?.nombre)}
            </div>
            <h3 className="vista-admin-profile-name">{user?.nombre}</h3>
            <p className="vista-admin-profile-text"><strong>Cargo:</strong> {user?.cargo}</p>
            <p className="vista-admin-profile-text"><strong>Documento:</strong> {user?.documento}</p>
          </div>
        </Modal>

        <EditHorarioModal
          open={modalEditar}
          formData={formDataModal}
          motivoOptions={motivoOptions}
          pdvOptions={pdvOptions}
          showMoreMotivos={showMoreMotivosModal}
          onCancel={handleCerrarModal}
          onFieldChange={(field, value) => {
            setFormDataModal((prev) => ({ ...prev, [field]: value }));
            if (field === 'motivo' && EXPANDABLE_MOTIVOS.has(value)) {
              setShowMoreMotivosModal(true);
            }
          }}
          onSave={handleGuardarEdicionModal}
          onShowMoreMotivos={() => setShowMoreMotivosModal(true)}
        />
      </main>
    </div>
  );
}

export default VistaAdministrativa;

