import { Input, Modal, Select, Switch } from 'antd';
import { CATEGORIAS_INSTRUCTORAS, getCategoriaField } from '../adminPanel.helpers';

function NuevaInstructoraModal({ open, form, loading, onCancel, onOk, onChange }) {
  return (
    <Modal
      title="Agregar instructora"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={loading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <Input
          placeholder="Documento de la instructora"
          value={form.documento}
          onChange={(event) => onChange({ documento: event.target.value })}
        />
        <Input
          placeholder="Nombre de la instructora"
          value={form.nombre}
          onChange={(event) => onChange({ nombre: event.target.value })}
        />
        <Input
          placeholder="Telefono de la instructora"
          value={form.telefono}
          onChange={(event) => onChange({ telefono: event.target.value })}
        />
        <Input
          placeholder="Correo de la instructora"
          value={form.correo}
          onChange={(event) => onChange({ correo: event.target.value })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {CATEGORIAS_INSTRUCTORAS.map((categoria) => {
            const field = getCategoriaField(categoria);
            return (
              <div
                key={field}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontWeight: 500 }}>{categoria}</span>
                <Switch checked={form[field]} onChange={(checked) => onChange({ [field]: checked })} />
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
          }}
        >
          <span style={{ fontWeight: 500 }}>Habilitada</span>
          <Switch checked={form.habilitado} onChange={(checked) => onChange({ habilitado: checked })} />
        </div>
      </div>
    </Modal>
  );
}

function GestionInstructoraModal({
  open,
  form,
  pdvOptions,
  instructoras,
  loading,
  confirmLoading,
  onCancel,
  onOk,
  onChange,
}) {
  return (
    <Modal
      title="Gestion Instructoras"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={confirmLoading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <Select
          placeholder="Selecciona punto de venta"
          showSearch
          value={form.pdvId || undefined}
          onChange={(value) => onChange({ pdvId: value || '', instructoraId: '' })}
          filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
        >
          {pdvOptions.map((item) => (
            <Select.Option key={item.pdvId} value={String(item.pdvId)}>{item.puntoVenta}</Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Selecciona categoria"
          value={form.categoria || undefined}
          onChange={(value) => onChange({ categoria: value || '', instructoraId: '' })}
        >
          {CATEGORIAS_INSTRUCTORAS.map((categoria) => (
            <Select.Option key={categoria} value={categoria}>{categoria}</Select.Option>
          ))}
        </Select>

        <Select
          placeholder={form.categoria ? (loading ? 'Cargando...' : (instructoras.length === 0 ? 'Sin instructoras para esta categoria' : 'Selecciona instructora')) : 'Primero selecciona una categoria'}
          showSearch
          value={form.instructoraId || undefined}
          onChange={(value) => onChange({ instructoraId: value || '' })}
          loading={loading}
          disabled={!form.categoria || loading}
          filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
        >
          {[...instructoras]
            .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
            .map((item) => (
              <Select.Option key={item.id} value={String(item.id)}>
                {item.nombre} {item.habilitado ? '' : '(Inactiva)'}
              </Select.Option>
            ))}
        </Select>

        {form.categoria && !loading && instructoras.length === 0 && (
          <div style={{ color: '#faad14', fontSize: 12, marginTop: -8 }}>
            No hay instructoras con categoria {form.categoria} asignadas a este punto de venta.
          </div>
        )}
      </div>
    </Modal>
  );
}

function InstructorasModals({ forms, data, loading, onActions }) {
  return (
    <>
      <NuevaInstructoraModal
        open={forms.modalNuevaInstructoraVisible}
        form={forms.formNuevaInstructora}
        loading={loading.nuevaInstructora}
        onCancel={onActions.cerrarModalNuevaInstructora}
        onOk={onActions.crearInstructora}
        onChange={onActions.updateFormNuevaInstructora}
      />
      <GestionInstructoraModal
        open={forms.modalGestionVisible}
        form={forms.formGestion}
        pdvOptions={data.filterOptions.puntosVentaGestion}
        instructoras={data.instructorasFiltradas}
        loading={loading.instructorasFiltradas}
        confirmLoading={loading.instructorasDisponibles || loading.gestionInstructoras || loading.agregarInstructora}
        onCancel={onActions.cerrarModalGestionInstructoras}
        onOk={onActions.agregarInstructoraAPuntoVenta}
        onChange={onActions.updateFormGestion}
      />
    </>
  );
}

export default InstructorasModals;


