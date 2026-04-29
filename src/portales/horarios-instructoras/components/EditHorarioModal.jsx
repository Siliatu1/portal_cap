import { Button, Col, Form, Input, Modal, Row, Select } from 'antd';

function EditHorarioModal({
  open,
  formData,
  motivoOptions,
  pdvOptions,
  showMoreMotivos,
  onCancel,
  onFieldChange,
  onSave,
  onShowMoreMotivos,
}) {
  const showTimeFields = formData.motivo !== 'dia_descanso' && formData.motivo !== 'vacaciones';

  return (
    <Modal
      title="Editar Horario"
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSave}
          className="vista-admin-btn vista-admin-btn--pdf"
        >
          Guardar Cambios
        </Button>,
      ]}
    >
      <Form layout="vertical" className="vista-admin-form">
        <Form.Item label="Punto de Venta" required>
          <Select
            value={formData.puntoVenta}
            onChange={(value) => onFieldChange('puntoVenta', value)}
            placeholder="Selecciona un punto de venta"
            options={pdvOptions}
          />
        </Form.Item>

        {showTimeFields && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hora Inicio" required>
                <Input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(event) => onFieldChange('horaInicio', event.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Hora Fin" required>
                <Input
                  type="time"
                  value={formData.horaFin}
                  onChange={(event) => onFieldChange('horaFin', event.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item label="Motivo/Actividad" required>
          <Select
            value={formData.motivo}
            onChange={(value) => onFieldChange('motivo', value)}
            placeholder="Selecciona un motivo"
            options={motivoOptions}
          />
          {!showMoreMotivos && (
            <Button
              type="link"
              onClick={onShowMoreMotivos}
              className="vista-admin-link-button"
            >
              Ver más motivos
            </Button>
          )}
        </Form.Item>

        {formData.motivo === 'cubrir_puesto' && (
          <Form.Item label="¿A quién vas a cubrir?" required>
            <Input
              value={formData.detalleCubrir}
              onChange={(event) => onFieldChange('detalleCubrir', event.target.value)}
              placeholder="Nombre de la persona a cubrir"
            />
          </Form.Item>
        )}

        {formData.motivo === 'otro' && (
          <Form.Item label="Especifica cuál" required>
            <Input
              value={formData.detalleOtro}
              onChange={(event) => onFieldChange('detalleOtro', event.target.value)}
              placeholder="Describe la actividad"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default EditHorarioModal;

