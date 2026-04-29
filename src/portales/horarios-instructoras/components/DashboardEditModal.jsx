import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  MOTIVOS_BASICOS,
  MOTIVOS_LABELS,
  MOTIVOS_SIN_HORA,
} from './dashboard.helpers';

function DashboardEditModal({
  open,
  formData,
  puntosVenta,
  showMoreMotivos,
  onClose,
  onSave,
  onFieldChange,
  onSelectMotivo,
  onToggleMotivos,
}) {
  return (
    <Modal
      title="Editar Actividad"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancelar</Button>,
        <Button key="save" type="primary" onClick={onSave} className="dashboard-save-btn">
          Guardar Cambios
        </Button>,
      ]}
      centered
      width={700}
    >
      <Form layout="vertical" className="dashboard-edit-form">
        <Form.Item label="Punto de Venta">
          <Select
            value={formData.puntoVenta || undefined}
            onChange={(value) => onFieldChange('puntoVenta', value)}
            placeholder="Selecciona un punto de venta"
            size="large"
          >
            {puntosVenta.map((puntoVenta) => (
              <Select.Option key={puntoVenta.id} value={String(puntoVenta.id)}>
                {puntoVenta.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Space className="dashboard-edit-time-row">
          <Form.Item label="Hora Inicio" className="dashboard-edit-time-field">
            <Input
              type="time"
              value={formData.horaInicio}
              onChange={(event) => onFieldChange('horaInicio', event.target.value)}
              disabled={MOTIVOS_SIN_HORA.includes(formData.motivo)}
              size="large"
            />
          </Form.Item>
          <Form.Item label="Hora Fin" className="dashboard-edit-time-field">
            <Input
              type="time"
              value={formData.horaFin}
              onChange={(event) => onFieldChange('horaFin', event.target.value)}
              disabled={MOTIVOS_SIN_HORA.includes(formData.motivo)}
              size="large"
            />
          </Form.Item>
        </Space>

        <Form.Item label="Motivo">
          <Space wrap size="small" className="dashboard-motivos-space">
            {MOTIVOS_BASICOS.map((motivo) => (
              <Button
                key={motivo}
                type={formData.motivo === motivo ? 'primary' : 'default'}
                onClick={() => onSelectMotivo(motivo)}
                className={formData.motivo === motivo ? 'dashboard-motivo-btn dashboard-motivo-btn--active' : 'dashboard-motivo-btn'}
              >
                {MOTIVOS_LABELS[motivo]}
              </Button>
            ))}

            {showMoreMotivos && Object.entries(MOTIVOS_LABELS)
              .filter(([key]) => !MOTIVOS_BASICOS.includes(key))
              .map(([key, label]) => (
                <Button
                  key={key}
                  type={formData.motivo === key ? 'primary' : 'default'}
                  onClick={() => onSelectMotivo(key)}
                  className={formData.motivo === key ? 'dashboard-motivo-btn dashboard-motivo-btn--active' : 'dashboard-motivo-btn'}
                >
                  {label}
                </Button>
              ))}

            <Button type="link" onClick={onToggleMotivos} icon={showMoreMotivos ? <ChevronUp /> : <ChevronDown />}>
              {showMoreMotivos ? 'Ver menos' : 'Ver más opciones'}
            </Button>
          </Space>
        </Form.Item>

        {formData.motivo === 'cubrir_puesto' && (
          <Form.Item label="¿A quién vas a cubrir?">
            <Input
              value={formData.detalleCubrir}
              onChange={(event) => onFieldChange('detalleCubrir', event.target.value)}
              placeholder="Nombre de la persona"
              size="large"
            />
          </Form.Item>
        )}

        {formData.motivo === 'otro' && (
          <Form.Item label="Especifica el motivo">
            <Input
              value={formData.detalleOtro}
              onChange={(event) => onFieldChange('detalleOtro', event.target.value)}
              placeholder="Describe la actividad"
              size="large"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default DashboardEditModal;

