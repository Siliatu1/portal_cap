import '../styles/formulario_punto_venta.css';

import CafeInscripcionFormView from './forms/CafeInscripcionFormView';
import { useCafeInscripcionForm } from '../hooks/useCafeInscripcionForm';

function FormularioPuntoVenta({ onBack, onSubmit, coordinadoraData }) {
  const controller = useCafeInscripcionForm({
    tipoFormulario: 'punto_venta',
    allowedWeekdays: [2, 3, 4],
    maxInscripciones: 2,
    coordinadoraData,
    onSubmit,
  });

  return (
    <CafeInscripcionFormView
      variant="punto_venta"
      title="ESCUELA DEL CAFE PDV"
      dateDescription="Martes, Miercoles y Jueves"
      maxInscripciones={2}
      onBack={onBack}
      {...controller}
    />
  );
}

export default FormularioPuntoVenta;


