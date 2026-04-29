import '../styles/formulario_inscripcion.css';

import EvaluacionToderaFormView from './forms/EvaluacionToderaFormView';
import { useEvaluacionToderaForm } from '../hooks/useEvaluacionToderaForm';

function EvaluacionTodera({ onBack, onSubmit, coordinadoraData }) {
  const controller = useEvaluacionToderaForm({ coordinadoraData, onSubmit });

  return (
    <EvaluacionToderaFormView
      onBack={onBack}
      {...controller}
    />
  );
}

export default EvaluacionTodera;


