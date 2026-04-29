import '../styles/formulario_inscripcion.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CafeInscripcionFormView from './forms/CafeInscripcionFormView';
import { useCafeInscripcionForm } from '../hooks/useCafeInscripcionForm';

function FormularioInscripcion({ onBack, onSubmit, coordinadoraData }) {
  const controller = useCafeInscripcionForm({
    tipoFormulario: 'heladeria',
    allowedWeekdays: [1, 5],
    maxInscripciones: 3,
    coordinadoraData,
    onSubmit,
  });

  return (
    <CafeInscripcionFormView
      variant="heladeria"
      title="ESCUELA DEL CAFE HELADERIA"
      maxInscripciones={3}
      showPuntosVentaModal
      onBack={onBack}
      {...controller}
    />
  );
}

export default FormularioInscripcion;
