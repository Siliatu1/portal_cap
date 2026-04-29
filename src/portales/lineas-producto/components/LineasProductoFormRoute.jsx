import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { ADMIN_PANEL_QUERY_KEYS } from './adminPanel.helpers';
import EvaluacionTodera from './EvaluacionTodera';
import FormularioInscripcion from './FormularioInscripcion';
import FormularioPuntoVenta from './FormularioPuntoVenta';

const FORM_COMPONENTS = {
  heladeria: FormularioInscripcion,
  punto_venta: FormularioPuntoVenta,
  evaluacion_todera: EvaluacionTodera,
};

function LineasProductoFormRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tipo } = useParams();
  const { userData } = useAuth();
  const FormComponent = FORM_COMPONENTS[tipo] || FormularioInscripcion;

  const volverPanel = () => navigate('/portal/lineas-producto');

  const handleSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.inscripciones });
    queryClient.invalidateQueries({ queryKey: ADMIN_PANEL_QUERY_KEYS.evaluacionesTodera });
    volverPanel();
  };

  return (
    <FormComponent
      onBack={volverPanel}
      onSubmit={handleSubmit}
      coordinadoraData={userData}
    />
  );
}

export default LineasProductoFormRoute;
